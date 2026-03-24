import ast
import hashlib
import json
import os
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs
from urllib.parse import quote
from urllib.parse import urlparse
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
MEDIA_CRAWLER_DIR = Path(
    os.getenv(
        "MEDIACRAWLER_DIR",
        str((ROOT / "MediaCrawler") if (ROOT / "MediaCrawler").exists() else "/data3/yl/MediaCrawler"),
    )
)
RAW_JSON_DIR = MEDIA_CRAWLER_DIR / "data" / "xhs" / "json"

OUTPUT_NEWS_JSON = ROOT / "public" / "news.json"
NEWS_IMG_DIR = ROOT / "public" / "xhs_news_images"
NEWS_IMG_WEB_PREFIX = "/xhs_news_images"
NEWS_VIDEO_DIR = ROOT / "public" / "xhs_news_videos"
NEWS_VIDEO_WEB_PREFIX = "/xhs_news_videos"

CREATOR_ID_FILE = ROOT / "secrets" / "xhs_creator_id.txt"
CREATOR_URL_FILE = ROOT / "secrets" / "xhs_creator_url.txt"
SEARCH_KEYWORDS_FILE = ROOT / "secrets" / "xhs_search_keywords.txt"
TARGET_USER_ID_FILE = ROOT / "secrets" / "xhs_target_user_id.txt"
TARGET_NICKNAMES_FILE = ROOT / "secrets" / "xhs_target_nicknames.txt"
COOKIES_FILE = ROOT / "secrets" / "xhs_cookies.txt"

DEFAULT_SEARCH_KEYWORDS = [
    "VPX",
    "VPXer们的快乐科研生活",
]
DEFAULT_TARGET_USER_ID = "63428cc7000000001901f9a4"
DEFAULT_TARGET_NICKNAMES = [
    "VPXer们的快乐科研生活",
]


def to_iso_date(v):
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    if v is None:
        return now
    if isinstance(v, str) and not v.strip():
        return now

    if isinstance(v, datetime):
        dt = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        ts = int(float(v))
        if ts > 10**12:
            ts = ts / 1000
        return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        pass

    try:
        s = str(v).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
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


def split_list_value(raw: str) -> list[str]:
    if not raw:
        return []
    values = []
    for part in re.split(r"[\n,，]+", raw):
        s = part.strip()
        if s:
            values.append(s)
    return values


def unique_preserve_order(values: list[str]) -> list[str]:
    seen = set()
    unique = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        unique.append(value)
    return unique


def get_legacy_creator_target() -> str:
    return (
        os.getenv("XHS_CREATOR_URL", "").strip()
        or read_value_from_file(CREATOR_URL_FILE)
        or os.getenv("XHS_CREATOR_ID", "").strip()
        or read_value_from_file(CREATOR_ID_FILE)
    )


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


def derive_user_id_from_creator_target(value: str) -> str:
    s = str(value or "").strip()
    if not s:
        return ""
    if re.fullmatch(r"[0-9a-fA-F]{24}", s):
        return s
    if s.startswith(("http://", "https://")):
        user_id, _, _ = _extract_xhs_creator_url_parts(s)
        return user_id
    return ""


def get_runtime_config() -> dict:
    legacy_creator_target = get_legacy_creator_target()
    target_user_id = (
        os.getenv("XHS_TARGET_USER_ID", "").strip()
        or read_value_from_file(TARGET_USER_ID_FILE)
        or derive_user_id_from_creator_target(legacy_creator_target)
        or DEFAULT_TARGET_USER_ID
    )
    target_nicknames = unique_preserve_order(
        split_list_value(
            os.getenv("XHS_TARGET_NICKNAMES", "").strip()
            or read_value_from_file(TARGET_NICKNAMES_FILE)
        )
    ) or list(DEFAULT_TARGET_NICKNAMES)
    search_keywords = unique_preserve_order(
        split_list_value(
            os.getenv("XHS_SEARCH_KEYWORDS", "").strip()
            or read_value_from_file(SEARCH_KEYWORDS_FILE)
        )
    ) or list(DEFAULT_SEARCH_KEYWORDS)
    cookies = (
        os.getenv("XHS_COOKIES", "").strip()
        or read_value_from_file(COOKIES_FILE)
    )
    return {
        "legacy_creator_target": legacy_creator_target,
        "target_user_id": target_user_id,
        "target_nicknames": target_nicknames,
        "search_keywords": search_keywords,
        "cookies": cookies,
    }


def cleanup_previous_search_outputs(raw_dir: Path):
    raw_dir.mkdir(parents=True, exist_ok=True)
    removed = 0
    for path in raw_dir.glob("search_*.json"):
        path.unlink()
        removed += 1
    print(f"[XHS] cleared {removed} previous raw search JSON file(s) from {raw_dir}")


