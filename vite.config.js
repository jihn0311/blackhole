import { defineConfig } from "vite";
import { adminPlugin } from "./server/adminPlugin.js";
export default defineConfig({
  plugins: [adminPlugin()],
  server: { host: "127.0.0.1" },
});
