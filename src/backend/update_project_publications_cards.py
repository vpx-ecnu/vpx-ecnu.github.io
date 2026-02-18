import json
from datetime import datetime
from pathlib import Path

TIMEOUT_SAFE_PLACEHOLDER = "/placeholder.svg"


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def clean_text(text: str) -> str:
    return " ".join((text or "").split()).strip()


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

    # Optional image pipeline: if bs4-related helper import fails locally,
    # we still generate cards with placeholder images.
    try:
        from update_recent_publications_cards import (
            download_image_to_public,
            find_first_image_urls,
        )
        image_pipeline_available = True
    except Exception:
        image_pipeline_available = False

    pubs = load_publications(source_path)
    with_web = [p for p in pubs if clean_text(p.get("project_webpage", ""))]
    with_web.sort(
        key=lambda x: (int(x.get("year") or 0), clean_text(x.get("title", ""))),
        reverse=True,
    )

    cards = []
    for idx, pub in enumerate(with_web, 1):
        title = clean_text(pub.get("title", ""))
        venue = clean_text(pub.get("journal", ""))
        webpage = clean_text(pub.get("project_webpage", ""))
        image_path = TIMEOUT_SAFE_PLACEHOLDER

        if image_pipeline_available:
            try:
                candidates = find_first_image_urls(webpage)
                for image_url in candidates:
                    try:
                        local = download_image_to_public(image_url, image_dir)
                        if local:
                            image_path = local
                            break
                    except Exception:
                        continue
            except Exception:
                pass

        cards.append(
            {
                "id": f"project-pub-{idx}",
                "title": title,
                "venue": venue,
                "url": webpage,
                "image": image_path,
            }
        )

    payload = {"updatedAt": datetime.utcnow().isoformat() + "Z", "publications": cards}
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Updated project publication cards: {output_path} (total={len(cards)})")


if __name__ == "__main__":
    main()
