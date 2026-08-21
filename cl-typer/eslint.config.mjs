import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app currently reads/writes a localStorage-backed mock store
      // (src/lib/store.ts) that stands in for a real backend. Syncing that
      // browser-only state into React state on mount is the standard,
      // hydration-safe pattern for it - downgrade to a warning rather than
      // rewriting the mock layer with useSyncExternalStore. Revisit once
      // this is replaced by real data fetching from Supabase.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
