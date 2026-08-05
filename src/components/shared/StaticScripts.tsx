import {
  Asset,
  useRouter,
  useRouterState
} from "@tanstack/react-router";
import type { RouterManagedTag } from "@tanstack/react-router";
import { Fragment, createElement } from "react";

type RouterScript = Extract<RouterManagedTag, { tag: "script" }>;

function getStaticModuleSource(children: unknown) {
  if (typeof children !== "string") {
    return null;
  }

  const match = children.match(/^import\((['"])([^'"]+)\1\)$/);
  return match?.[2] ?? null;
}

/**
 * TanStack Start emits the client entry as an inline dynamic import. Rendering
 * that same entry as a regular module script avoids browsers that reject every
 * dynamic import while preserving the framework's script ordering.
 */
export function StaticScripts() {
  const router = useRouter();
  const nonce = router.options.ssr?.nonce;
  const matches = useRouterState({
    select: (state) => state.matches
  });
  const manifest = router.ssr?.manifest;
  const assetScripts: RouterScript[] = [];

  if (manifest) {
    matches
      .map((match) => router.looseRoutesById[match.routeId])
      .forEach((route) => {
        manifest.routes[route.id]?.assets?.forEach((asset) => {
          if (asset.tag === "script") {
            assetScripts.push({
              tag: "script",
              attrs: { ...asset.attrs, nonce },
              children: asset.children
            });
          }
        });
      });
  }

  const scripts: RouterManagedTag[] = matches.flatMap((match) =>
    (match.scripts ?? []).flatMap((script): RouterManagedTag[] => {
      if (!script) {
        return [];
      }

      const { children, ...attrs } = script;
      return [
        {
          tag: "script",
          attrs: {
            ...attrs,
            suppressHydrationWarning: true,
            nonce
          },
          children: typeof children === "string" ? children : undefined
        }
      ];
    })
  );

  let serverBufferedScript;
  if (router.serverSsr) {
    serverBufferedScript = router.serverSsr.takeBufferedScripts();
  }

  const staticAssetScripts: RouterManagedTag[] = assetScripts.map((asset) => {
    const src = getStaticModuleSource(asset.children);
    if (!src) {
      return asset;
    }

    return {
      ...asset,
      attrs: { ...asset.attrs, src },
      children: undefined
    };
  });
  const allScripts = [...scripts, ...staticAssetScripts];

  if (serverBufferedScript) {
    allScripts.unshift(serverBufferedScript);
  }

  return (
    <Fragment>
      {allScripts.map((asset, index) =>
        createElement(Asset, {
          ...asset,
          key: `tsr-scripts-${asset.tag}-${index}`
        })
      )}
    </Fragment>
  );
}
