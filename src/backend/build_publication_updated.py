import argparse
import difflib
import json
import re
import unicodedata
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

from scrape_google_scholar_publications import scrape_google_scholar_publications
from scrape_ihpdep_selected_publications import scrape_selected_publications

TITLE_MATCH_CUTOFF = 0.9


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def clean_text(text: str) -> str:
    return " ".join((text or "").split()).strip()


def normalize_title(title: str) -> str:
    normalized = unicodedata.normalize("NFKD", title or "")
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.casefold()
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized)
    return clean_text(normalized)


def parse_year(value) -> int:
    match = re.search(r"(19|20)\d{2}", str(value or ""))
    return int(match.group(0)) if match else 0


def normalize_link(value: str) -> str:
    value = clean_text(value)
    if not value:
        return ""

    parsed = urlparse(value)
    host = parsed.netloc.casefold()
    path = parsed.path.rstrip("/")
    if host.startswith("www."):
        host = host[4:]
    return f"{host}{path}".strip("/")


def merge_tags(primary_tags, fallback_tags) -> List[str]:
    merged = []
    seen = set()
    for tag_list in (primary_tags or [], fallback_tags or []):
        values = tag_list if isinstance(tag_list, list) else [tag_list]
        for value in values:
            tag = clean_text(str(value))
            if not tag:
                continue
            lowered = tag.casefold()
            if lowered in seen:
                continue
            seen.add(lowered)
            merged.append(tag)
    return merged


def match_by_title(
    publication: Dict,
    selected_publications: List[Dict],
    used_selected_indexes: set,
) -> Optional[int]:
    target_link = publication.get("_normalized_doi", "")
    target_title = publication.get("_normalized_title", "")
    target_year = parse_year(publication.get("year"))

    if target_link:
        for idx, selected in enumerate(selected_publications):
            if idx in used_selected_indexes:
                continue
            if selected.get("_normalized_doi") == target_link:
                return idx

    for idx, selected in enumerate(selected_publications):
        if idx in used_selected_indexes:
            continue
        if selected.get("_normalized_title") == target_title:
            return idx

    available = [
        (idx, selected)
        for idx, selected in enumerate(selected_publications)
        if idx not in used_selected_indexes
    ]
    if not available:
        return None

    candidate_titles = [selected["_normalized_title"] for _, selected in available]
    best = difflib.get_close_matches(target_title, candidate_titles, n=1, cutoff=TITLE_MATCH_CUTOFF)
    if not best:
        return None

    matched_title = best[0]
    candidates = [(idx, selected) for idx, selected in available if selected["_normalized_title"] == matched_title]
    if not candidates:
        return None

    if target_year:
        same_year_candidates = []
        for idx, selected in candidates:
            selected_year = parse_year(selected.get("year"))
            if not selected_year or abs(selected_year - target_year) <= 1:
                same_year_candidates.append((idx, selected))
        if same_year_candidates:
            candidates = same_year_candidates

    return max(
        candidates,
        key=lambda pair: difflib.SequenceMatcher(
            None,
            clean_text(publication.get("title", "")).casefold(),
            clean_text(pair[1].get("title", "")).casefold(),
        ).ratio(),
    )[0]


def build_publication_record(scholar_publication: Dict, selected_publication: Optional[Dict]) -> Dict:
    primary_title = clean_text(scholar_publication.get("title", ""))
    selected_title = clean_text((selected_publication or {}).get("title", ""))
    selected_year = parse_year((selected_publication or {}).get("year"))
    scholar_year = parse_year(scholar_publication.get("year"))
    year = selected_year or scholar_year
    vpx_exclude_card = bool(
        (selected_publication or {}).get("vpx_exclude_card")
        or scholar_publication.get("vpx_exclude_card")
    )

    record = {
        # Selected Publications is hand-curated, so matching entries should prefer it.
        "title": selected_title or primary_title,
        "authors": clean_text((selected_publication or {}).get("authors", "")) or clean_text(scholar_publication.get("authors", "")),
        "journal": clean_text((selected_publication or {}).get("journal", "")) or clean_text(scholar_publication.get("journal", "")),
        "year": year,
        "doi": clean_text((selected_publication or {}).get("doi", "")) or clean_text(scholar_publication.get("doi", "")),
        "tags": merge_tags((selected_publication or {}).get("tags"), scholar_publication.get("tags")),
        "project_webpage": clean_text((selected_publication or {}).get("project_webpage", "")),
        "vpx_exclude_card": vpx_exclude_card,
    }
    return record


def publication_output_path() -> Path:
    return repo_root() / "public" / "publications" / "publication_updated.json"


