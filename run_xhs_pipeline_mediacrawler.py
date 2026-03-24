import ast
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs
from urllib.parse import quote
from urllib.parse import urlparse
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import pandas as pd


ROOT = Path(__file__).resolve().parent
MEDIA_CRAWLER_DIR = Path(
    os.getenv(
        "MEDIACRAWLER_DIR",
        str((ROOT / "MediaCrawler") if (ROOT / "MediaCrawler").exists() else "/data3/yl/MediaCrawler"),
    )
)
EXCEL_DIR = MEDIA_CRAWLER_DIR / "data" / "xhs"

OUTPUT_NEWS_JSON = ROOT / "public" / "news.json"
NEWS_IMG_DIR = ROOT / "public" / "xhs_news_images"
NEWS_IMG_WEB_PREFIX = "/xhs_news_images"
NEWS_VIDEO_DIR = ROOT / "public" / "xhs_news_videos"
NEWS_VIDEO_WEB_PREFIX = "/xhs_news_videos"

CREATOR_ID_FILE = ROOT / "secrets" / "xhs_creator_id.txt"
CREATOR_URL_FILE = ROOT / "secrets" / "xhs_creator_url.txt"
COOKIES_FILE = ROOT / "secrets" / "xhs_cookies.txt"


def to_iso_date(v):
    now = datetime.utcnow().isoformat() + "Z"
    if v is None:
        return now
    if isinstance(v, str) and not v.strip():
        return now

    try:
        ts = int(float(v))
        if ts > 10**12:
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


def read_value_from_file(path: Path) -> str:
    if not path.exists():
        return ""
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        return s
    return ""


def get_runtime_credentials():
    creator_target = (
        os.getenv("XHS_CREATOR_URL", "").strip()
        or read_value_from_file(CREATOR_URL_FILE)
        or os.getenv("XHS_CREATOR_ID", "").strip()
        or read_value_from_file(CREATOR_ID_FILE)
    )
    cookies = (
        os.getenv("XHS_COOKIES", "").strip()
        or read_value_from_file(COOKIES_FILE)
    )
    return creator_target, cookies


def _extract_xhs_creator_url_parts(value: str):
    parsed = urlparse(value)
    path_parts = [part for part in parsed.path.split("/") if part]
    if len(path_parts) < 3 or path_parts[:2] != ["user", "profile"]:
        return "", "", ""
    params = parse_qs(parsed.query)
    user_id = path_parts[2].strip()
    xsec_token = (params.get("xsec_token") or [""])[0].strip()
    xsec_source = (params.get("xsec_source") or [""])[0].strip()
    return user_id, xsec_token, xsec_source


def describe_creator_target(value: str) -> str:
    s = str(value or "").strip()
    if not s:
        return "missing"
    if re.fullmatch(r"[0-9a-fA-F]{24}", s):
        return f"bare user_id ({s[:6]}...{s[-4:]})"
    if s.startswith(("http://", "https://")):
        user_id, xsec_token, xsec_source = _extract_xhs_creator_url_parts(s)
        if not user_id:
            return "creator URL in unexpected format"
        token_state = "yes" if xsec_token else "no"
        source_state = xsec_source or "(missing)"
        return (
            f"profile URL user_id={user_id} "
            f"has_xsec_token={token_state} xsec_source={source_state}"
        )
    return "unrecognized format"


def validate_creator_target(value: str) -> str:
    s = str(value or "").strip()
    if not s:
        raise ValueError(
            "Missing creator target. Set XHS_CREATOR_URL (recommended) or "
            "XHS_CREATOR_ID, or write it to secrets/xhs_creator_url.txt / "
            "secrets/xhs_creator_id.txt"
        )

    if re.fullmatch(r"[0-9a-fA-F]{24}", s):
        raise ValueError(
            "XHS creator target is currently a bare user_id. MediaCrawler now "
            "needs the full creator profile URL including xsec_token and "
            "xsec_source to fetch creator posts. Update GitHub secret "
            "XHS_CREATOR_URL (recommended) or XHS_CREATOR_ID to a full URL "
            "copied from the creator homepage address bar."
        )

    parsed = urlparse(s)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(
            "Invalid XHS creator target. Expected a full creator profile URL "
            "like https://www.xiaohongshu.com/user/profile/<id>?xsec_token=...&xsec_source=..."
        )

    user_id, xsec_token, xsec_source = _extract_xhs_creator_url_parts(s)
    if not user_id:
        raise ValueError(
            "Invalid XHS creator URL path. Expected /user/profile/<id> in the URL."
        )
    if not xsec_token or not xsec_source:
        raise ValueError(
            "XHS creator URL is missing xsec_token or xsec_source. Open the "
            "creator homepage in a logged-in browser and copy the full URL "
            "from the address bar."
        )

    return s


