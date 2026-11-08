import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default [
  { ignores: [".next/**", ".next-production/**", "node_modules/**", "docs/redesign-before/**", "outputs/**", "next-env.d.ts"] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // React Compiler rules introduced by eslint-plugin-react-hooks v7 (eslint-config-next 16).
      // Kept as warnings until existing components are refactored.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name=/^(booking|bookings)$/]",
          message: "Booking functionality is intentionally excluded from this project.",
        },
      ],
    },
  },
];
