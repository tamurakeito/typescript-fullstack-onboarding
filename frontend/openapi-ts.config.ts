import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.yaml",
  output: "src/client",
  plugins: [
    "zod",
    "@tanstack/react-query",
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/hey-api.ts",
    },
    {
      name: "@hey-api/sdk",
      validator: true,
    },
  ],
});