def run_mediacrawler_once():
    creator_target_raw, cookies = get_runtime_credentials()
    creator_target = validate_creator_target(creator_target_raw)
    if not cookies:
        raise ValueError(
            "Missing cookies. Set env XHS_COOKIES or write it to secrets/xhs_cookies.txt"
        )
    if not MEDIA_CRAWLER_DIR.exists():
        raise FileNotFoundError(f"MediaCrawler dir not found: {MEDIA_CRAWLER_DIR}")

    print(f"[XHS] creator target: {describe_creator_target(creator_target)}")
    cmd = [
        sys.executable,
        "main.py",
        "--platform",
        "xhs",
        "--lt",
        "cookie",
        "--type",
        "creator",
        "--save_data_option",
        "excel",
        "--save_data_path",
        "data",
        "--headless",
        "true",
        "--creator_id",
        creator_target,
        "--cookies",
        cookies,
    ]
    print("== 1) Running MediaCrawler ==")
    subprocess.run(cmd, cwd=str(MEDIA_CRAWLER_DIR), check=True)


def parse_image_list(raw):
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip()]

    s = str(raw).strip()
    if not s:
        return []

    # list-like string: "['a','b']"
    try:
        parsed = ast.literal_eval(s)
        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed if str(x).strip()]
    except Exception:
        pass

    # comma-separated string: "a,b,c"
    if "," in s:
        return [x.strip() for x in s.split(",") if x.strip()]

    return [s]


def parse_video_list(raw):
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip()]

    s = str(raw).strip()
    if not s:
        return []

    try:
        parsed = ast.literal_eval(s)
        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed if str(x).strip()]
    except Exception:
        pass

    if "," in s:
        return [x.strip() for x in s.split(",") if x.strip()]

    return [s]


def extract_vpx_tail(text: str) -> str:
    s = str(text or "")
    m = re.search(r"[#＃]\s*vpx\b", s, flags=re.IGNORECASE)
    if not m:
        return ""
    tail = s[m.end():].strip()
    # Strip leftover separators/topic markers right after hashtag, e.g.:
    # "【话题】#vpx# News..." -> "News..."
    tail = re.sub(r"^(?:【\s*话题\s*】|\[\s*话题\s*\]|【\s*topic\s*】|\[\s*topic\s*\])\s*", "", tail, flags=re.IGNORECASE)
    tail = re.sub(r"^[#＃\s:：,，;；|/\\\-]+", "", tail)
    tail = re.sub(r"\s+", " ", tail)
    return tail


def translate_to_english(text: str) -> str:
    s = str(text or "").strip()
    if not s:
        return ""
    try:
        url = (
            "https://translate.googleapis.com/translate_a/single"
            f"?client=gtx&sl=auto&tl=en&dt=t&q={quote(s)}"
        )
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        translated = "".join(part[0] for part in payload[0] if part and part[0])
        return translated.strip() if translated.strip() else s
    except Exception as e:
        print(f"[WARN] translate failed, fallback to source text: {e}")
        return s


def download_one_image(url: str, note_id: str, idx: int) -> str:
    if not url or not isinstance(url, str):
        return ""

    NEWS_IMG_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:10]
    filename = f"{note_id}_{idx}_{digest}.jpg"
    filepath = NEWS_IMG_DIR / filename

    if filepath.exists() and filepath.stat().st_size > 0:
        return f"{NEWS_IMG_WEB_PREFIX}/{filename}"

    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
            "Referer": "https://www.xiaohongshu.com/",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    )

    try:
        with urlopen(req, timeout=30) as resp:
            content = resp.read()
        filepath.write_bytes(content)
        return f"{NEWS_IMG_WEB_PREFIX}/{filename}"
    except (HTTPError, URLError, TimeoutError) as e:
        print(f"[WARN] download failed: {url} -> {e}")
        return ""
    except Exception as e:
        print(f"[WARN] download failed: {url} -> {e}")
        return ""


def localize_images(note_id: str, images: list[str]):
    localized = []
    for i, u in enumerate(images):
        local = download_one_image(u, note_id, i)
        localized.append(local if local else u)
    cover = localized[0] if localized else ""
    return cover, localized


def _guess_video_ext(url: str) -> str:
    path = urlparse(url).path or ""
    ext = Path(path).suffix.lower()
    if ext in {".mp4", ".mov", ".webm", ".m4v"}:
        return ext
    return ".mp4"


