import type { CapacitorConfig } from "@capacitor/cli";

// Native shell config for the Customer app (parents). Native-first per the
// decision recorded in docs/ARCHITECTURE.md -- Capacitor wraps the same
// React/Vite codebase instead of a rewrite. webDir points at the Vite
// production build; FIGMA_PUBLIC_URL must be unset for native builds (that
// env var only applies to the GitHub Pages web staging build, which still
// exists separately -- see .github/workflows/deploy-pages.yml).
const config: CapacitorConfig = {
  appId: "app.mombestie.customer",
  appName: "MomBestie",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
