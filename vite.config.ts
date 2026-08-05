import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
    // Some managed Chromium environments reject dynamic module imports even
    // when Vite serves the module successfully. Disabling HMR also removes the
    // React Refresh dynamic bootstrap used only during local development.
    hmr: false
  },
  optimizeDeps: {
    include: ["react-day-picker"],
    exclude: ["pdfjs-dist"]
  },
  ssr: {
    noExternal: ["pdfjs-dist"]
  },
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routesDirectory: "routes",
        // Keep local route components in the main module graph so navigation
        // never depends on a runtime `import()` request. Production retains
        // normal code splitting to avoid increasing the deployed first load.
        ...(command === "serve"
          ? { codeSplittingOptions: { defaultBehavior: [] } }
          : {})
      }
    }),
    viteReact()
  ]
}));
