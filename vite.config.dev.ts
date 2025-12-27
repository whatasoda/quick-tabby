import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  root: "src/dev",
  build: {
    outDir: "../../dist-dev",
  },
  server: {
    port: 5174,
  },
});
