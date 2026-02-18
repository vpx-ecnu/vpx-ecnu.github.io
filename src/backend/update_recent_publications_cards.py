import hashlib
import json
import mimetypes
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

MAX_ITEMS = 6
TIMEOUT_SECONDS = 20
PRIORITY_KEYWORDS = ("overview", "method")


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def clean_text(text: str) -> str:
    return " ".join((text or "").split()).strip()


def _dedupe_keep_order(values):
    seen = set()
    result = []
    for v in values:
        if not v or v in seen:
            continue
        seen.add(v)
        result.append(v)
    return result


def resolve_image_candidates(page_url: str, src: str):
    src = clean_text(src)
    src = src.replace("\\", "/")
    if not src:
        return []

    parsed = urlparse(page_url)
    base_with_slash = page_url if page_url.endswith("/") else page_url + "/"
    candidates = []

    # Standard URL resolution
    candidates.append(urljoin(base_with_slash, src))

    # Some sites use root-like relative paths without leading slash, e.g. "projects/..."
    # For project pages hosted under subpaths, try domain-root fallback as well.
    if not src.startswith(("http://", "https://", "//", "/")):
        candidates.append(f"{parsed.scheme}://{parsed.netloc}/{src.lstrip('/')}")

    # Extra fallback for GitHub Pages project sites:
    # If src starts with "/" and page is "/project-name", try "/project-name/..."
    if src.startswith("/") and parsed.path not in ("", "/"):
        project_prefix = parsed.path.rstrip("/")
        candidates.append(f"{parsed.scheme}://{parsed.netloc}{project_prefix}{src}")

    return _dedupe_keep_order(candidates)


def _score_img_tag(img_tag) -> int:
    score = 0
    alt_text = clean_text(img_tag.get("alt", "")).lower()
    src_text = clean_text(img_tag.get("src", "")).lower()

    for kw in PRIORITY_KEYWORDS:
        if kw in alt_text:
            score += 10
        if kw in src_text:
            score += 6

    parent_text = clean_text(img_tag.parent.get_text(" ", strip=True) if img_tag.parent else "").lower()
    for kw in PRIORITY_KEYWORDS:
        if kw in parent_text:
            score += 4

    # Favor meaningful content images over tiny icons
    width = str(img_tag.get("width", "")).strip()
    height = str(img_tag.get("height", "")).strip()
    try:
        if int(width) >= 300 or int(height) >= 180:
            score += 2
    except Exception:
        pass

    return score


def find_first_image_urls(page_url: str):
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(page_url, timeout=TIMEOUT_SECONDS, headers=headers)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # Primary: rank all images, prioritize ones near overview/method context
    ranked = []
    for img in soup.find_all("img"):
        src = (
            img.get("src")
            or img.get("data-src")
            or img.get("data-original")
            or ""
        )
        if not src:
            continue
        ranked.append((_score_img_tag(img), src))

    ranked.sort(key=lambda x: x[0], reverse=True)
    for _, src in ranked:
        candidates = resolve_image_candidates(page_url, src)
        if candidates:
            return candidates

    # Fallback: og:image
    og = soup.find("meta", attrs={"property": "og:image"})
    if og and og.get("content"):
        return resolve_image_candidates(page_url, og["content"])

    return []


def pick_ext(image_url: str, content_type: str) -> str:
    parsed_ext = Path(urlparse(image_url).path).suffix.lower()
    if parsed_ext in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}:
        return parsed_ext
    guessed = mimetypes.guess_extension((content_type or "").split(";")[0].strip())
    return guessed if guessed else ".jpg"


def download_image_to_public(image_url: str, image_dir: Path) -> str:
    if not image_url:
        return ""

    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(image_url, timeout=TIMEOUT_SECONDS, headers=headers)
    resp.raise_for_status()

    ext = pick_ext(image_url, resp.headers.get("Content-Type", ""))
    digest = hashlib.md5(image_url.encode("utf-8")).hexdigest()[:12]
    filename = f"{digest}{ext}"
    out_path = image_dir / filename
    out_path.write_bytes(resp.content)

    return f"/publications/recent_images/{filename}"


