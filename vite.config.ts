// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel, VERCEL=1 is set automatically at build time.
// We use the "vercel" Nitro preset so the output lands in .vercel/output
// which is exactly what Vercel's build system expects.
const isVercel = process.env.VERCEL === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // When deploying on Vercel, override the default cloudflare-module preset.
  // In the Lovable sandbox (no VERCEL env var), nitro is handled automatically.
  ...(isVercel && {
    nitro: {
      preset: "vercel",
    },
  }),
});
