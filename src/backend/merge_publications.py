import json
import difflib
import requests
from pathlib import Path

# 1. 调用你自己 FastAPI 的接口获取新抓取数据
response = requests.get("http://localhost:8001/api/publications")
new_data = response.json()

current_file = Path(__file__).resolve()

# 项目根目录 = 当前文件的祖父目录
project_root = current_file.parents[2]  # 退两层：backend -> src -> 根

# 拼接到 public/publications/publication_updated.json
json_path = project_root / "public" / "publications" / "publication_updated.json"
# 2. 读取已有的 publication.json 文件
with open(json_path, "r", encoding="utf-8") as f:
    original_data = json.load(f)

# 3. 标题匹配并合并 journal 字段
for paper in original_data:
    title = paper.get("title", "")
    match = difflib.get_close_matches(title, [item["title"] for item in new_data], n=1, cutoff=0.6)

    if match:
        matched = next(item for item in new_data if item["title"] == match[0])
        paper["journal"] = matched.get("journal", "")

# 4. 保存到新文件
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(original_data, f, indent=2, ensure_ascii=False)

print("✅ 合并完成，结果已保存为 publication_updated.json")
