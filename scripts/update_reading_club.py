# scripts/update_reading_club.py
import json
import os
import re
import hashlib
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.parse import urlencode

MID = 487404760
SERIES_ID = 3793757

PS = 50
MAX_PAGES = 10  # 安全上限：一般 1-3 页就够了

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


def clean_title(title: str) -> str:
    # 统一去掉标题中的“研讨会”
    t = (title or "").replace("研讨会", "")
    # 清理多余空白，避免出现连续空格
    t = re.sub(r"\s{2,}", " ", t).strip()
    return t


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


def build_api_url(pn: int, ps: int) -> str:
    base = "https://api.bilibili.com/x/series/archives"
    qs = urlencode({"mid": MID, "series_id": SERIES_ID, "pn": pn, "ps": ps})
    return f"{base}?{qs}"


def fetch_all_archives():
    """
    分页拉取 series archives，直到没有数据或达到 MAX_PAGES。
    返回：(archives_list, total_from_api)
    """
    all_archives = []
    seen = set()
    total = None

    for pn in range(1, MAX_PAGES + 1):
        url = build_api_url(pn, PS)
        data = fetch_json(url)

        # B站标准返回：code=0 才成功
        if data.get("code") != 0:
            raise RuntimeError(f"Bili API error: code={data.get('code')} msg={data.get('message')} url={url}")

        d = data.get("data") or {}
        if total is None:
            # B站当前把总数放在 data.page.total；兼容旧字段。
            page = d.get("page") if isinstance(d.get("page"), dict) else {}
            for candidate in (d.get("total"), d.get("total_count"), page.get("total")):
                if isinstance(candidate, int) and not isinstance(candidate, bool):
                    total = candidate
                    break

        archives = d.get("archives") or []
        if not archives:
            break

        # 去重（按 bvid）
        added_this_page = 0
        for v in archives:
            bvid = v.get("bvid")
            if not bvid or bvid in seen:
                continue
            seen.add(bvid)
            all_archives.append(v)
            added_this_page += 1

        # 如果这一页一个都没新增，说明后面也不会有了（防止接口偶发重复）
        if added_this_page == 0:
            break

        # 如果我们已经达到 total（有 total 的情况下）
        if isinstance(total, int) and len(all_archives) >= total:
            break

    return all_archives, total


def load_existing_payload():
    try:
        with open(OUT_JSON, "r", encoding="utf-8") as f:
            payload = json.load(f)
    except FileNotFoundError:
        return None
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        print(f"Warning: could not read existing {OUT_JSON}: {exc}")
        return None

    if not isinstance(payload, dict) or not isinstance(payload.get("updatedAt"), str):
        return None
    return payload


def content_without_timestamp(payload):
    if not isinstance(payload, dict):
        return payload
    return {key: value for key, value in payload.items() if key != "updatedAt"}


def main():
    archives, total = fetch_all_archives()

    if not archives:
        raise RuntimeError("Bili API returned no archives; refusing to replace existing data")
    if isinstance(total, int) and len(archives) < total:
        raise RuntimeError(
            f"Bili API returned an incomplete series: expected {total}, fetched {len(archives)}"
        )

    videos = []
    for v in archives:
        bvid = v.get("bvid")
        title = clean_title(v.get("title", ""))
        desc = v.get("description", "") or ""
        cover_remote = normalize_cover(v.get("pic", ""))

        cover_local = download_cover(cover_remote, bvid, title)

        videos.append({
            "bvid": bvid,
            "title": title,
            "description": desc,
            "cover": cover_local,             # 本地路径
            "cover_remote": cover_remote,     # 远程地址（排查用）
            "publishedAt": iso_from_pubdate(v["pubdate"]) if v.get("pubdate") else None,
            "url": f"https://www.bilibili.com/video/{bvid}" if bvid else "",
        })

    content = {
        "source": {
            "mid": MID,
            "series_id": SERIES_ID,
            "api": "x/series/archives",
            "ps": PS,
            "max_pages": MAX_PAGES,
            "total_from_api": total,
        },
        "videos": videos,
    }

    existing_payload = load_existing_payload()
    if content_without_timestamp(existing_payload) == content:
        print(f"No Reading Club content changes; kept existing {OUT_JSON}")
        print(f"Covers verified in {COVER_DIR}")
        return

    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        **content,
    }

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(videos)} videos to {OUT_JSON}")
    print(f"Covers saved to {COVER_DIR}")
    if isinstance(total, int):
        print(f"API total={total}, fetched={len(videos)}, missing={max(0, total - len(videos))}")


if __name__ == "__main__":
    main()
