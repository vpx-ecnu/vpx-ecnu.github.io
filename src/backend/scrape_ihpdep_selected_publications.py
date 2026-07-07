import re
import requests
from bs4 import BeautifulSoup, Comment, Tag

URL = "https://ihpdep.github.io/"
VPX_EXCLUDE_CARD_MARKER = "vpx:exclude-card"

def clean(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()

def parse_year(s: str) -> int:
    m = re.search(r"(19|20)\d{2}", s or "")
    return int(m.group(0)) if m else 0

def to_tags(title: str):
    words = re.findall(r"[A-Za-z0-9\-\+²]+", title or "")
    return words[:3]

def has_vpx_exclude_card_marker(text: str) -> bool:
    return VPX_EXCLUDE_CARD_MARKER in (text or "").casefold()

def is_vpx_card_excluded(el: Tag) -> bool:
    for comment in el.find_all(string=lambda text: isinstance(text, Comment)):
        if has_vpx_exclude_card_marker(str(comment)):
            return True

    for tag in el.find_all(True):
        marker_values = [
            tag.get("data-vpx", ""),
            tag.get("data-vpx-card", ""),
            " ".join(tag.get("class") or []),
        ]
        if any(has_vpx_exclude_card_marker(value) for value in marker_values):
            return True
        if clean(tag.get("data-vpx-exclude-card", "")).casefold() in ("1", "true", "yes"):
            return True

    return has_vpx_exclude_card_marker(el.get_text(" ", strip=True))

def pick_best_link(links):
    """
    links: list[tuple[label, url]]
    """
    if not links:
        return ""
    # 优先 PAPER / PDF
    for prefer in ("PAPER", "PDF"):
        for lbl, url in links:
            if (lbl or "").strip().upper() == prefer:
                return url

    # 次选常见论文站点
    keywords = ("arxiv", "ieee", "sciencedirect", "springer", "aaai", "neurips", "ijcai", "dl.acm.org", "openreview")
    for lbl, url in links:
        if any(k in (url or "").lower() for k in keywords):
            return url

    return links[0][1]

def pick_links(links):
    """
    links: list[tuple[label, url]]
    return: (paper_url, project_url)
    """
    paper_url = ""
    project_url = ""

    if not links:
        return paper_url, project_url

    # 1) 优先从 label 直接判断
    for lbl, url in links:
        L = (lbl or "").strip().upper()
        if L in ("PAPER", "PDF"):
            paper_url = paper_url or url
        if "PROJECT" in L and "WEB" in L:
            project_url = project_url or url

    # 2) 如果 paper 还没拿到，用 url 关键词兜底
    if not paper_url:
        keywords = ("arxiv", "ieee", "sciencedirect", "springer", "aaai", "neurips", "ijcai", "dl.acm.org", "openreview")
        for lbl, url in links:
            if any(k in (url or "").lower() for k in keywords):
                paper_url = url
                break

    # 3) 如果还没拿到 paper，最后退化成第一个链接
    if not paper_url and links:
        paper_url = links[0][1]

    return paper_url, project_url


def scrape_selected_publications(url: str = URL, timeout: int = 30):
    resp = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "lxml")

    # 找到 Selected Publications 标题
    h = soup.find(lambda t: isinstance(t, Tag) and t.name in ("h2", "h3") and clean(t.get_text()) == "Selected Publications")
    if not h:
        raise RuntimeError("Cannot find 'Selected Publications' heading.")

    # 从 heading 之后找所有 p.pub，直到下一个 h2/h3
    pubs = []
    for el in h.find_all_next():
        if isinstance(el, Tag) and el.name in ("h2", "h3"):
            break
        if not (isinstance(el, Tag) and el.name == "p" and "pub" in (el.get("class") or [])):
            continue

        # title
        b = el.find("b")
        title = clean(b.get_text()) if b else ""
        if not title:
            continue

        # links
        links = []
        for a in el.find_all("a"):
            href = a.get("href") or ""
            label = clean(a.get_text())
            if href:
                links.append((label, href))

        paper_url, project_url = pick_links(links)

        # 用 <br> 分段：第一段是 title，第二段一般是 authors，第三段一般是 venue/year
        # BeautifulSoup 的 get_text("\n") 会把 <br> 转成换行
        parts = [clean(x) for x in el.get_text("\n").split("\n") if clean(x)]

        # authors：通常 title 后第一行
        authors = parts[1] if len(parts) >= 2 else ""

        # venue：直接取 <i>（最稳）
        venue_tag = el.find("i")
        venue = clean(venue_tag.get_text()) if venue_tag else ""

        # year：从整段文本里抽（而不是某一行）
        full_text = clean(el.get_text(" "))
        year = parse_year(full_text)

        # journal：拼起来（你想要 “AAAI 2026” 还是 “AAAI, 2026” 二选一）
        journal = f"{venue} {year}".strip() if venue and year else (venue or (str(year) if year else ""))

        pubs.append({
            "title": title,
            "authors": authors,
            "journal": journal,         # 你现在存 "AAAI 2026"
            "year": year,
            "doi": paper_url,           # 仍旧沿用 doi 字段存 paper 链接（不动前端也能继续用）
            "project_webpage": project_url,  # ✅ 新增：Project Webpage 链接
            "vpx_exclude_card": is_vpx_card_excluded(el),
            "tags": to_tags(title)
        })

    return pubs

if __name__ == "__main__":
    data = scrape_selected_publications()
    print("scraped:", len(data))
    if data:
        print(data[0])
