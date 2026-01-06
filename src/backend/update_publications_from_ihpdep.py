import json
import difflib
from pathlib import Path

from scrape_ihpdep_selected_publications import scrape_selected_publications

def main():
    new_data = scrape_selected_publications()
    new_titles = [x["title"] for x in new_data]

    current_file = Path(__file__).resolve()
    project_root = current_file.parents[2]  # backend -> src -> repo root

    json_path = project_root / "public" / "publications" / "publication_updated.json"

    # 读取旧文件
    if json_path.exists():
        original_data = json.loads(json_path.read_text(encoding="utf-8"))
    else:
        original_data = []

    # 1) 对旧条目做“就地补全”
    for paper in original_data:
        title = paper.get("title", "")
        match = difflib.get_close_matches(title, new_titles, n=1, cutoff=0.85)
        if not match:
            continue
        matched = next(item for item in new_data if item["title"] == match[0])

        # 用新数据覆盖/补全关键字段
        paper["authors"] = matched.get("authors", paper.get("authors", ""))
        paper["journal"] = matched.get("journal", paper.get("journal", ""))
        paper["year"] = matched.get("year", paper.get("year", 0))
        paper["doi"] = matched.get("doi", paper.get("doi", ""))
        paper["project_webpage"] = matched.get("project_webpage", paper.get("project_webpage", ""))
        # tags 如果你想保留旧的“摘要tags”，就别覆盖；如果想统一成 title-tags，就打开下一行
        # paper["tags"] = matched.get("tags", paper.get("tags", []))

    # 2) 把新抓到但旧文件里没有的条目追加进去（可选但推荐）
    existing = {p.get("title", "") for p in original_data}
    for item in new_data:
        if item["title"] not in existing:
            original_data.append(item)

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(original_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ Updated: {json_path} (total={len(original_data)})")

if __name__ == "__main__":
    main()
