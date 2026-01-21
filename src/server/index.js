const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// node-fetch 在 Node 18+ 不需要装也能用（自带 fetch）
// 你是 Node v24，直接用 global fetch 就行
// 如果你装了 node-fetch，也没关系，但这里我们用内置 fetch

const app = express();
app.use(cors());

const MID = 487404760;
const SERIES_ID = 3793757;

function normalizeCover(pic) {
  if (!pic) return "";
  if (pic.startsWith("//")) return `https:${pic}`;
  return pic;
}

app.get("/api/vpx-reading-club", async (req, res) => {
  try {
    // 先拿第一页，通常够用；后面想全量分页我再给你加
    const url = `https://api.bilibili.com/x/series/archives?mid=${MID}&series_id=${SERIES_ID}&pn=1&ps=50`;

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
      },
    });

    if (!r.ok) {
      return res.status(500).json({ videos: [], error: `Bili API HTTP ${r.status}` });
    }

    const json = await r.json();
    const archives = (json && json.data && json.data.archives) ? json.data.archives : [];

    const videos = archives.map((v) => ({
      bvid: v.bvid,
      title: v.title,
      cover: normalizeCover(v.pic),
      description: v.description || "",
      publishedAt: v.pubdate ? new Date(v.pubdate * 1000).toISOString() : null,
    }));

    res.json({ videos });
  } catch (e) {
    res.status(500).json({ videos: [], error: String(e) });
  }
});

app.get("/api/img", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== "string") {
      return res.status(400).send("Missing url");
    }

    // 基础安全：只允许 hdslb 图片域名（可按需放宽）
    const u = new URL(url);
    const host = u.hostname;
    if (!host.endsWith("hdslb.com") && !host.endsWith("biliimg.com")) {
      return res.status(403).send("Forbidden host");
    }

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
        // 有些 CDN 会看 referer，这里伪装成 bilibili 页面来源
        referer: "https://www.bilibili.com/",
      },
    });

    if (!r.ok) {
      return res.status(r.status).send(`Upstream HTTP ${r.status}`);
    }

    const contentType = r.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    // 缓存 1 天，减少重复请求
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).send(String(e));
  }
});


app.get("/api/vpx-news", (req, res) => {
  try {
    const filePath = path.resolve(process.cwd(), "data", "news.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    res.json({ news: Array.isArray(json.news) ? json.news : [] });
  } catch (e) {
    res.status(500).json({
      news: [],
      error: e?.message || "Failed to read news.json",
    });
  }
});

app.listen(3001, () => {
  console.log("API running: http://localhost:3001/api/vpx-reading-club");
});
