import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tex.jjsm.science",
  trailingSlash: "ignore",
  build: { format: "directory" },
});