def download_one_video(url: str, note_id: str, idx: int) -> str:
    if not url or not isinstance(url, str):
        return ""

    NEWS_VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:10]
    ext = _guess_video_ext(url)
    filename = f"{note_id}_{idx}_{digest}{ext}"
    filepath = NEWS_VIDEO_DIR / filename

    if filepath.exists() and filepath.stat().st_size > 0:
        return f"{NEWS_VIDEO_WEB_PREFIX}/{filename}"

    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
            "Referer": "https://www.xiaohongshu.com/",
            "Accept": "*/*",
        },
    )

    try:
        with urlopen(req, timeout=60) as resp:
            content = resp.read()
        filepath.write_bytes(content)
        return f"{NEWS_VIDEO_WEB_PREFIX}/{filename}"
    except (HTTPError, URLError, TimeoutError) as e:
        print(f"[WARN] video download failed: {url} -> {e}")
        return ""
    except Exception as e:
        print(f"[WARN] video download failed: {url} -> {e}")
        return ""


def localize_videos(note_id: str, videos: list[str]):
    localized = []
    for i, u in enumerate(videos):
        local = download_one_video(u, note_id, i)
        localized.append(local if local else u)
    primary = localized[0] if localized else ""
    return primary, localized


def find_latest_xlsx(excel_dir: Path) -> Path:
    files = list(excel_dir.glob("*.xlsx"))
    if not files:
        raise FileNotFoundError(f"No .xlsx found in: {excel_dir}")
    return max(files, key=lambda p: p.stat().st_mtime)


def map_row_to_news(row: dict):
    note_id = str(row.get("note_id", "") or row.get("笔记id", "")).strip() or "unknown"
    desc = str(row.get("desc", "") or row.get("描述", "")).strip()
    source_url = str(row.get("note_url", "") or row.get("笔记url", "")).strip()
    time_val = row.get("time", "") if row.get("time", "") != "" else row.get("上传时间", "")

    images_raw = row.get("image_list", "") if row.get("image_list", "") != "" else row.get("图片地址url列表", "")
    images = parse_image_list(images_raw)
    cover_local, images_local = localize_images(note_id, images)
    videos_raw = (
        row.get("video_url", "")
        if row.get("video_url", "") != ""
        else (row.get("视频地址url", "") if row.get("视频地址url", "") != "" else row.get("video_addr", ""))
    )
    videos = parse_video_list(videos_raw)
    video_local, videos_local = localize_videos(note_id, videos)

    # 规则：
    # 1) 如果 desc 含 #vpx，则取其后的文本并翻译成英文放在 title（不含 #vpx）。
    # 2) 如果不含 #vpx，title 置空。
    # 3) 所有帖子都清空 sub_title/description，只保留标题 + 媒体。
    vpx_tail = extract_vpx_tail(desc)
    translated_title = translate_to_english(vpx_tail) if vpx_tail else ""
    final_title = translated_title or ""

    return {
        "id": note_id,
        "title": final_title,
        "date": to_iso_date(time_val),
        "image": cover_local,
        "images": images_local,
        "sub_title": "",
        "description": "",
        "source": "xhs",
        "source_url": source_url,
        "video": video_local,
        "videos": videos_local,
    }


def export_news_json(xlsx_path: Path, out_json_path: Path):
    df = pd.read_excel(xlsx_path).fillna("")
    news = []
    for _, row_ in df.iterrows():
        row = row_.to_dict()
        news.append(map_row_to_news(row))

    # optional: sort by date desc
    news.sort(
        key=lambda x: datetime.fromisoformat(x["date"].replace("Z", "+00:00"))
        if isinstance(x.get("date"), str)
        else datetime.min,
        reverse=True,
    )

    out_json_path.parent.mkdir(parents=True, exist_ok=True)
    out_json_path.write_text(
        json.dumps({"news": news}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Exported {len(news)} items -> {out_json_path}")


def main():
    if os.getenv("SKIP_MEDIACRAWLER", "").strip().lower() not in ("1", "true", "yes"):
        run_mediacrawler_once()
    else:
        print("== 1) SKIP_MEDIACRAWLER enabled, skip crawling ==")

    if not EXCEL_DIR.exists():
        raise FileNotFoundError(f"MediaCrawler excel dir not found: {EXCEL_DIR}")
    print("== 2) Finding latest xlsx ==")
    latest_xlsx = find_latest_xlsx(EXCEL_DIR)
    print(f"Using latest xlsx: {latest_xlsx}")
    print("== 3) Exporting news.json + downloading images ==")
    export_news_json(latest_xlsx, OUTPUT_NEWS_JSON)


if __name__ == "__main__":
    main()
