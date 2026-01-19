export async function onRequestGet({ request }) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) return new Response("Missing url", { status: 400 });

  const u = new URL(url);
  const host = u.hostname;

  // 基础安全：只允许 B站图片域名
  if (!host.endsWith("hdslb.com") && !host.endsWith("biliimg.com")) {
    return new Response("Forbidden host", { status: 403 });
  }

  const r = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
      referer: "https://www.bilibili.com/",
    },
  });

  if (!r.ok) return new Response(`Upstream HTTP ${r.status}`, { status: r.status });

  return new Response(r.body, {
    headers: {
      "content-type": r.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=86400",
    },
  });
}
