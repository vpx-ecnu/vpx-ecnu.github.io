import json
import difflib
import requests

# 1. 调用你自己 FastAPI 的接口获取新抓取数据
response = requests.get("http://localhost:8000/api/publications")
new_data = response.json()

# 2. 读取已有的 publication.json 文件
with open("/data/project/luminous-research-hub/public/publications.json", "r", encoding="utf-8") as f:
    original_data = json.load(f)

# 3. 标题匹配并合并 journal 字段
for paper in original_data:
    title = paper.get("title", "")
    match = difflib.get_close_matches(title, [item["title"] for item in new_data], n=1, cutoff=0.6)

    if match:
        matched = next(item for item in new_data if item["title"] == match[0])
        paper["journal"] = matched.get("journal", "")

# 4. 保存到新文件
with open("publication_updated.json", "w", encoding="utf-8") as f:
    json.dump(original_data, f, indent=2, ensure_ascii=False)

print("✅ 合并完成，结果已保存为 publication_updated.json")
