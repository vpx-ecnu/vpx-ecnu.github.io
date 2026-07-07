import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from publication_card_images import (
    clean_text,
    inspect_webpage,
    select_publication_card_asset,
)

TIMEOUT_SAFE_PLACEHOLDER = "/placeholder.svg"


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


def main():
    root = repo_root()
    source_path = root / "public" / "publications" / "publication_updated.json"
    output_path = root / "public" / "publications" / "project_publications.json"
    image_dir = root / "public" / "publications" / "recent_images"
    image_dir.mkdir(parents=True, exist_ok=True)

    pubs = load_publications(source_path)
    excluded_cards = [
        p for p in pubs
        if clean_text(p.get("project_webpage", "")) and p.get("vpx_exclude_card")
    ]
    for pub in excluded_cards:
        print(f"[INFO] skip VPX-excluded publication card: {clean_text(pub.get('title', ''))}")

    with_web = [
        p for p in pubs
        if clean_text(p.get("project_webpage", "")) and not p.get("vpx_exclude_card")
    ]
    with_web.sort(
        key=lambda x: (int(x.get("year") or 0), clean_text(x.get("title", ""))),
        reverse=True,
    )

    cards = []
    page_catalog_cache = {}
    reserved_source_urls_by_page = defaultdict(set)
    next_id = 1
    for pub in with_web:
        title = clean_text(pub.get("title", ""))
        venue = clean_text(pub.get("journal", ""))
        webpage = clean_text(pub.get("project_webpage", ""))
        year = int(pub.get("year") or 0)
        image_path = TIMEOUT_SAFE_PLACEHOLDER
        media_type = "image"
        media_path = TIMEOUT_SAFE_PLACEHOLDER
        poster_path = TIMEOUT_SAFE_PLACEHOLDER

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
                continue
            if asset:
                image_path = asset.image or TIMEOUT_SAFE_PLACEHOLDER
                media_type = asset.media_type or "image"
                media_path = asset.media or image_path
                poster_path = asset.poster or image_path
                reserved_source_urls_by_page[webpage].update(asset.reserved_source_urls)
            else:
                print(f"[WARN] no usable publication media found for {webpage}")
        except Exception as exc:
            print(f"[WARN] media fetch failed for {webpage}: {exc}")

        cards.append(
            {
                "id": f"project-pub-{next_id}",
                "title": title,
                "venue": venue,
                "url": webpage,
                "image": image_path,
                "mediaType": media_type,
                "media": media_path,
                "poster": poster_path,
            }
        )
        next_id += 1

    payload = {"updatedAt": datetime.utcnow().isoformat() + "Z", "publications": cards}
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Updated project publication cards: {output_path} (total={len(cards)})")


if __name__ == "__main__":
    main()
