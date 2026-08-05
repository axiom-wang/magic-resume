import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

const CHUNK_RELOAD_KEY = "magic-resume:chunk-reload";
const CHUNK_RELOAD_COOLDOWN_MS = 10_000;

const CHUNK_LOAD_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Loading chunk [\w-]+ failed/i,
  /Unable to preload CSS/i
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown error";
}

function isChunkLoadError(message: string) {
  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function getLastChunkReload() {
  try {
    return Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY));
  } catch {
    return Number.NaN;
  }
}

function rememberChunkReload() {
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // Reload recovery still works when sessionStorage is unavailable.
  }
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const message = getErrorMessage(error);
  const chunkLoadFailed = isChunkLoadError(message);

  useEffect(() => {
    if (!chunkLoadFailed) {
      return;
    }

    const lastReload = getLastChunkReload();
    if (
      !Number.isFinite(lastReload) ||
      Date.now() - lastReload > CHUNK_RELOAD_COOLDOWN_MS
    ) {
      rememberChunkReload();
      window.location.reload();
    }
  }, [chunkLoadFailed]);

  const reload = () => {
    rememberChunkReload();
    reset();
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">页面加载失败</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {chunkLoadFailed
            ? "编辑器资源更新中，页面将自动刷新一次。若仍未恢复，请手动重新加载。"
            : "页面运行时遇到错误，请重新加载后再试。"}
        </p>

        {import.meta.env.DEV ? (
          <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-destructive">
            <code>{message}</code>
          </pre>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={reload}
          >
            重新加载
          </button>
          <a
            className="rounded-md border px-4 py-2 text-sm font-medium"
            href="/app/dashboard/resumes"
          >
            返回简历列表
          </a>
        </div>
      </section>
    </main>
  );
}
