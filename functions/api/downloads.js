export async function onRequestGet({ env }) {
  const totals = {};
  if (env.DB) {
    const { results } = await env.DB.prepare(
      "SELECT name, SUM(count) AS total FROM downloads GROUP BY name",
    ).all();
    for (const row of results) {
      totals[row.name] = row.total;
    }
  }
  return Response.json(totals, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
