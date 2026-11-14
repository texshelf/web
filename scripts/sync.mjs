import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const what = process.argv[2] ?? "all";

function need(dir, hint) {
  if (!existsSync(dir)) {
    console.error(`${dir} does not exist. ${hint}`);
    process.exit(1);
  }
  return dir;
}

function brand() {
  const from = need(
    resolve(process.env.BRAND_DIR ?? join(root, "..", "brand")),
    "Clone https://github.com/texshelf/brand next to this folder, or set BRAND_DIR.",
  );
  const logos = join(root, "public", "brand");
  rmSync(logos, { recursive: true, force: true });
  mkdirSync(logos, { recursive: true });
  cpSync(join(from, "logo"), logos, { recursive: true });
  cpSync(join(from, "tokens.css"), join(root, "src", "styles", "tokens.css"));
  console.log(`brand copied from ${from}`);
}

function registry() {
  const from = need(
    resolve(process.env.REGISTRY_DIST ?? join(root, "..", "dist", "v1")),
    "Build it with `texshelf-registry build --out ../dist/v1` in the registry folder, or set REGISTRY_DIST.",
  );
  const to = join(root, "public", "v1");
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`registry output copied from ${from}`);
}

if (what === "brand" || what === "all") brand();
if (what === "registry" || what === "all") registry();
