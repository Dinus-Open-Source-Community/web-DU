import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** Flat config from eslint-config-next (avoids FlatCompat circular JSON error on ESLint 9). */
const coreWebVitals = require("eslint-config-next/core-web-vitals");

const eslintConfig = [
  ...coreWebVitals,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // React 19 / plugin hooks: pola load-on-mount + sync form ke dialog masih valid; aturan ini membanjiri false positive.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
