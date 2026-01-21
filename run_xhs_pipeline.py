import os
import json
import subprocess
from pathlib import Path
from datetime import datetime

import pandas as pd
import ast


# =========================
# Paths (repo structure)
# =========================
ROOT = Path(__file__).resolve().parent                 # repo root
SPIDER_DIR = ROOT / "Spider_XHS"                       # Spider_XHS folder
EXCEL_DIR = SPIDER_DIR / "datas" / "excel_datas"       # where xlsx saved
OUTPUT_NEWS_JSON = ROOT / "src" / "server" / "data" / "news.json"  # site data


# =========================
# Helpers
# =========================
def load_dotenv_if_exists(env_path: Path):
    """
    Minimal .env loader: reads KEY=VALUE lines into os.environ if not already set.
    (No external dependency needed.)
    """
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        # don't overwrite existing env
        os.environ.setdefault(k, v)


def to_iso_date(v):
    """Convert uploaded time into ISO string. Fallback to current UTC time."""
    now = datetime.utcnow().isoformat() + "Z"

    if v is None:
        return now
    if isinstance(v, str) and not v.strip():
        return now

    # 1) numeric timestamp (seconds/milliseconds)
    try:
        ts = int(float(v))
        if ts > 10**12:  # ms
            ts = ts / 1000
        return datetime.utcfromtimestamp(ts).isoformat() + "Z"
    except Exception:
        pass

    # 2) pandas parse
    try:
        d = pd.to_datetime(v, utc=True, errors="coerce")
        if pd.isna(d):
            return now
        return d.to_pydatetime().isoformat().replace("+00:00", "Z")
    except Exception:
        return now


def parse_images(row: dict):
    """
    Parse images from column '图片地址url列表' into list[str].
    The cell is usually a string like "['url1','url2']".
    """
    imgs = row.get("图片地址url列表", "")
    if imgs is None:
        return []

    if isinstance(imgs, list):
        return [str(x) for x in imgs if x]

    if isinstance(imgs, str):
        s = imgs.strip()
        if not s:
            return []
        # safer than eval
        try:
            lst = ast.literal_eval(s)
            if isinstance(lst, list):
                return [str(x) for x in lst if x]
        except Exception:
            return []

    return []


def pick_cover(row: dict):
    """
    Pick cover image:
    1) '视频封面url' if exists
    2) else first image in images[]
    """
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


def export_news_json(xlsx_path: Path, out_json_path: Path):
    df = pd.read_excel(xlsx_path).fillna("")

    news = []
    for _, row_ in df.iterrows():
        row = row_.to_dict()
        desc = row.get("描述", "")

        images = parse_images(row)
        cover = pick_cover(row)

        # 兼容你的前端字段：
        # - image: 封面
        # - images: 全图列表（详情页拼贴墙）
        # - source: xhs
        # - source_url: 笔记url
        item = {
            "id": str(row.get("笔记id", "")),
            "title": str(row.get("标题", "")),
            "date": to_iso_date(row.get("上传时间", "")),
            "image": cover,
            "images": images,
            "sub_title": "",
            "description": str(desc) if desc is not None else "",
            "source": "xhs",
            "source_url": str(row.get("笔记url", "")),
        }

        # sub_title 做个截断摘要
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


def run_spider():
    """
    Run Spider_XHS/main.py in its own working dir.
    If Spider_XHS uses .env, load it first.
    """
    # load Spider_XHS/.env if exists (local dev)
    load_dotenv_if_exists(SPIDER_DIR / ".env")

    # Some spiders expect env var name, adjust if you know exact one:
    # os.environ.setdefault("COOKIES", os.environ.get("XHS_COOKIES", ""))
    # os.environ.setdefault("XHS_COOKIE", os.environ.get("XHS_COOKIES", ""))

    print("== 1) Running Spider_XHS/main.py ==")
    subprocess.run(["python", "main.py"], cwd=str(SPIDER_DIR), check=True)


def main():
    # sanity check
    if not SPIDER_DIR.exists():
        raise FileNotFoundError(f"Spider_XHS not found: {SPIDER_DIR}")
    if not EXCEL_DIR.exists():
        # spider may create it, but usually exists
        EXCEL_DIR.mkdir(parents=True, exist_ok=True)

    run_spider()

    print("== 2) Finding latest xlsx ==")
    latest_xlsx = find_latest_xlsx(EXCEL_DIR)
    print(f"✅ Latest xlsx: {latest_xlsx}")

    print("== 3) Exporting news.json ==")
    export_news_json(latest_xlsx, OUTPUT_NEWS_JSON)


if __name__ == "__main__":
    main()
