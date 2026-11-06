import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { ignores: [".next/**", ".next-production/**", "node_modules/**", "docs/redesign-before/**", "outputs/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
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
