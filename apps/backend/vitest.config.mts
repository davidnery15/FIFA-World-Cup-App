import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "src/app.ts",
        "src/controllers/**/*.ts",
        "src/middlewares/**/*.ts",
        "src/models/**/*.ts",
        "src/routes/**/*.ts",
        "src/schemas/**/*.ts",
      ],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
