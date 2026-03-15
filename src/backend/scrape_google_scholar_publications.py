import re
import time
from html import unescape
from typing import Dict, List, Optional, Tuple
from urllib.parse import parse_qs, urlencode, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

GOOGLE_SCHOLAR_PROFILE_URL = "https://scholar.google.co.jp/citations?user=N1ZDSHYAAAAJ&hl=zh-CN&view_op=list_works&sortby=pubdate"
DEFAULT_MAX_PUBLICATIONS = 200
DEFAULT_PAGE_SIZE = 100
DEFAULT_REQUEST_TIMEOUT_SECONDS = 30
DEFAULT_FETCH_DETAIL_PAGES = True
DEFAULT_DETAIL_FETCH_DELAY_SECONDS = 0.2

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


def clean(text: str) -> str:
    text = unescape(text or "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def to_tags(title: str) -> List[str]:
    words = re.findall(r"[A-Za-z0-9\-\+²]+", title or "")
    return words[:3]


def parse_year(value) -> int:
    m = re.search(r"(19|20)\d{2}", str(value or ""))
    return int(m.group(0)) if m else 0


def strip_trailing_year(text: str, year: int) -> str:
    if not text:
        return ""
    if year:
        text = re.sub(rf"(?:,|\(|\s)\s*{year}\s*\)?\s*$", "", text).strip(" ,")
    return clean(text)


def build_journal(venue: str, year: int) -> str:
    venue = clean(venue)
    if venue and year:
        return f"{venue} {year}"
    if venue:
        return venue
    if year:
        return str(year)
    return ""


def make_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Referer": "https://scholar.google.com/",
        }
    )
    return session


def build_list_url(profile_url: str, start: int, page_size: int) -> str:
    parsed = urlparse(profile_url)
    query = parse_qs(parsed.query)
    query["view_op"] = ["list_works"]
    query["sortby"] = ["pubdate"]
    query["cstart"] = [str(start)]
    query["pagesize"] = [str(page_size)]
    encoded = urlencode(query, doseq=True)
    return parsed._replace(query=encoded).geturl()


def fetch_html(session: requests.Session, url: str, timeout_seconds: int) -> str:
    resp = session.get(url, timeout=timeout_seconds)
    resp.raise_for_status()
    return resp.text


def extract_total_count(soup: BeautifulSoup) -> Optional[int]:
    label = soup.select_one("#gsc_a_nn")
    if not label:
        return None
    text = clean(label.get_text(" ", strip=True))
    matches = re.findall(r"\d+", text)
    if not matches:
        return None
    return int(matches[-1])


def parse_profile_rows(html: str, page_url: str) -> Tuple[List[Dict], Optional[int]]:
    soup = BeautifulSoup(html, "html.parser")
    rows = []

    for row in soup.select("tr.gsc_a_tr"):
        title_link = row.select_one("a.gsc_a_at")
        if not title_link:
            continue

        title = clean(title_link.get_text(" ", strip=True))
        if not title:
            continue

        detail_url = urljoin(page_url, title_link.get("href") or "")

        gray_lines = row.select("td.gsc_a_t .gs_gray")
        authors = clean(gray_lines[0].get_text(" ", strip=True)) if len(gray_lines) >= 1 else ""
        venue_line = clean(gray_lines[1].get_text(" ", strip=True)) if len(gray_lines) >= 2 else ""

        year_text = ""
        year_node = row.select_one("td.gsc_a_y .gsc_a_h")
        if year_node:
            year_text = clean(year_node.get_text(" ", strip=True))
        year = parse_year(year_text) or parse_year(venue_line)
        venue = strip_trailing_year(venue_line, year)

        rows.append(
            {
                "title": title,
                "authors": authors,
                "journal": build_journal(venue, year),
                "year": year,
                "doi": "",
                "project_webpage": "",
                "tags": to_tags(title),
                "_detail_url": detail_url,
            }
        )

    return rows, extract_total_count(soup)


def parse_detail_page_for_paper_url(html: str, detail_url: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    link = soup.select_one("#gsc_oci_title a.gsc_oci_title_link")
    if not link:
        return ""
    href = clean(link.get("href") or "")
    if not href:
        return ""
    return urljoin(detail_url, href)


def scrape_google_scholar_publications(
    profile_url: str = GOOGLE_SCHOLAR_PROFILE_URL,
    max_publications: int = DEFAULT_MAX_PUBLICATIONS,
    page_size: int = DEFAULT_PAGE_SIZE,
    request_timeout_seconds: int = DEFAULT_REQUEST_TIMEOUT_SECONDS,
    fetch_detail_pages: bool = DEFAULT_FETCH_DETAIL_PAGES,
    detail_fetch_delay_seconds: float = DEFAULT_DETAIL_FETCH_DELAY_SECONDS,
):
    session = make_session()
    publications: List[Dict] = []
    expected_total: Optional[int] = None
    start = 0

    while len(publications) < max_publications:
        url = build_list_url(profile_url, start=start, page_size=page_size)
        html = fetch_html(session, url, timeout_seconds=request_timeout_seconds)
        rows, page_total = parse_profile_rows(html, url)

        if expected_total is None:
            expected_total = page_total

        if not rows:
            break

        remaining = max_publications - len(publications)
        publications.extend(rows[:remaining])

        if len(rows) < page_size:
            break
        if expected_total is not None and len(publications) >= expected_total:
            break

        start += len(rows)

    if not publications:
        raise RuntimeError("Google Scholar returned no publication rows.")

    if fetch_detail_pages:
        for idx, pub in enumerate(publications):
            detail_url = pub.get("_detail_url", "")
            if not detail_url:
                continue
            try:
                html = fetch_html(session, detail_url, timeout_seconds=request_timeout_seconds)
                paper_url = parse_detail_page_for_paper_url(html, detail_url)
                if paper_url:
                    pub["doi"] = paper_url
            except Exception as exc:
                print(f"[WARN] Google Scholar detail fetch failed for {pub.get('title', '')}: {exc}")
            if detail_fetch_delay_seconds > 0 and idx + 1 < len(publications):
                time.sleep(detail_fetch_delay_seconds)

    cleaned = []
    for pub in publications:
        item = {k: v for k, v in pub.items() if not k.startswith("_")}
        cleaned.append(item)

    cleaned.sort(key=lambda x: (int(x.get("year") or 0), x.get("title", "")), reverse=True)

    if expected_total is not None and len(cleaned) < min(expected_total, max_publications):
        raise RuntimeError(
            f"Google Scholar returned only {len(cleaned)} publications but profile advertises {expected_total}."
        )

    return cleaned


if __name__ == "__main__":
    data = scrape_google_scholar_publications()
    print(f"scraped: {len(data)}")
    if data:
        print(data[0])
