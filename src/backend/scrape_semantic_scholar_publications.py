import os
import re
from typing import Dict, List, Optional

import requests

SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1"
DEFAULT_AUTHOR_QUERY = "Yang Li"
DEFAULT_MAX_PUBLICATIONS = 200
DEFAULT_TIMEOUT_SECONDS = 30


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def to_tags(title: str) -> List[str]:
    words = re.findall(r"[A-Za-z0-9\-\+²]+", title or "")
    return words[:3]


def normalize_year(value) -> int:
    m = re.search(r"(19|20)\d{2}", str(value or ""))
    return int(m.group(0)) if m else 0


def make_session(api_key: Optional[str] = None) -> requests.Session:
    session = requests.Session()
    session.headers.update({"User-Agent": "luminous-research-hub/semantic-scholar-updater"})
    if api_key:
        session.headers.update({"x-api-key": api_key})
    return session


def search_author_id(
    session: requests.Session,
    author_query: str,
    timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS,
) -> str:
    env_author_id = os.getenv("SEMANTIC_SCHOLAR_AUTHOR_ID", "").strip()
    if env_author_id:
        return env_author_id

    url = f"{SEMANTIC_SCHOLAR_API}/author/search"
    fallback_queries = [
        author_query,
        "Yang Li",
        "Yang Li ECNU",
        "Yang Li East China Normal University",
        "杨力 华东师范大学",
    ]

    last_payload = {}
    data = []
    for q in dict.fromkeys([clean(x) for x in fallback_queries if clean(x)]):
        params = {
            "query": q,
            "limit": 20,
            "fields": "name,affiliations,homepage,url,paperCount,hIndex",
        }
        resp = session.get(url, params=params, timeout=timeout_seconds)
        resp.raise_for_status()
        last_payload = resp.json()
        data = last_payload.get("data") or []
        if data:
            break

    if not data:
        err = clean(str(last_payload.get("error", "")))
        if err:
            raise RuntimeError(f"Semantic Scholar author search failed: {err}")
        raise RuntimeError(
            f"No Semantic Scholar author found. Tried queries: {fallback_queries}"
        )

    def score(candidate: Dict) -> int:
        s = 0
        name = clean(candidate.get("name", "")).lower()
        aff = clean(candidate.get("affiliations", "")).lower()
        home = clean(candidate.get("homepage", "")).lower()
        profile = clean(candidate.get("url", "")).lower()

        if "yang li" in name:
            s += 10
        if "east china normal" in aff or "ecnu" in aff:
            s += 20
        if "east china normal" in home or "ecnu" in home:
            s += 10
        if "east china normal" in profile or "ecnu" in profile:
            s += 5
        if candidate.get("paperCount"):
            s += min(int(candidate["paperCount"]) // 50, 10)
        if candidate.get("hIndex"):
            s += min(int(candidate["hIndex"]) // 10, 10)
        return s

    best = max(data, key=score)
    author_id = str(best.get("authorId", "")).strip()
    if not author_id:
        raise RuntimeError("Semantic Scholar author search returned empty authorId")
    return author_id


def format_journal(paper: Dict, year: int) -> str:
    venue = clean(
        paper.get("venue")
        or (paper.get("publicationVenue") or {}).get("name", "")
        or ""
    )
    if venue and year:
        return f"{venue} {year}"
    if venue:
        return venue
    if year:
        return str(year)
    return ""


def pick_paper_url(paper: Dict) -> str:
    open_access = paper.get("openAccessPdf") or {}
    open_access_url = open_access.get("url")
    if isinstance(open_access_url, str) and open_access_url.startswith(("http://", "https://")):
        return open_access_url

    url = paper.get("url")
    if isinstance(url, str) and url.startswith(("http://", "https://")):
        return url

    ext = paper.get("externalIds") or {}
    doi = clean(ext.get("DOI", ""))
    if doi:
        return f"https://doi.org/{doi}"

    arxiv = clean(ext.get("ArXiv", ""))
    if arxiv:
        return f"https://arxiv.org/abs/{arxiv}"

    return ""


def fetch_author_papers(
    session: requests.Session,
    author_id: str,
    max_publications: int = DEFAULT_MAX_PUBLICATIONS,
    timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS,
) -> List[Dict]:
    fields = ",".join(
        [
            "title",
            "year",
            "venue",
            "url",
            "authors",
            "externalIds",
            "openAccessPdf",
            "publicationVenue",
        ]
    )
    base_url = f"{SEMANTIC_SCHOLAR_API}/author/{author_id}/papers"
    offset = 0
    page_size = 100
    papers = []

    while len(papers) < max_publications:
        params = {
            "fields": fields,
            "offset": offset,
            "limit": min(page_size, max_publications - len(papers)),
        }
        resp = session.get(base_url, params=params, timeout=timeout_seconds)
        resp.raise_for_status()
        payload = resp.json()
        data = payload.get("data") or []
        if not data:
            break
        papers.extend(data)
        if len(data) < params["limit"]:
            break
        offset += len(data)

    return papers


def parse_publications_from_papers(papers: List[Dict]) -> List[Dict]:
    items = []
    seen_titles = set()

    for raw in papers:
        paper = raw.get("paper") if isinstance(raw.get("paper"), dict) else raw
        title = clean(paper.get("title", ""))
        if not title:
            continue
        key = title.casefold()
        if key in seen_titles:
            continue
        seen_titles.add(key)

        year = normalize_year(paper.get("year"))
        authors = ", ".join(
            [clean(a.get("name", "")) for a in (paper.get("authors") or []) if clean(a.get("name", ""))]
        )
        items.append(
            {
                "title": title,
                "authors": authors,
                "journal": format_journal(paper, year),
                "year": year,
                "doi": pick_paper_url(paper),
                "project_webpage": "",
                "tags": to_tags(title),
            }
        )

    items.sort(key=lambda x: (x.get("year", 0), x.get("title", "")), reverse=True)
    return items


def scrape_semantic_scholar_publications(
    author_query: str = DEFAULT_AUTHOR_QUERY,
    max_publications: int = DEFAULT_MAX_PUBLICATIONS,
    timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS,
):
    api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY", "").strip() or None
    session = make_session(api_key=api_key)
    author_id = search_author_id(session, author_query, timeout_seconds=timeout_seconds)
    papers = fetch_author_papers(
        session,
        author_id=author_id,
        max_publications=max_publications,
        timeout_seconds=timeout_seconds,
    )
    return parse_publications_from_papers(papers)


if __name__ == "__main__":
    data = scrape_semantic_scholar_publications()
    print(f"scraped: {len(data)}")
    if data:
        print(data[0])