def run_mediacrawler_once(runtime_config: dict):
    cookies = runtime_config["cookies"]
    if not cookies:
        raise ValueError(
            "Missing cookies. Set env XHS_COOKIES or write it to secrets/xhs_cookies.txt"
        )
    if not runtime_config["search_keywords"]:
        raise ValueError(
            "Missing search keywords. Set XHS_SEARCH_KEYWORDS or write secrets/xhs_search_keywords.txt"
        )
    if not MEDIA_CRAWLER_DIR.exists():
        raise FileNotFoundError(f"MediaCrawler dir not found: {MEDIA_CRAWLER_DIR}")

    cleanup_previous_search_outputs(RAW_JSON_DIR)
    print("[XHS] pipeline mode: search -> raw json -> local filter")
    print(f"[XHS] search keywords: {runtime_config['search_keywords']}")
    print(f"[XHS] target user id: {runtime_config['target_user_id'] or '(none)'}")
    print(f"[XHS] target nicknames: {runtime_config['target_nicknames'] or '(none)'}")
    if runtime_config["legacy_creator_target"]:
        print(
            f"[XHS] legacy creator target (used only for user-id derivation): "
            f"{describe_creator_target(runtime_config['legacy_creator_target'])}"
        )
    cmd = [
        sys.executable,
        "main.py",
        "--platform",
        "xhs",
        "--lt",
        "cookie",
        "--type",
        "search",
        "--save_data_option",
        "json",
        "--save_data_path",
        "data",
        "--headless",
        "true",
        "--get_comment",
        "false",
        "--keywords",
        ",".join(runtime_config["search_keywords"]),
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


def find_latest_raw_json(raw_json_dir: Path) -> Path:
    files = list(raw_json_dir.glob("search_contents_*.json"))
    if not files:
        raise FileNotFoundError(f"No raw search JSON found in: {raw_json_dir}")
    return max(files, key=lambda p: p.stat().st_mtime)


def load_raw_notes(raw_json_path: Path) -> list[dict]:
    try:
        payload = json.loads(raw_json_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid raw JSON file {raw_json_path}: {e}") from e

    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        return [payload]
    raise ValueError(f"Unexpected raw JSON payload type in {raw_json_path}: {type(payload).__name__}")


def get_row_note_id(row: dict) -> str:
    return str(row.get("note_id", "") or row.get("笔记id", "")).strip()


def get_row_time_value(row: dict):
    return row.get("time", "") if row.get("time", "") != "" else row.get("上传时间", "")


def row_sort_key(row: dict) -> str:
    return to_iso_date(get_row_time_value(row))


def normalize_nickname(value: str) -> str:
    return re.sub(r"\s+", "", str(value or "")).casefold()


def has_vpx_signal(row: dict) -> bool:
    fields = [
        row.get("title", ""),
        row.get("desc", ""),
        row.get("tag_list", ""),
        row.get("source_keyword", ""),
        row.get("nickname", ""),
    ]
    haystack = " ".join(str(field or "") for field in fields)
    return re.search(r"vpx", haystack, flags=re.IGNORECASE) is not None


def row_matches_target(row: dict, runtime_config: dict) -> bool:
    target_user_id = str(runtime_config.get("target_user_id", "") or "").strip()
    target_nicknames = {
        normalize_nickname(value)
        for value in runtime_config.get("target_nicknames", [])
        if str(value or "").strip()
    }

    user_id = str(row.get("user_id", "") or "").strip()
    nickname = normalize_nickname(row.get("nickname", ""))

    if target_user_id and user_id == target_user_id:
        return True
    if target_nicknames and nickname in target_nicknames:
        return True
    if not target_user_id and not target_nicknames:
        return has_vpx_signal(row)
    return False


def summarize_candidate_authors(rows: list[dict], limit: int = 5) -> str:
    counter = Counter()
    for row in rows:
        nickname = str(row.get("nickname", "") or "(empty)").strip() or "(empty)"
        user_id = str(row.get("user_id", "") or "(empty)").strip() or "(empty)"
        counter[(nickname, user_id)] += 1
    if not counter:
        return "(none)"
    parts = []
    for (nickname, user_id), count in counter.most_common(limit):
        parts.append(f"{nickname} [{user_id}] x{count}")
    return "; ".join(parts)


def filter_and_dedupe_raw_notes(raw_notes: list[dict], runtime_config: dict) -> list[dict]:
    filtered = [row for row in raw_notes if row_matches_target(row, runtime_config)]
    deduped = {}
    for row in filtered:
        note_id = get_row_note_id(row)
        if not note_id:
            continue
        previous = deduped.get(note_id)
        if not previous or row_sort_key(row) >= row_sort_key(previous):
            deduped[note_id] = row
    return list(deduped.values())


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


def export_news_json(raw_json_path: Path, out_json_path: Path, runtime_config: dict):
    raw_notes = load_raw_notes(raw_json_path)
    if not raw_notes:
        raise ValueError(f"Raw search JSON is empty: {raw_json_path}")

    filtered_rows = filter_and_dedupe_raw_notes(raw_notes, runtime_config)
    if not filtered_rows:
        raise ValueError(
            "No searched notes matched the local filter. "
            f"target_user_id={runtime_config.get('target_user_id') or '(none)'} "
            f"target_nicknames={runtime_config.get('target_nicknames') or '(none)'} "
            f"candidate_authors={summarize_candidate_authors(raw_notes)}"
        )

    news = []
    for row in filtered_rows:
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
    print(
        f"Exported {len(news)} items from {len(filtered_rows)} filtered / "
        f"{len(raw_notes)} raw search records -> {out_json_path}"
    )


def main():
    runtime_config = get_runtime_config()
    if os.getenv("SKIP_MEDIACRAWLER", "").strip().lower() not in ("1", "true", "yes"):
        run_mediacrawler_once(runtime_config)
    else:
        print("== 1) SKIP_MEDIACRAWLER enabled, skip crawling ==")

    if not RAW_JSON_DIR.exists():
        raise FileNotFoundError(f"MediaCrawler raw JSON dir not found: {RAW_JSON_DIR}")
    print("== 2) Finding latest raw search JSON ==")
    latest_raw_json = find_latest_raw_json(RAW_JSON_DIR)
    print(f"Using latest raw JSON: {latest_raw_json}")
    print("== 3) Filtering raw notes and exporting news.json ==")
    export_news_json(latest_raw_json, OUTPUT_NEWS_JSON, runtime_config)


if __name__ == "__main__":
    main()
