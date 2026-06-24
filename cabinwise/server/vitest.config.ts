import { defineConfig } from "vitest/config";

// Local config so vitest doesn't walk up into the parent repo's vite config.
export default defineConfig({
  test: {
    root: ".",
    include: ["src/**/*.test.ts"],
  },
});
