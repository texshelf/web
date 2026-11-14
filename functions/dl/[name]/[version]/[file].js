const ARCHIVE = /\.(tar\.gz|zip)$/;

const COUNT = `
  INSERT INTO downloads (name, version, count) VALUES (?1, ?2, 1)
  ON CONFLICT (name, version) DO UPDATE SET count = count + 1
`;

function archive({ params, request, env }) {
  const { name, version, file } = params;
  if (!ARCHIVE.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  const url = new URL(request.url);
  url.pathname = `/v1/t/${name}/${version}/${file}`;
  return env.ASSETS.fetch(new Request(url, request));
}

export const onRequestHead = archive;

export async function onRequestGet(context) {
  const { params, env, waitUntil } = context;
  const { name, version } = params;
  const asset = await archive(context);

  if (asset.status === 200 && env.DB) {
    waitUntil(
      env.DB.prepare(COUNT)
        .bind(name, version)
        .run()
        .catch((err) => console.error("download not counted", err)),
    );
  }
  return asset;
}
