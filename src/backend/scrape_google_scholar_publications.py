import re
import signal
from urllib.parse import parse_qs, urlparse

from scholarly import scholarly

GOOGLE_SCHOLAR_PROFILE_URL = "https://scholar.google.co.jp/citations?user=N1ZDSHYAAAAJ&hl=zh-CN&oi=sra"
DEFAULT_MAX_PUBLICATIONS = 30
DEFAULT_REQUEST_TIMEOUT_SECONDS = 45
DEFAULT_FILL_DETAILS = False


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def to_tags(title: str):
    words = re.findall(r"[A-Za-z0-9\-\+²]+", title or "")
    return words[:3]


def parse_year(value) -> int:
    m = re.search(r"(19|20)\d{2}", str(value or ""))
    return int(m.group(0)) if m else 0


def author_id_from_profile_url(url: str) -> str:
    parsed = urlparse(url)
    return parse_qs(parsed.query).get("user", [""])[0]


def pick_paper_url(filled_pub: dict, bib: dict) -> str:
    candidates = [
        filled_pub.get("pub_url"),
        filled_pub.get("eprint_url"),
        filled_pub.get("url_scholarbib"),
        bib.get("url"),
    ]
    for url in candidates:
        if isinstance(url, str) and url.startswith(("http://", "https://")):
            return url
    return ""


class ScholarTimeout:
    def __init__(self, seconds: int):
        self.seconds = max(1, int(seconds))

    def _handle(self, *_):
        raise TimeoutError(f"scholarly request timed out after {self.seconds}s")

    def __enter__(self):
        signal.signal(signal.SIGALRM, self._handle)
        signal.alarm(self.seconds)

    def __exit__(self, exc_type, exc, tb):
        signal.alarm(0)
        return False


def build_journal(bib: dict, year: int) -> str:
    venue = clean(
        bib.get("conference")
        or bib.get("journal")
        or bib.get("venue")
        or bib.get("publisher")
        or ""
    )
    if venue and year:
        return f"{venue} {year}"
    if venue:
        return venue
    if year:
        return str(year)
    return ""


def scrape_google_scholar_publications(
    profile_url: str = GOOGLE_SCHOLAR_PROFILE_URL,
    max_publications: int = DEFAULT_MAX_PUBLICATIONS,
    request_timeout_seconds: int = DEFAULT_REQUEST_TIMEOUT_SECONDS,
    fill_details: bool = DEFAULT_FILL_DETAILS,
):
    author_id = author_id_from_profile_url(profile_url)
    if not author_id:
        raise ValueError(f"Cannot parse author id from URL: {profile_url}")

    with ScholarTimeout(request_timeout_seconds):
        author = scholarly.search_author_id(author_id)
    with ScholarTimeout(request_timeout_seconds):
        author = scholarly.fill(author, sections=["publications"])
    publications = (author.get("publications") or [])[:max_publications]

    result = []
    for pub in publications:
        filled_pub = pub
        if fill_details:
            try:
                with ScholarTimeout(request_timeout_seconds):
                    filled_pub = scholarly.fill(pub)
            except Exception:
                # 某一篇详情失败不影响整体
                filled_pub = pub

        bib = filled_pub.get("bib") or {}
        title = clean(bib.get("title", ""))
        if not title:
            continue

        year = parse_year(bib.get("pub_year") or bib.get("year"))
        result.append(
            {
                "title": title,
                "authors": clean(bib.get("author", "")),
                "journal": build_journal(bib, year),
                "year": year,
                "doi": pick_paper_url(filled_pub, bib),
                "project_webpage": "",
                "tags": to_tags(title),
            }
        )

    result.sort(key=lambda x: (x.get("year", 0), x.get("title", "")), reverse=True)
    return result


if __name__ == "__main__":
    data = scrape_google_scholar_publications()
    print(f"scraped: {len(data)}")
    if data:
        print(data[0])
