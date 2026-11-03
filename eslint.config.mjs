import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { rules: { "no-console": ["error", { allow: ["warn", "error"] }] } },
  {
    ignores: [
      ".next/**",
      "out/**",
      "public/pagefind/**",
      "next-env.d.ts",
      ".agents/**",
      ".claude/**",
    ],
  },
];

export default config;
