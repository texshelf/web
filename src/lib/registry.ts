import { existsSync, readFileSync } from "node:fs";

export interface Artifact {
  url: string;
  sha256: string;
  size: number;
}

export interface Variable {
  prompt: string;
  default: string;
  files: string[];
}

export interface Version {
  version: string;
  published: string;
  entrypoint: string;
  compiler?: string;
  bib?: string;
  shell_escape?: boolean;
  variables?: Record<string, Variable>;
  tarball: Artifact;
  zip: Artifact;
  preview?: string;
  thumbnail?: string;
  files: string[];
}

export interface Template {
  name: string;
  engine: "latex" | "typst";
  title: string;
  description: string;
  authors: string[];
  license: string;
  repository?: string;
  keywords: string[];
  categories: string[];
  official: boolean;
  verified: boolean;
  universe?: string;
  latest: string;
  updated: string;
  versions: Version[];
}

const file = (name: string) => new URL(`../../public/v1/${name}`, import.meta.url);

const index = JSON.parse(readFileSync(file("index.json"), "utf8"));
const stats = existsSync(file("stats.json"))
  ? JSON.parse(readFileSync(file("stats.json"), "utf8"))
  : { templates: {} };

export const templates: Template[] = index.templates;

export function stars(name: string): number {
  return stats.templates?.[name]?.stars ?? 0;
}

export function downloads(name: string): number {
  return stats.templates?.[name]?.downloads ?? 0;
}

export function latest(t: Template): Version {
  return t.versions.find((v) => v.version === t.latest) ?? t.versions[0];
}

/** Path on this site for a file the index lists by absolute URL. */
export function local(url: string): string {
  const at = url.indexOf("/v1/");
  return at === -1 ? url : url.slice(at);
}

export function command(t: Template): string {
  return t.engine === "typst" ? "typshelf" : "texshelf";
}

export function editorLink(t: Template, v: Version): { label: string; href: string } | null {
  if (t.engine === "latex") {
    const engine = v.compiler && v.compiler !== "pdflatex" ? `&engine=${v.compiler}` : "";
    return {
      label: "Open in Overleaf",
      href: `https://www.overleaf.com/docs?snip_uri=${v.zip.url}${engine}`,
    };
  }
  if (t.universe) {
    return {
      label: "Open in the Typst app",
      href: `https://typst.app/?template=${t.universe}&version=latest`,
    };
  }
  return null;
}

export const engineName = { latex: "LaTeX", typst: "Typst" } as const;

export function kilobytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} kB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
