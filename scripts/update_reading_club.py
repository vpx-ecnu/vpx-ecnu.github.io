import json
import os
import re
import hashlib
from datetime import datetime, timezone
from urllib.request import Request, urlopen

MID = 487404760
SERIES_ID = 3793757
PS = 50

OUT_JSON = "src/data/readingClub.json"
COVER_DIR = "public/reading_club_covers"  # 本地封面目录

def fetch_json(url: str):
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
            "Referer": "https://www.bilibili.com/",
        },
    )
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def normalize_cover(pic: str) -> str:
    if not pic:
        return ""
    if pic.startswith("//"):
        return "https:" + pic
    return pic

def safe_filename(name: str) -> str:
    name = re.sub(r"[^\w\-\.\u4e00-\u9fff]+", "_", name).strip("_")
    return name[:80] if len(name) > 80 else name

def download_cover(url: str, bvid: str, title: str) -> str:
    """
    下载封面到 public/reading_club_covers
    返回前端可用的相对路径：/reading_club_covers/xxx.jpg
    """
    if not url or not bvid:
        return ""

    os.makedirs(COVER_DIR, exist_ok=True)

    # 文件名：bvid + hash，避免重名/特殊字符问题
    h = hashlib.md5(url.encode("utf-8")).hexdigest()[:10]
    base = safe_filename(title) or bvid
    filename = f"{bvid}_{h}_{base}.jpg"
    filepath = os.path.join(COVER_DIR, filename)

    # 已存在就不重复下载
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        return f"/reading_club_covers/{filename}"

    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
            "Referer": "https://www.bilibili.com/",
        },
    )
    with urlopen(req, timeout=30) as resp:
        content = resp.read()

    with open(filepath, "wb") as f:
        f.write(content)

    return f"/reading_club_covers/{filename}"

def iso_from_pubdate(pubdate: int) -> str:
    dt = datetime.fromtimestamp(pubdate, tz=timezone.utc)
    return dt.isoformat()

def main():
    url = f"https://api.bilibili.com/x/series/archives?mid={MID}&series_id={SERIES_ID}&pn=1&ps={PS}"
    data = fetch_json(url)
    archives = (data.get("data") or {}).get("archives") or []

    videos = []
    for v in archives:
        bvid = v.get("bvid")
        title = v.get("title", "")
        desc = v.get("description", "") or ""
        cover_remote = normalize_cover(v.get("pic", ""))

        # 关键：下载到本地，cover 写成站内路径
        cover_local = download_cover(cover_remote, bvid, title)

        videos.append({
            "bvid": bvid,
            "title": title,
            "description": desc,
            "cover": cover_local,             # ✅ 本地路径
            "cover_remote": cover_remote,     # 可选：保留远程地址便于排查
            "publishedAt": iso_from_pubdate(v["pubdate"]) if v.get("pubdate") else None,
            "url": f"https://www.bilibili.com/video/{bvid}" if bvid else "",
        })

    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": {"mid": MID, "series_id": SERIES_ID, "api": "x/series/archives"},
        "videos": videos,
    }

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(videos)} videos to {OUT_JSON}")
    print(f"Covers saved to {COVER_DIR}")

if __name__ == "__main__":
    main()
