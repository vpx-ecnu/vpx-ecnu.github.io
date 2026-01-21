import subprocess
from pathlib import Path
import pandas as pd
import json
from datetime import datetime


ROOT = Path(__file__).resolve().parent

# Spider_XHS 生成 xlsx 的目录（你的日志显示是这个）
EXCEL_DIR = ROOT / "datas" / "excel_datas"

# 你网站后端 data/news.json 的目标路径（你的日志显示生成到了这里）
OUTPUT_NEWS_JSON = ROOT.parent / "src" / "server" / "data" / "news.json"


def to_iso_date(v):
    """把上传时间尽量转成 ISO 字符串。失败就用当前时间。"""
    if v is None:
        return datetime.utcnow().isoformat() + "Z"
    if isinstance(v, str) and not v.strip():
        return datetime.utcnow().isoformat() + "Z"

    # 1) 纯数字时间戳（秒 / 毫秒）
    try:
        ts = int(float(v))
        if ts > 10**12:  # 毫秒
            ts = ts / 1000
        return datetime.utcfromtimestamp(ts).isoformat() + "Z"
    except Exception:
        pass

    # 2) pandas 自动解析
    try:
        d = pd.to_datetime(v, utc=True, errors="coerce")
        if pd.isna(d):
            return datetime.utcnow().isoformat() + "Z"
        return d.to_pydatetime().isoformat().replace("+00:00", "Z")
    except Exception:
        return datetime.utcnow().isoformat() + "Z"


def parse_images(row):
    """
    从 xlsx 的 '图片地址url列表' 解析出 images: string[]
    该列通常是字符串形式的列表："['url1','url2']"
    """
    imgs = row.get("图片地址url列表", "")
    if imgs is None:
        return []

    # 已经是 list
    if isinstance(imgs, list):
        return [str(x) for x in imgs if x]

    # 字符串
    if isinstance(imgs, str):
        s = imgs.strip()
        if not s:
            return []
        # 尝试 eval 解析
        try:
            lst = eval(s)
            if isinstance(lst, list):
                return [str(x) for x in lst if x]
        except Exception:
            return []

    return []


def pick_cover(row):
    """
    选择封面图：
    1) 优先 '视频封面url'
    2) 否则从 images 取第一张
    """
    cover = row.get("视频封面url", "")
    if isinstance(cover, str) and cover.strip():
        return cover.strip()

    images = parse_images(row)
    return images[0] if images else ""


def find_latest_xlsx(excel_dir: Path) -> Path:
    files = list(excel_dir.glob("*.xlsx"))
    if not files:
        raise FileNotFoundError(f"No .xlsx found in {excel_dir}")
    return max(files, key=lambda p: p.stat().st_mtime)


def export_news_json(xlsx_path: Path, out_json_path: Path):
    df = pd.read_excel(xlsx_path).fillna("")

    news = []
    for _, row_ in df.iterrows():
        row = row_.to_dict()
        desc = row.get("描述", "")

        images = parse_images(row)
        cover = pick_cover(row)

        news.append({
            "id": str(row.get("笔记id", "")),
            "title": str(row.get("标题", "")),
            "date": to_iso_date(row.get("上传时间", "")),
            "image": cover,              # 兼容旧前端
            "images": images,            # ✅ 新增：详情页拼贴墙会用
            "sub_title": (desc[:80] + "…") if isinstance(desc, str) and len(desc) > 80 else str(desc),
            "description": str(desc),
            # 你首页逻辑里用的是 item.source === "xhs" 来显示 Xiaohongshu
            "source": "xhs",
            "source_url": str(row.get("笔记url", "")),
        })

    out_json_path.parent.mkdir(parents=True, exist_ok=True)
    out_json_path.write_text(
        json.dumps({"news": news}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"✅ Exported {len(news)} items")
    print(f"✅ Wrote: {out_json_path}")


def main():
    print("== 1) Running spider main.py ==")
    subprocess.run(["python", "main.py"], cwd=str(ROOT), check=True)

    print("== 2) Finding latest xlsx ==")
    latest_xlsx = find_latest_xlsx(EXCEL_DIR)
    print(f"✅ Latest xlsx: {latest_xlsx}")

    print("== 3) Exporting news.json ==")
    export_news_json(latest_xlsx, OUTPUT_NEWS_JSON)


if __name__ == "__main__":
    main()
