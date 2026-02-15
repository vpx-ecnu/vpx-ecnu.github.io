import difflib
import json
from pathlib import Path

from scrape_google_scholar_publications import scrape_google_scholar_publications


def main():
    try:
        new_data = scrape_google_scholar_publications()
    except Exception as e:
        print(f"[WARN] Google Scholar scrape failed, keep existing file unchanged: {e}")
        return

    if not new_data:
        print("[WARN] Google Scholar returned empty publications, keep existing file unchanged.")
        return

    new_titles = [x["title"] for x in new_data]

    current_file = Path(__file__).resolve()
    project_root = current_file.parents[2]  # backend -> src -> repo root
    json_path = project_root / "public" / "publications" / "publication_updated.json"

    if json_path.exists():
        original_data = json.loads(json_path.read_text(encoding="utf-8"))
    else:
        original_data = []

    for paper in original_data:
        title = paper.get("title", "")
        match = difflib.get_close_matches(title, new_titles, n=1, cutoff=0.85)
        if not match:
            continue
        matched = next(item for item in new_data if item["title"] == match[0])

        paper["authors"] = matched.get("authors", paper.get("authors", ""))
        paper["journal"] = matched.get("journal", paper.get("journal", ""))
        paper["year"] = matched.get("year", paper.get("year", 0))
        paper["doi"] = matched.get("doi", paper.get("doi", ""))
        paper["project_webpage"] = ""

    existing = {p.get("title", "") for p in original_data}
    for item in new_data:
        if item["title"] not in existing:
            item["project_webpage"] = ""
            original_data.append(item)

    original_data.sort(
        key=lambda x: (int(x.get("year") or 0), str(x.get("title") or "")),
        reverse=True,
    )

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(
        json.dumps(original_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Updated from Google Scholar: {json_path} (total={len(original_data)})")


if __name__ == "__main__":
    main()
