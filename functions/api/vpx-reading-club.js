export async function onRequestGet() {
  const MID = 487404760;
  const SERIES_ID = 3793757;

  const url = `https://api.bilibili.com/x/series/archives?mid=${MID}&series_id=${SERIES_ID}&pn=1&ps=50`;

  const r = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    },
  });

  if (!r.ok) {
    return new Response(JSON.stringify({ videos: [], error: `Bili API HTTP ${r.status}` }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const json = await r.json();
  const archives = json?.data?.archives ?? [];

  const videos = archives.map((v) => ({
    bvid: v.bvid,
    title: v.title,
    cover: (v.pic || "").startsWith("//") ? `https:${v.pic}` : v.pic,
    description: v.description || "",
    publishedAt: v.pubdate ? new Date(v.pubdate * 1000).toISOString() : null,
  }));

  // 1小时缓存 + 可陈旧刷新（省请求、速度快）
  return new Response(JSON.stringify({ videos }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