def load_publications(path: Path):
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    return data if isinstance(data, list) else []


def load_existing_recent_cards(path: Path):
    if not path.exists():
        return []
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    cards = payload.get("publications") if isinstance(payload, dict) else []
    return cards if isinstance(cards, list) else []


def main():
    root = repo_root()
    source_path = root / "public" / "publications" / "publication_updated.json"
    output_path = root / "public" / "publications" / "recent_publications.json"
    image_dir = root / "public" / "publications" / "recent_images"
    image_dir.mkdir(parents=True, exist_ok=True)

    pubs = load_publications(source_path)
    with_web = [p for p in pubs if clean_text(p.get("project_webpage", ""))]
    with_web.sort(key=lambda x: (int(x.get("year") or 0), clean_text(x.get("title", ""))), reverse=True)
    fallback_selected = with_web[:MAX_ITEMS]
    existing_cards = load_existing_recent_cards(output_path)
    warn_count = 0

    cards = []
    seen_urls = set()
    next_id = 1

    # First pass: skip failed webpages and keep trying later ones to fill MAX_ITEMS
    for pub in with_web:
        if len(cards) >= MAX_ITEMS:
            break

        title = clean_text(pub.get("title", ""))
        venue = clean_text(pub.get("journal", ""))
        webpage = clean_text(pub.get("project_webpage", ""))
        if not webpage or webpage in seen_urls:
            continue
        seen_urls.add(webpage)

        image_path = "/placeholder.svg"
        image_ok = False
        if webpage:
            try:
                image_candidates = find_first_image_urls(webpage)
                if not image_candidates:
                    warn_count += 1
                    print(f"[WARN] no image candidates found for {webpage}")
                candidate_failures = []
                for first_img_url in image_candidates:
                    try:
                        local_img = download_image_to_public(first_img_url, image_dir)
                        if local_img:
                            image_path = local_img
                            image_ok = True
                            break
                    except Exception as e:
                        candidate_failures.append((first_img_url, e))
                if (not image_ok) and candidate_failures:
                    warn_count += 1
                    failed_url, failed_err = candidate_failures[0]
                    print(f"[WARN] image candidate failed for {webpage}: {failed_url} -> {failed_err}")
            except Exception as e:
                warn_count += 1
                print(f"[WARN] image fetch failed for {webpage}: {e}")

        # If this webpage has no usable image, skip it and try next paper.
        if not image_ok:
            continue

        cards.append(
            {
                "id": f"recent-{next_id}",
                "title": title,
                "venue": venue,
                "url": webpage,
                "image": image_path,
            }
        )
        next_id += 1

    # Second pass fallback: if still not enough, fill with first 6 having webpage.
    if len(cards) < MAX_ITEMS:
        for pub in fallback_selected:
            if len(cards) >= MAX_ITEMS:
                break
            webpage = clean_text(pub.get("project_webpage", ""))
            if not webpage or any(x.get("url") == webpage for x in cards):
                continue
            cards.append(
                {
                    "id": f"recent-{next_id}",
                    "title": clean_text(pub.get("title", "")),
                    "venue": clean_text(pub.get("journal", "")),
                    "url": webpage,
                    "image": "/placeholder.svg",
                }
            )
            next_id += 1

    # Final fallback strategy for automation:
    # if any warning happened and existing file exists, keep old file unchanged.
    if warn_count > 0 and existing_cards:
        print(
            f"[WARN] detected {warn_count} warnings, keep existing recent_publications.json unchanged."
        )
        return

    payload = {"updatedAt": datetime.utcnow().isoformat() + "Z", "publications": cards}
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated recent publication cards: {output_path} (total={len(cards)})")


if __name__ == "__main__":
    main()