def load_cached_publications(path: Optional[Path] = None) -> List[Dict]:
    cache_path = path or publication_output_path()
    if not cache_path.exists():
        return []

    data = json.loads(cache_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise RuntimeError(f"Cached publication data is not a list: {cache_path}")

    publications = []
    for item in data:
        if not isinstance(item, dict):
            continue
        title = clean_text(item.get("title", ""))
        if not title:
            continue
        publications.append(
            {
                "title": title,
                "authors": clean_text(item.get("authors", "")),
                "journal": clean_text(item.get("journal", "")),
                "year": parse_year(item.get("year")),
                "doi": clean_text(item.get("doi", "")),
                "tags": (
                    item.get("tags", [])
                    if isinstance(item.get("tags", []), list)
                    else []
                ),
                "project_webpage": clean_text(item.get("project_webpage", "")),
                "vpx_exclude_card": bool(item.get("vpx_exclude_card")),
            }
        )

    return publications


def load_sources(
    max_publications: int,
    fetch_detail_pages: bool,
) -> Tuple[List[Dict], List[Dict], bool]:
    used_cached_scholar_fallback = False
    try:
        scholar_publications = scrape_google_scholar_publications(
            max_publications=max_publications,
            fetch_detail_pages=fetch_detail_pages,
        )
        if not scholar_publications:
            raise RuntimeError("Google Scholar returned no publications.")
    except Exception as exc:
        cached_publications = load_cached_publications()
        if not cached_publications:
            raise RuntimeError(
                "Google Scholar scrape failed and no cached publication_updated.json "
                "fallback is available."
            ) from exc
        print(
            "[WARN] Google Scholar scrape failed; using cached "
            f"publication_updated.json as the Scholar baseline: {exc}"
        )
        scholar_publications = cached_publications[:max_publications]
        used_cached_scholar_fallback = True

    selected_publications = scrape_selected_publications()
    if not selected_publications:
        raise RuntimeError("IHPDEP Selected Publications returned no publications.")

    return scholar_publications, selected_publications, used_cached_scholar_fallback


def prepare_for_matching(publications: List[Dict]) -> List[Dict]:
    prepared = []
    for publication in publications:
        item = dict(publication)
        item["_normalized_title"] = normalize_title(item.get("title", ""))
        item["_normalized_doi"] = normalize_link(item.get("doi", ""))
        prepared.append(item)
    return prepared


def write_output(publications: List[Dict]) -> Path:
    output_path = publication_output_path()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(publications, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return output_path


def build_publication_updated(max_publications: int = 200, fetch_detail_pages: bool = True) -> Dict[str, int]:
    scholar_publications, selected_publications, used_cached_scholar_fallback = load_sources(
        max_publications=max_publications,
        fetch_detail_pages=fetch_detail_pages,
    )

    scholar_publications = prepare_for_matching(scholar_publications)
    selected_publications = prepare_for_matching(selected_publications)

    merged_publications = []
    used_selected_indexes = set()
    matched_count = 0

    for scholar_publication in scholar_publications:
        selected_index = match_by_title(
            scholar_publication,
            selected_publications,
            used_selected_indexes,
        )
        selected_publication = None
        if selected_index is not None:
            used_selected_indexes.add(selected_index)
            selected_publication = selected_publications[selected_index]
            matched_count += 1

        merged_publications.append(build_publication_record(scholar_publication, selected_publication))

    appended_selected_count = 0
    for idx, selected_publication in enumerate(selected_publications):
        if idx in used_selected_indexes:
            continue
        merged_publications.append(build_publication_record({}, selected_publication))
        appended_selected_count += 1

    cleaned_publications = []
    for publication in merged_publications:
        record = {
            "title": publication.get("title", ""),
            "authors": publication.get("authors", ""),
            "journal": publication.get("journal", ""),
            "year": parse_year(publication.get("year")),
            "doi": publication.get("doi", ""),
            "tags": publication.get("tags", []),
            "project_webpage": publication.get("project_webpage", ""),
        }
        if publication.get("vpx_exclude_card"):
            record["vpx_exclude_card"] = True
        cleaned_publications.append(record)

    cleaned_publications.sort(
        key=lambda item: (parse_year(item.get("year")), clean_text(item.get("title", ""))),
        reverse=True,
    )

    output_path = write_output(cleaned_publications)
    print(f"Updated publication JSON: {output_path}")
    print(
        "Stats:",
        json.dumps(
            {
                "google_scholar_total": len(scholar_publications),
                "selected_publications_total": len(selected_publications),
                "matched_selected_overlay": matched_count,
                "appended_selected_only": appended_selected_count,
                "final_total": len(cleaned_publications),
                "used_cached_google_scholar_fallback": int(used_cached_scholar_fallback),
            },
            ensure_ascii=False,
        ),
    )

    return {
        "google_scholar_total": len(scholar_publications),
        "selected_publications_total": len(selected_publications),
        "matched_selected_overlay": matched_count,
        "appended_selected_only": appended_selected_count,
        "final_total": len(cleaned_publications),
        "used_cached_google_scholar_fallback": int(used_cached_scholar_fallback),
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Build publication_updated.json from Google Scholar and IHPDEP overlay data.")
    parser.add_argument("--max-publications", type=int, default=200)
    parser.add_argument(
        "--skip-detail-pages",
        action="store_true",
        help="Skip per-paper detail page fetches when collecting Google Scholar paper links.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    build_publication_updated(
        max_publications=args.max_publications,
        fetch_detail_pages=not args.skip_detail_pages,
    )


if __name__ == "__main__":
    main()
