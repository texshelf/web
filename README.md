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
| `/dl/<name>/<version>/<file>` | `functions/dl/` | Serves an archive from `/v1` and counts the download |
| `/api/downloads` | `functions/api/downloads.js` | Download totals per template, as JSON |

## Download counts

The index lists archives under `/dl/`, so the CLI, the Download tab and Overleaf
all pass through the counter. It is a Pages Function that adds one to a row in
a D1 database named `texshelf-downloads` and then returns the file from `/v1`.
The nightly deploy reads `/api/downloads` and writes the totals into
`stats.json`, so the numbers on the site and in `texshelf search --sort downloads`
are at most a day old.

The table is created by `migrations/0001_downloads.sql`:

```console
npx wrangler d1 migrations apply texshelf-downloads --remote
```

To try it locally, run `npx wrangler d1 migrations apply texshelf-downloads --local`
once, then `npx wrangler pages dev dist`.

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
