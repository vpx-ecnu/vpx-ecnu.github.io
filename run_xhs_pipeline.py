import os
import json
import subprocess
from pathlib import Path
from datetime import datetime
import hashlib
import ast
import re
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

import pandas as pd


# =========================
# Paths (repo structure)
# =========================
ROOT = Path(__file__).resolve().parent
SPIDER_DIR = ROOT / "Spider_XHS"
EXCEL_DIR = SPIDER_DIR / "datas" / "excel_datas"

# 你的 news.json 输出在 public 里（前端可直接读到）
OUTPUT_NEWS_JSON = ROOT / "public" / "news.json"

# ✅ 新增：图片保存目录（public 下，前端能直接访问）
NEWS_IMG_DIR = ROOT / "public" / "xhs_news_images"
NEWS_IMG_WEB_PREFIX = "/xhs_news_images"


# =========================
# Helpers
# =========================
def load_dotenv_if_exists(env_path: Path):
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        os.environ.setdefault(k, v)


def to_iso_date(v):
    now = datetime.utcnow().isoformat() + "Z"
    if v is None:
        return now
    if isinstance(v, str) and not v.strip():
        return now

    try:
        ts = int(float(v))
        if ts > 10**12:  # ms
            ts = ts / 1000
        return datetime.utcfromtimestamp(ts).isoformat() + "Z"
    except Exception:
        pass

    try:
        d = pd.to_datetime(v, utc=True, errors="coerce")
        if pd.isna(d):
            return now
        return d.to_pydatetime().isoformat().replace("+00:00", "Z")
    except Exception:
        return now


def parse_images(row: dict):
    imgs = row.get("图片地址url列表", "")
    if imgs is None:
        return []
    if isinstance(imgs, list):
        return [str(x) for x in imgs if x]
    if isinstance(imgs, str):
        s = imgs.strip()
        if not s:
            return []
        try:
            lst = ast.literal_eval(s)
            if isinstance(lst, list):
                return [str(x) for x in lst if x]
        except Exception:
            return []
    return []


def pick_cover(row: dict):
    cover = row.get("视频封面url", "")
    if isinstance(cover, str) and cover.strip():
        return cover.strip()
    images = parse_images(row)
    return images[0] if images else ""


def find_latest_xlsx(excel_dir: Path) -> Path:
    files = list(excel_dir.glob("*.xlsx"))
    if not files:
        raise FileNotFoundError(f"No .xlsx found in: {excel_dir}")
    return max(files, key=lambda p: p.stat().st_mtime)


def safe_filename(s: str, max_len: int = 60) -> str:
    s = s.strip()
    s = re.sub(r"[^\w\-\.\u4e00-\u9fff]+", "_", s)
    s = s.strip("_")
    return s[:max_len] if len(s) > max_len else s


def download_one_image(url: str, note_id: str, idx: int) -> str:
    """
    下载单张图片到 public/xhs_news_images
    成功返回 web 路径：/xhs_news_images/xxx.jpg
    失败返回空字符串
    """
    if not url or not isinstance(url, str):
        return ""

    NEWS_IMG_DIR.mkdir(parents=True, exist_ok=True)

    # hash 防重名
    h = hashlib.md5(url.encode("utf-8")).hexdigest()[:10]
    filename = f"{note_id}_{idx}_{h}.jpg"
    filepath = NEWS_IMG_DIR / filename

    # 已存在直接复用
    if filepath.exists() and filepath.stat().st_size > 0:
        return f"{NEWS_IMG_WEB_PREFIX}/{filename}"

    # 请求头：尽量模拟浏览器
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
            # 关键：很多 CDN 会看 Referer（防盗链）
            # 这里伪装来自 xiaohongshu
            "Referer": "https://www.xiaohongshu.com/",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    )

    try:
        with urlopen(req, timeout=30) as resp:
            content = resp.read()
        with open(filepath, "wb") as f:
            f.write(content)
        return f"{NEWS_IMG_WEB_PREFIX}/{filename}"
    except (HTTPError, URLError, TimeoutError) as e:
        print(f"⚠️ download failed: {url} -> {e}")
        return ""
    except Exception as e:
        print(f"⚠️ download failed: {url} -> {e}")
        return ""


def localize_images(note_id: str, cover_url: str, image_urls: list[str]):
    """
    把 cover/images 下载到本地，并返回本地路径列表。
    下载失败的保留远程 url（保证数据不中断）。
    """
    local_images = []
    for i, u in enumerate(image_urls):
        local = download_one_image(u, note_id, i)
        local_images.append(local if local else u)

    # cover 优先单独下载（用 idx=0 也行，这里用 idx=999 区分）
    local_cover = download_one_image(cover_url, note_id, 999) if cover_url else ""
    if not local_cover:
        # 如果 cover 下载失败：退化为第一张图（可能是本地也可能是远程）
        local_cover = local_images[0] if local_images else cover_url

    return local_cover, local_images


def export_news_json(xlsx_path: Path, out_json_path: Path):
    df = pd.read_excel(xlsx_path).fillna("")

    news = []
    for _, row_ in df.iterrows():
        row = row_.to_dict()
        desc = row.get("描述", "")

        images = parse_images(row)
        cover = pick_cover(row)

        note_id = str(row.get("笔记id", "")).strip() or "unknown"

        # ✅ 关键：下载并替换成本地路径
        cover_local, images_local = localize_images(note_id, cover, images)

        item = {
            "id": note_id,
            "title": str(row.get("标题", "")),
            "date": to_iso_date(row.get("上传时间", "")),
            "image": cover_local,
            "images": images_local,
            "sub_title": "",
            "description": str(desc) if desc is not None else "",
            "source": "xhs",
            "source_url": str(row.get("笔记url", "")),
        }

        if isinstance(desc, str) and desc.strip():
            item["sub_title"] = (desc[:80] + "…") if len(desc) > 80 else desc.strip()
        else:
            item["sub_title"] = "—"

        news.append(item)

    out_json_path.parent.mkdir(parents=True, exist_ok=True)
    out_json_path.write_text(
        json.dumps({"news": news}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"✅ Exported {len(news)} items")
    print(f"✅ Wrote: {out_json_path}")
    print(f"✅ Images saved to: {NEWS_IMG_DIR}")


def run_spider():
    load_dotenv_if_exists(SPIDER_DIR / ".env")
    print("== 1) Running Spider_XHS/main.py ==")
    subprocess.run(["python", "main.py"], cwd=str(SPIDER_DIR), check=True)


def main():
    if not SPIDER_DIR.exists():
        raise FileNotFoundError(f"Spider_XHS not found: {SPIDER_DIR}")
    EXCEL_DIR.mkdir(parents=True, exist_ok=True)

    run_spider()

    print("== 2) Finding latest xlsx ==")
    latest_xlsx = find_latest_xlsx(EXCEL_DIR)
    print(f"✅ Latest xlsx: {latest_xlsx}")

    print("== 3) Exporting news.json + downloading images ==")
    export_news_json(latest_xlsx, OUTPUT_NEWS_JSON)


if __name__ == "__main__":
    main()
