# backend/scholar_scraper.py
from scholarly import scholarly
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 允许前端调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发阶段可以用 *, 部署后建议指定前端地址
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/publications")
def get_publications():
    # 用 author_id（即 ?user= 后面的值）
    author_id = "N1ZDSHYAAAAJ"

    try:
        # 填充作者信息
        author = scholarly.search_author_id(author_id)
        author = scholarly.fill(author)

        publications = author.get("publications", [])[:20]  # 可调整数量

        result = []
        for pub in publications:
            filled_pub = scholarly.fill(pub)
            bib = filled_pub.get("bib", {})
            result.append({
                "title": bib.get("title", ""),
                "authors": bib.get("author", ""),
                "journal": bib.get("venue", ""),
                "year": int(bib.get("pub_year", 0)) if bib.get("pub_year") else 0,
                "doi": filled_pub.get("pub_url", ""),  # Google Scholar 不提供 DOI，只能用 pub_url
                "tags": bib.get("abstract", "").split()[:3]  # 用摘要中前几个词作标签（可改进）
            })

        return result
    except Exception as e:
        return {"error": str(e)}

