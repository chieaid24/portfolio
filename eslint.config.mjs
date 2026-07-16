import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // react-hooks v6 rules new in eslint-config-next 16; existing code
    // predates them — keep as warnings until the patterns are migrated
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/public/**",
      // sibling worktrees live under .worktrees/ and carry their own source;
      // linting them makes results depend on which branches exist on disk
      "**/.worktrees/**",
      // gitignored scratch for browser probe runners; not shipped source
      "**/.playwright-mcp/**",
    ],
  },
];

export default eslintConfig;
