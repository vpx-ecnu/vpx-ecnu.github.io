import json
from datetime import datetime
from pathlib import Path

MAX_ITEMS = 6


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_project_cards(path: Path):
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
    source_path = root / "public" / "publications" / "project_publications.json"
    output_path = root / "public" / "publications" / "recent_publications.json"

    project_cards = load_project_cards(source_path)
    cards = []

    for index, card in enumerate(project_cards[:MAX_ITEMS], start=1):
        next_card = dict(card)
        next_card["id"] = f"recent-{index}"
        cards.append(next_card)

    payload = {"updatedAt": datetime.utcnow().isoformat() + "Z", "publications": cards}
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated recent publication cards from project feed: {output_path} (total={len(cards)})")


if __name__ == "__main__":
    main()
