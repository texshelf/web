# texshelf website

The site at [tex.jjsm.science](https://tex.jjsm.science). It is a static
[Astro](https://astro.build) site generated from the registry's `index.json`,
and it also serves the registry output itself under `/v1/`: the index, the
archives and the PDF previews that the CLI downloads.

## Run it locally

The site needs two things that live outside this repository: the brand files
and a built registry. Check out the sibling repositories next to this one:

```
texshelf/
├── brand/
├── registry/
├── texshelf/
└── web/
```

Then build the registry output once and start the dev server:

```console
cd ../registry
cargo run --manifest-path ../texshelf/Cargo.toml --bin texshelf-registry -- build --out ../dist/v1
cd ../web
npm install
npm run dev
```

`npm run dev` and `npm run build` first copy `../brand` into `public/brand` and
`src/styles/tokens.css`, and `../dist/v1` into `public/v1`. Set `BRAND_DIR` or
`REGISTRY_DIST` to use other locations. The copies are ignored by Git; change
colours and logos in the brand repository.

## Pages

| Path | Source | Contents |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Every template on a shelf, with search, engine, category and sort controls that run in the browser |
| `/t/<name>` | `src/pages/t/[name].astro` | Preview, the commands to use the template, license and file list |
| `/docs` | `src/pages/docs.astro` | Install and usage |
| `/v1/*` | copied from the registry build | `index.json`, `stats.json`, archives, previews |

## Deploying

`.github/workflows/deploy.yml` runs on every push here, on every push to the
registry (which calls it), and once a night to refresh star counts. It builds
the registry output in a TeX Live container, builds the site, and publishes
`dist/` to the Cloudflare Pages project `texshelf`.

It needs two organization secrets: `CLOUDFLARE_API_TOKEN`, with the
"Cloudflare Pages: Edit" permission, and `CLOUDFLARE_ACCOUNT_ID`.

To publish by hand from a machine that is logged in to Wrangler:

```console
npm run build
npm run deploy
```

## License

MIT.
