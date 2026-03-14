import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    environmentMatchGlobs: [
      // Data tests don't need DOM
      ["src/lib/__tests__/*.test.ts", "node"],
      ["scripts/**/*.test.ts", "node"],
    ],
  },
});
