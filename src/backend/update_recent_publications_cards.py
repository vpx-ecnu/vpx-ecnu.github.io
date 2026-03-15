import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from publication_card_images import (
    clean_text,
    inspect_webpage,
    select_publication_card_asset,
)

MAX_ITEMS = 6


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


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
    page_catalog_cache = {}
    reserved_source_urls_by_page = defaultdict(set)
    dead_pages = set()

    # First pass: skip failed webpages and keep trying later ones to fill MAX_ITEMS
    for pub in with_web:
        if len(cards) >= MAX_ITEMS:
            break

        title = clean_text(pub.get("title", ""))
        venue = clean_text(pub.get("journal", ""))
        webpage = clean_text(pub.get("project_webpage", ""))
        year = int(pub.get("year") or 0)
        if not webpage or webpage in seen_urls:
            continue

        try:
            catalog = page_catalog_cache.get(webpage)
            if catalog is None:
                catalog = inspect_webpage(webpage)
                page_catalog_cache[webpage] = catalog

            asset = select_publication_card_asset(
                catalog,
                publication_title=title,
                publication_year=year,
                image_dir=image_dir,
                reserved_source_urls=reserved_source_urls_by_page[webpage],
                prefer_video=True,
            )
            if asset and asset.status_code == 404:
                print(f"[INFO] skip dead project webpage: {webpage}")
                dead_pages.add(webpage)
                continue
            if not asset:
                warn_count += 1
                print(f"[WARN] no usable publication media found for {webpage}")
                continue
        except Exception as e:
            warn_count += 1
            print(f"[WARN] media fetch failed for {webpage}: {e}")
            continue

        seen_urls.add(webpage)
        reserved_source_urls_by_page[webpage].update(asset.reserved_source_urls)
        cards.append(
            {
                "id": f"recent-{next_id}",
                "title": title,
                "venue": venue,
                "url": webpage,
                "image": asset.image,
                "mediaType": asset.media_type,
                "media": asset.media,
                "poster": asset.poster,
            }
        )
        next_id += 1

    # Second pass fallback: if still not enough, fill with first 6 having webpage.
    if len(cards) < MAX_ITEMS:
        for pub in fallback_selected:
            if len(cards) >= MAX_ITEMS:
                break
            webpage = clean_text(pub.get("project_webpage", ""))
            if not webpage or webpage in dead_pages or any(x.get("url") == webpage for x in cards):
                continue
            cards.append(
                {
                    "id": f"recent-{next_id}",
                    "title": clean_text(pub.get("title", "")),
                    "venue": clean_text(pub.get("journal", "")),
                    "url": webpage,
                    "image": "/placeholder.svg",
                    "mediaType": "image",
                    "media": "/placeholder.svg",
                    "poster": "/placeholder.svg",
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
