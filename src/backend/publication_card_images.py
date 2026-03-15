from __future__ import annotations

import hashlib
import io
import mimetypes
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageChops, ImageEnhance, ImageFile, ImageFilter, ImageOps, ImageStat

TIMEOUT_SECONDS = 20
CARD_SIZE = (1440, 810)
MAX_FETCHED_CANDIDATES = 16
MAX_VIDEO_BYTES = 40 * 1024 * 1024
MIN_IMAGE_WIDTH = 240
MIN_IMAGE_HEIGHT = 160
MIN_IMAGE_AREA = 320 * 180
MAX_IMAGE_ASPECT_RATIO = 5.0
MIN_IMAGE_ASPECT_RATIO = 0.55
PIPELINE_VERSION = "card-v3"
MEDIA_IMAGE = "image"
MEDIA_VIDEO = "video"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
)
PRIORITY_KEYWORDS = (
    "teaser",
    "overview",
    "method",
    "framework",
    "pipeline",
    "architecture",
    "result",
    "visual",
    "figure",
    "demo",
    "project",
    "hero",
    "tracking",
    "scene",
)
NEGATIVE_KEYWORDS = (
    "logo",
    "icon",
    "favicon",
    "avatar",
    "portrait",
    "author",
    "footer",
    "sponsor",
    "partner",
    "badge",
    "qr",
    "wechat",
    "thumbnail-small",
)
META_IMAGE_SPECS = (
    ("property", "og:image", 130),
    ("property", "og:image:url", 128),
    ("name", "twitter:image", 122),
    ("name", "twitter:image:src", 120),
    ("itemprop", "image", 118),
    ("itemprop", "thumbnailUrl", 116),
)
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}
VIDEO_MIME_HINTS = ("video/mp4", "video/webm", "video/quicktime")
TITLE_STOPWORDS = {
    "a",
    "an",
    "and",
    "based",
    "by",
    "end",
    "enhancing",
    "for",
    "framework",
    "from",
    "in",
    "initial",
    "large",
    "language",
    "learning",
    "manipulation",
    "model",
    "models",
    "multimodal",
    "of",
    "on",
    "over",
    "policy",
    "robotic",
    "surgical",
    "system",
    "the",
    "to",
    "tracking",
    "using",
    "via",
    "with",
    "zero",
}

ImageFile.LOAD_TRUNCATED_IMAGES = True


@dataclass(frozen=True)
class MediaCandidateRef:
    url: str
    score: float
    source: str
    media_type: str
    context_text: str = ""
    poster_url: str = ""


@dataclass(frozen=True)
class PageMediaCatalog:
    page_url: str
    status_code: int
    candidates: tuple[MediaCandidateRef, ...]


@dataclass
class EvaluatedImageCandidate:
    candidate: MediaCandidateRef
    score: float
    image: Image.Image


@dataclass
class EvaluatedVideoCandidate:
    candidate: MediaCandidateRef
    score: float
    local_video: str
    preview_image: Image.Image


@dataclass(frozen=True)
class PublicationCardAsset:
    status_code: int
    media_type: str
    media: str
    image: str
    poster: str
    source_url: str
    reserved_source_urls: tuple[str, ...]


def clean_text(text: str) -> str:
    return " ".join((text or "").split()).strip()


def _dedupe_keep_order(values: Iterable[str]) -> list[str]:
    seen = set()
    result: list[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _requests_session() -> requests.Session:
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    return session


def _pick_best_srcset_candidate(srcset: str) -> list[str]:
    parsed: list[tuple[float, str]] = []
    for item in srcset.split(","):
        entry = item.strip()
        if not entry:
            continue
        parts = entry.split()
        url = parts[0]
        weight = 1.0
        if len(parts) > 1:
            descriptor = parts[-1].strip().lower()
            try:
                if descriptor.endswith("w"):
                    weight = float(descriptor[:-1])
                elif descriptor.endswith("x"):
                    weight = float(descriptor[:-1]) * 1000
            except ValueError:
                pass
        parsed.append((weight, url))

    parsed.sort(key=lambda item: item[0], reverse=True)
    return [url for _, url in parsed[:3]]


def _resolve_asset_candidates(page_url: str, src: str) -> list[str]:
    src = clean_text(src).replace("\\", "/")
    if not src:
        return []

    parsed_page = urlparse(page_url)
    base_with_slash = page_url if page_url.endswith("/") else page_url + "/"
    candidates = [urljoin(base_with_slash, src)]

    if src.startswith("//"):
        candidates.append(f"{parsed_page.scheme}:{src}")
    elif not src.startswith(("http://", "https://", "/")):
        candidates.append(f"{parsed_page.scheme}://{parsed_page.netloc}/{src.lstrip('/')}")

    if src.startswith("/") and parsed_page.path not in ("", "/"):
        project_prefix = parsed_page.path.rstrip("/")
        candidates.append(f"{parsed_page.scheme}://{parsed_page.netloc}{project_prefix}{src}")

    return _dedupe_keep_order(candidates)


def _extract_img_sources(img_tag) -> list[str]:
    urls: list[str] = []
    for attr in (
        "src",
        "data-src",
        "data-original",
        "data-lazy-src",
        "data-cfsrc",
        "data-src-retina",
    ):
        value = clean_text(img_tag.get(attr, ""))
        if value:
            urls.append(value)

    for attr in ("srcset", "data-srcset"):
        srcset = clean_text(img_tag.get(attr, ""))
        if srcset:
            urls.extend(_pick_best_srcset_candidate(srcset))

    return _dedupe_keep_order(urls)


def _extract_video_sources(video_tag) -> list[str]:
    urls: list[str] = []
    for attr in ("src", "data-src"):
        value = clean_text(video_tag.get(attr, ""))
        if value:
            urls.append(value)

    for source in video_tag.find_all("source"):
        value = clean_text(source.get("src", ""))
        if value:
            urls.append(value)

    return _dedupe_keep_order(urls)


def _extract_style_background_urls(style_text: str) -> list[str]:
    matches = re.findall(r"url\(([^)]+)\)", style_text or "", flags=re.IGNORECASE)
    cleaned = [match.strip(" '\"") for match in matches]
    return _dedupe_keep_order(cleaned)


def _numeric_attr(value: str) -> int | None:
    text = clean_text(value)
    if not text:
        return None
    digits = "".join(ch for ch in text if ch.isdigit())
    if not digits:
        return None
    try:
        return int(digits)
    except ValueError:
        return None


def _keyword_hits(text: str, keywords: tuple[str, ...]) -> int:
    lowered = text.lower()
    return sum(1 for keyword in keywords if keyword in lowered)


def _extract_context_text(tag) -> str:
    current = tag
    for _ in range(5):
        if not current or not getattr(current, "name", None):
            break
        text = clean_text(current.get_text(" ", strip=True))
        if len(text) >= 80:
            return text[:1200]
        current = current.parent
    return clean_text(tag.get_text(" ", strip=True))[:1200]


def _score_media_tag(tag, own_parts: list[str], media_type: str) -> float:
    score = 18.0 if media_type == MEDIA_IMAGE else 32.0
    own_text = " ".join(clean_text(part) for part in own_parts if clean_text(part)).lower()
    score += _keyword_hits(own_text, PRIORITY_KEYWORDS) * 18
    score -= _keyword_hits(own_text, NEGATIVE_KEYWORDS) * 35

    ancestor = tag
    for depth in range(3):
        ancestor = ancestor.parent if ancestor else None
        if not ancestor or not getattr(ancestor, "name", None):
            break

        name = ancestor.name.lower()
        ancestor_text = " ".join(
            [
                clean_text(ancestor.get("id", "")),
                clean_text(" ".join(ancestor.get("class", []))),
                clean_text(ancestor.get_text(" ", strip=True)[:400]),
            ]
        ).lower()

        if name == "figure":
            score += 18 - depth * 2
        if name in {"main", "article", "section"}:
            score += 12 - depth * 2
        score += _keyword_hits(ancestor_text, PRIORITY_KEYWORDS) * (8 - depth * 2)
        score -= _keyword_hits(ancestor_text, NEGATIVE_KEYWORDS) * 12

    width = _numeric_attr(tag.get("width", ""))
    height = _numeric_attr(tag.get("height", ""))
    if width and height:
        if width * height >= 1280 * 720:
            score += 20
        elif width * height >= 640 * 360:
            score += 10
        elif width * height < 240 * 160:
            score -= 35

    if media_type == MEDIA_VIDEO:
        score += 10

    return score


def _normalize_match_text(text: str) -> str:
    return clean_text(re.sub(r"[^a-z0-9]+", " ", (text or "").lower()))


def _title_keywords(title: str) -> list[str]:
    normalized = _normalize_match_text(title)
    tokens = []
    for token in normalized.split():
        if len(token) < 4 and token not in {"vla", "super"}:
            continue
        if token in TITLE_STOPWORDS:
            continue
        tokens.append(token)
    return _dedupe_keep_order(tokens)


def _publication_match_bonus(candidate: MediaCandidateRef, publication_title: str, publication_year: int) -> float:
    context = _normalize_match_text(" ".join([candidate.context_text, candidate.url, candidate.source]))
    if not context:
        return 0.0

    bonus = 0.0
    normalized_title = _normalize_match_text(publication_title)
    if normalized_title and normalized_title in context:
        bonus += 60

    keywords = _title_keywords(publication_title)
    hits = sum(1 for token in keywords if token in context)
    bonus += min(hits, 6) * 8

    if len(keywords) >= 2:
        phrase = f"{keywords[0]} {keywords[1]}"
        if phrase in context:
            bonus += 18

    if publication_year and str(publication_year) in context:
        bonus += 18

    return bonus


def inspect_webpage(page_url: str) -> PageMediaCatalog:
    if not page_url:
        return PageMediaCatalog(page_url=page_url, status_code=0, candidates=())

    session = _requests_session()
    response = session.get(page_url, timeout=TIMEOUT_SECONDS)
    status_code = response.status_code
    if status_code >= 400:
        return PageMediaCatalog(page_url=page_url, status_code=status_code, candidates=())

    soup = BeautifulSoup(response.text, "lxml")
    best_scores: dict[tuple[str, str], MediaCandidateRef] = {}

    def remember(candidate: MediaCandidateRef):
        key = (candidate.media_type, candidate.url)
        previous = best_scores.get(key)
        if previous is None or candidate.score > previous.score:
            best_scores[key] = candidate

    for attr_name, attr_value, base_score in META_IMAGE_SPECS:
        tag = soup.find("meta", attrs={attr_name: attr_value})
        if not tag or not tag.get("content"):
            continue
        context_text = " ".join(
            [
                clean_text(tag.get("content", "")),
                clean_text(soup.title.get_text(" ", strip=True) if soup.title else ""),
            ]
        )
        for resolved in _resolve_asset_candidates(page_url, tag["content"]):
            remember(
                MediaCandidateRef(
                    url=resolved,
                    score=float(base_score),
                    source=f"meta:{attr_value}",
                    media_type=MEDIA_IMAGE,
                    context_text=context_text,
                )
            )

    for tag in soup.find_all(style=True):
        style_urls = _extract_style_background_urls(tag.get("style", ""))
        if not style_urls:
            continue
        score = _score_media_tag(
            tag,
            [
                clean_text(tag.get("id", "")),
                clean_text(" ".join(tag.get("class", []))),
                clean_text(tag.get("style", "")),
            ],
            MEDIA_IMAGE,
        ) - 8
        context_text = _extract_context_text(tag)
        for src in style_urls:
            for resolved in _resolve_asset_candidates(page_url, src):
                remember(
                    MediaCandidateRef(
                        url=resolved,
                        score=score,
                        source="style",
                        media_type=MEDIA_IMAGE,
                        context_text=context_text,
                    )
                )

    for img_tag in soup.find_all("img"):
        score = _score_media_tag(
            img_tag,
            [
                clean_text(img_tag.get("alt", "")),
                clean_text(img_tag.get("title", "")),
                clean_text(img_tag.get("src", "")),
                clean_text(" ".join(img_tag.get("class", []))),
                clean_text(img_tag.get("id", "")),
            ],
            MEDIA_IMAGE,
        )
        context_text = _extract_context_text(img_tag)
        for rank, src in enumerate(_extract_img_sources(img_tag)):
            for resolved in _resolve_asset_candidates(page_url, src):
                remember(
                    MediaCandidateRef(
                        url=resolved,
                        score=score - rank * 2,
                        source="img",
                        media_type=MEDIA_IMAGE,
                        context_text=context_text,
                    )
                )

    for video_tag in soup.find_all("video"):
        score = _score_media_tag(
            video_tag,
            [
                clean_text(video_tag.get("poster", "")),
                clean_text(video_tag.get("src", "")),
                clean_text(" ".join(video_tag.get("class", []))),
                clean_text(video_tag.get("id", "")),
                clean_text(video_tag.get_text(" ", strip=True)),
            ],
            MEDIA_VIDEO,
        )
        context_text = _extract_context_text(video_tag)
        poster_urls = _resolve_asset_candidates(page_url, video_tag.get("poster", ""))
        poster_url = poster_urls[0] if poster_urls else ""
        for rank, src in enumerate(_extract_video_sources(video_tag)):
            for resolved in _resolve_asset_candidates(page_url, src):
                remember(
                    MediaCandidateRef(
                        url=resolved,
                        score=score - rank * 2,
                        source="video",
                        media_type=MEDIA_VIDEO,
                        context_text=context_text,
                        poster_url=poster_url,
                    )
                )

    for tag in soup.find_all("a", href=True):
        href = clean_text(tag.get("href", ""))
        if not href:
            continue
        lowered = href.lower()
        media_type = None
        if any(lowered.endswith(ext) for ext in VIDEO_EXTENSIONS):
            media_type = MEDIA_VIDEO
        elif lowered.endswith(".gif"):
            media_type = MEDIA_IMAGE
        if not media_type:
            continue
        score = _score_media_tag(
            tag,
            [
                clean_text(tag.get_text(" ", strip=True)),
                href,
                clean_text(" ".join(tag.get("class", []))),
            ],
            media_type,
        ) - 4
        context_text = _extract_context_text(tag)
        for resolved in _resolve_asset_candidates(page_url, href):
            remember(
                MediaCandidateRef(
                    url=resolved,
                    score=score,
                    source="link",
                    media_type=media_type,
                    context_text=context_text,
                )
            )

    candidates = tuple(
        sorted(best_scores.values(), key=lambda item: item.score, reverse=True)[:MAX_FETCHED_CANDIDATES]
    )
    return PageMediaCatalog(page_url=page_url, status_code=status_code, candidates=candidates)


def find_image_candidates(page_url: str) -> list[MediaCandidateRef]:
    catalog = inspect_webpage(page_url)
    return [candidate for candidate in catalog.candidates if candidate.media_type == MEDIA_IMAGE]


def _looks_like_svg(raw_bytes: bytes, content_type: str, asset_url: str) -> bool:
    lowered_type = (content_type or "").lower()
    suffix = Path(urlparse(asset_url).path).suffix.lower()
    if "svg" in lowered_type or suffix == ".svg":
        return True
    prefix = raw_bytes[:512].lstrip().lower()
    return prefix.startswith(b"<svg") or b"<svg" in prefix[:256]


def _load_image_from_bytes(raw_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(raw_bytes))
    image = ImageOps.exif_transpose(image)
    if getattr(image, "is_animated", False):
        image.seek(0)
    image.load()
    return image.convert("RGBA")


def _background_uniformity_score(image: Image.Image) -> float:
    preview = image.convert("RGB").resize((64, 36), Image.Resampling.LANCZOS)
    corners = [
        preview.crop((0, 0, 8, 8)),
        preview.crop((56, 0, 64, 8)),
        preview.crop((0, 28, 8, 36)),
        preview.crop((56, 28, 64, 36)),
    ]
    corner_stats = [ImageStat.Stat(corner) for corner in corners]
    corner_color = tuple(
        int(sum(stat.mean[channel] for stat in corner_stats) / len(corner_stats))
        for channel in range(3)
    )
    background = Image.new("RGB", preview.size, corner_color)
    diff = ImageChops.difference(preview, background).convert("L")
    return ImageStat.Stat(diff).mean[0]


def _estimated_background_color(image: Image.Image) -> tuple[int, int, int]:
    preview = image.convert("RGB").resize((64, 36), Image.Resampling.LANCZOS)
    corners = [
        preview.crop((0, 0, 8, 8)),
        preview.crop((56, 0, 64, 8)),
        preview.crop((0, 28, 8, 36)),
        preview.crop((56, 28, 64, 36)),
    ]
    corner_stats = [ImageStat.Stat(corner) for corner in corners]
    return tuple(
        int(sum(stat.mean[channel] for stat in corner_stats) / len(corner_stats))
        for channel in range(3)
    )


def _content_bbox(image: Image.Image, threshold: int = 12) -> tuple[int, int, int, int] | None:
    rgb = image.convert("RGB")
    background = Image.new("RGB", rgb.size, _estimated_background_color(rgb))
    diff = ImageChops.difference(rgb, background).convert("L")
    mask = diff.point(lambda value: 255 if value > threshold else 0)
    return mask.getbbox()


def _content_occupancy_ratio(image: Image.Image) -> float:
    bbox = _content_bbox(image)
    if not bbox:
        return 1.0
    left, top, right, bottom = bbox
    width, height = image.size
    return ((right - left) * (bottom - top)) / max(width * height, 1)


def _crop_to_content(image: Image.Image) -> Image.Image:
    bbox = _content_bbox(image)
    if not bbox:
        return image

    width, height = image.size
    left, top, right, bottom = bbox
    margins = (left, top, width - right, height - bottom)
    if max(margins) < max(24, int(min(width, height) * 0.08)):
        return image

    pad_x = max(16, int((right - left) * 0.06))
    pad_y = max(16, int((bottom - top) * 0.08))
    crop_box = (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(width, right + pad_x),
        min(height, bottom + pad_y),
    )
    cropped = image.crop(crop_box)
    if cropped.width < 160 or cropped.height < 120:
        return image
    return cropped


def _skin_tone_ratio(image: Image.Image, box: tuple[int, int, int, int] | None = None) -> float:
    sample = image.convert("RGB").resize((128, 128), Image.Resampling.LANCZOS)
    if box is not None:
        sample = sample.crop(box)

    pixels = sample.convert("YCbCr").getdata()
    total = 0
    skin_like = 0
    for y_channel, cb_channel, cr_channel in pixels:
        total += 1
        if 77 <= cb_channel <= 127 and 133 <= cr_channel <= 173 and y_channel > 60:
            skin_like += 1

    return (skin_like / total) if total else 0.0


def _portrait_like_penalty(image: Image.Image) -> float:
    width, height = image.size
    aspect_ratio = width / max(height, 1)
    if not 0.82 <= aspect_ratio <= 1.22:
        return 0.0

    center_skin_ratio = _skin_tone_ratio(image, (32, 32, 96, 96))
    overall_skin_ratio = _skin_tone_ratio(image)
    if center_skin_ratio > 0.52 and overall_skin_ratio > 0.24:
        return 96.0
    if center_skin_ratio > 0.40 and overall_skin_ratio > 0.18:
        return 72.0
    return 0.0


def _score_downloaded_image(
    candidate: MediaCandidateRef,
    image: Image.Image,
    publication_title: str,
    publication_year: int,
) -> float:
    width, height = image.size
    aspect_ratio = width / max(height, 1)
    area = width * height
    score = candidate.score + _publication_match_bonus(candidate, publication_title, publication_year)

    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT or area < MIN_IMAGE_AREA:
        score -= 120
    elif area >= 1600 * 900:
        score += 28
    elif area >= 1280 * 720:
        score += 22
    elif area >= 960 * 540:
        score += 16
    elif area >= 640 * 360:
        score += 8
    else:
        score -= 10

    if 1.2 <= aspect_ratio <= 2.4:
        score += 18
    elif 0.9 <= aspect_ratio <= 3.0:
        score += 8
    elif aspect_ratio < MIN_IMAGE_ASPECT_RATIO or aspect_ratio > MAX_IMAGE_ASPECT_RATIO:
        score -= 120
    else:
        score -= 16

    texture_score = ImageStat.Stat(
        image.convert("L").resize((96, 54), Image.Resampling.LANCZOS)
    ).stddev[0]
    score += min(texture_score, 40) * 0.5

    background_uniformity = _background_uniformity_score(image)
    if background_uniformity < 10:
        score -= 12

    score -= _portrait_like_penalty(image)

    return score


def _build_card_image(source_image: Image.Image) -> Image.Image:
    target_width, target_height = CARD_SIZE
    source_rgb = _crop_to_content(source_image).convert("RGB")
    background = ImageOps.fit(
        source_rgb,
        CARD_SIZE,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    background = background.filter(ImageFilter.GaussianBlur(radius=28))
    background = ImageEnhance.Brightness(background).enhance(0.62)
    background = ImageEnhance.Color(background).enhance(0.9)

    canvas = background.convert("RGBA")
    max_foreground_width = int(target_width * 0.9)
    max_foreground_height = int(target_height * 0.86)
    foreground = ImageOps.contain(
        source_image,
        (max_foreground_width, max_foreground_height),
        method=Image.Resampling.LANCZOS,
    )
    foreground = foreground.filter(ImageFilter.UnsharpMask(radius=1.5, percent=110, threshold=2))

    frame_padding = 22
    frame_width = foreground.width + frame_padding * 2
    frame_height = foreground.height + frame_padding * 2
    frame_left = (target_width - frame_width) // 2
    frame_top = (target_height - frame_height) // 2
    frame_box = (
        frame_left,
        frame_top,
        frame_left + frame_width,
        frame_top + frame_height,
    )

    shadow_box = (
        frame_box[0] + 6,
        frame_box[1] + 10,
        frame_box[2] + 6,
        frame_box[3] + 10,
    )
    shadow_draw = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    shadow_draw.paste((0, 0, 0, 78), shadow_box)
    canvas = Image.alpha_composite(
        canvas,
        shadow_draw.filter(ImageFilter.GaussianBlur(radius=18)),
    )

    frame_overlay = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    frame_overlay.paste((252, 252, 252, 230), frame_box)
    canvas = Image.alpha_composite(canvas, frame_overlay)

    foreground_left = (target_width - foreground.width) // 2
    foreground_top = (target_height - foreground.height) // 2
    canvas.alpha_composite(foreground, (foreground_left, foreground_top))
    return canvas.convert("RGB")


def _write_card_image(page_url: str, image_url: str, image_dir: Path, card_image: Image.Image) -> str:
    digest = hashlib.md5(f"{page_url}|{image_url}|{PIPELINE_VERSION}".encode("utf-8")).hexdigest()[:12]
    filename = f"{digest}.png"
    out_path = image_dir / filename
    card_image.save(out_path, format="PNG", optimize=True)
    return f"/publications/recent_images/{filename}"


def _build_card_image_from_asset_url(page_url: str, asset_url: str, image_dir: Path) -> str:
    if not asset_url:
        return ""
    try:
        raw_bytes, content_type = _download_with_limit(asset_url, 10 * 1024 * 1024)
        if not raw_bytes or _looks_like_svg(raw_bytes, content_type, asset_url):
            return ""
        image = _load_image_from_bytes(raw_bytes)
    except Exception:
        return ""

    return _write_card_image(page_url, asset_url, image_dir, _build_card_image(image))


def _pick_binary_ext(asset_url: str, content_type: str, allowed_exts: set[str], fallback: str) -> str:
    parsed_ext = Path(urlparse(asset_url).path).suffix.lower()
    if parsed_ext in allowed_exts:
        return parsed_ext
    guessed = mimetypes.guess_extension((content_type or "").split(";")[0].strip())
    if guessed in allowed_exts:
        return guessed
    return fallback


def _download_with_limit(asset_url: str, byte_limit: int) -> tuple[bytes, str] | tuple[None, str]:
    session = _requests_session()
    response = session.get(asset_url, timeout=TIMEOUT_SECONDS, stream=True)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")
    chunks: list[bytes] = []
    total = 0
    for chunk in response.iter_content(chunk_size=1024 * 256):
        if not chunk:
            continue
        total += len(chunk)
        if total > byte_limit:
            response.close()
            return None, content_type
        chunks.append(chunk)

    return b"".join(chunks), content_type


def _choose_image_candidate(
    catalog: PageMediaCatalog,
    publication_title: str,
    publication_year: int,
    reserved_source_urls: set[str],
) -> EvaluatedImageCandidate | None:
    image_candidates = [candidate for candidate in catalog.candidates if candidate.media_type == MEDIA_IMAGE]
    prioritized = sorted(
        image_candidates,
        key=lambda candidate: (
            candidate.url in reserved_source_urls,
            -1 * (candidate.score + _publication_match_bonus(candidate, publication_title, publication_year)),
        ),
    )

    best_choice: EvaluatedImageCandidate | None = None
    for candidate in prioritized:
        if candidate.url in reserved_source_urls and best_choice is not None:
            continue

        try:
            raw_bytes, content_type = _download_with_limit(candidate.url, 10 * 1024 * 1024)
            if not raw_bytes or _looks_like_svg(raw_bytes, content_type, candidate.url):
                continue
            image = _load_image_from_bytes(raw_bytes)
        except Exception:
            continue

        score = _score_downloaded_image(candidate, image, publication_title, publication_year)
        if best_choice is None or score > best_choice.score:
            best_choice = EvaluatedImageCandidate(candidate=candidate, score=score, image=image)

    if best_choice is None or best_choice.score < 0:
        return None
    return best_choice


def _is_video_candidate_supported(candidate: MediaCandidateRef) -> bool:
    lowered = candidate.url.lower()
    if any(lowered.endswith(ext) for ext in VIDEO_EXTENSIONS):
        return True
    return candidate.source == "video"


def _download_video_to_public(page_url: str, video_url: str, image_dir: Path) -> str:
    raw_bytes, content_type = _download_with_limit(video_url, MAX_VIDEO_BYTES)
    if not raw_bytes:
        return ""

    lowered_type = (content_type or "").lower()
    lowered_url = video_url.lower()
    if not any(mime in lowered_type for mime in VIDEO_MIME_HINTS) and not any(
        lowered_url.endswith(ext) for ext in VIDEO_EXTENSIONS
    ):
        return ""

    ext = _pick_binary_ext(video_url, content_type, VIDEO_EXTENSIONS, ".mp4")
    digest = hashlib.md5(f"{page_url}|{video_url}|{PIPELINE_VERSION}".encode("utf-8")).hexdigest()[:12]
    filename = f"{digest}{ext}"
    out_path = image_dir / filename
    out_path.write_bytes(raw_bytes)
    return f"/publications/recent_images/{filename}"


def _public_asset_to_local_path(public_asset_path: str, image_dir: Path) -> Path | None:
    filename = Path(urlparse(public_asset_path).path).name
    if not filename:
        return None
    local_path = image_dir / filename
    return local_path if local_path.exists() else None


def _probe_video(local_video_path: Path) -> tuple[int, int, float] | None:
    ffprobe_path = shutil.which("ffprobe")
    if not ffprobe_path:
        return None

    command = [
        ffprobe_path,
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(local_video_path),
    ]
    try:
        result = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None

    if result.returncode != 0:
        return None

    values = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if len(values) < 3:
        return None

    try:
        width = int(float(values[0]))
        height = int(float(values[1]))
        duration = float(values[2])
    except ValueError:
        return None

    if width <= 0 or height <= 0:
        return None
    return width, height, max(duration, 0.0)


def _extract_video_frame(local_video_path: Path, seek_time: float) -> Image.Image | None:
    ffmpeg_path = shutil.which("ffmpeg")
    if not ffmpeg_path:
        return None

    with tempfile.TemporaryDirectory(prefix="publication-card-frame-") as temp_dir:
        frame_path = Path(temp_dir) / "frame.png"
        command = [
            ffmpeg_path,
            "-y",
            "-ss",
            f"{max(seek_time, 0.0):.3f}",
            "-i",
            str(local_video_path),
            "-frames:v",
            "1",
            "-vf",
            "thumbnail,scale=1280:-1",
            str(frame_path),
        ]
        try:
            result = subprocess.run(
                command,
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=30,
            )
        except (OSError, subprocess.TimeoutExpired):
            return None

        if result.returncode != 0 or not frame_path.exists():
            return None

        try:
            return _load_image_from_bytes(frame_path.read_bytes())
        except Exception:
            return None


def _video_frame_times(duration: float) -> list[float]:
    if duration <= 0:
        return [1.0, 0.0]

    fractions = (0.08, 0.22, 0.38, 0.55, 0.72, 0.88)
    times = []
    for fraction in fractions:
        seek_time = duration * fraction
        if duration > 1.0:
            seek_time = min(max(seek_time, 0.5), max(duration - 0.35, 0.0))
        times.append(seek_time)
    return [time for index, time in enumerate(times) if time not in times[:index]]


def _score_video_preview(
    candidate: MediaCandidateRef,
    image: Image.Image,
    publication_title: str,
    publication_year: int,
    video_width: int,
    video_height: int,
) -> float:
    score = _score_downloaded_image(candidate, image, publication_title, publication_year)
    aspect_ratio = video_width / max(video_height, 1)
    if 1.0 <= aspect_ratio <= 2.3:
        score += 18
    elif 0.85 <= aspect_ratio <= 2.6:
        score += 4
    elif 0.75 <= aspect_ratio <= 3.2:
        score -= 24
    else:
        score -= 96

    occupancy = _content_occupancy_ratio(image)
    if occupancy < 0.10:
        score -= 96
    elif occupancy < 0.18:
        score -= 54
    elif occupancy < 0.28:
        score -= 28
    elif occupancy > 0.55:
        score += 10

    return score


def _choose_video_asset(
    catalog: PageMediaCatalog,
    publication_title: str,
    publication_year: int,
    image_dir: Path,
    reserved_source_urls: set[str],
    image_reference_score: float | None = None,
) -> EvaluatedVideoCandidate | None:
    video_candidates = [candidate for candidate in catalog.candidates if candidate.media_type == MEDIA_VIDEO]
    prioritized = sorted(
        video_candidates,
        key=lambda candidate: (
            candidate.url in reserved_source_urls,
            -1 * (candidate.score + _publication_match_bonus(candidate, publication_title, publication_year)),
        ),
    )

    best_choice: EvaluatedVideoCandidate | None = None
    seen_local_videos: set[str] = set()

    for candidate in prioritized[:10]:
        if candidate.url in reserved_source_urls:
            continue
        if not _is_video_candidate_supported(candidate):
            continue
        match_score = candidate.score + _publication_match_bonus(candidate, publication_title, publication_year)
        if match_score < 36:
            continue

        try:
            local_video = _download_video_to_public(catalog.page_url, candidate.url, image_dir)
        except Exception:
            local_video = ""
        if not local_video or local_video in seen_local_videos:
            continue
        seen_local_videos.add(local_video)

        local_video_path = _public_asset_to_local_path(local_video, image_dir)
        if not local_video_path:
            continue
        probe = _probe_video(local_video_path)
        if not probe:
            continue
        video_width, video_height, duration = probe

        best_preview: Image.Image | None = None
        best_preview_score: float | None = None
        for seek_time in _video_frame_times(duration):
            preview = _extract_video_frame(local_video_path, seek_time)
            if preview is None:
                continue
            preview_score = _score_video_preview(
                candidate,
                preview,
                publication_title,
                publication_year,
                video_width,
                video_height,
            )
            if best_preview_score is None or preview_score > best_preview_score:
                best_preview = preview
                best_preview_score = preview_score

        if best_preview is None or best_preview_score is None or best_preview_score < 0:
            continue

        if image_reference_score is not None and best_preview_score < image_reference_score + 8:
            continue

        if best_choice is None or best_preview_score > best_choice.score:
            best_choice = EvaluatedVideoCandidate(
                candidate=candidate,
                score=best_preview_score,
                local_video=local_video,
                preview_image=best_preview,
            )

    return best_choice


def select_publication_card_asset(
    catalog: PageMediaCatalog,
    publication_title: str,
    publication_year: int,
    image_dir: Path,
    reserved_source_urls: set[str] | None = None,
    prefer_video: bool = True,
) -> PublicationCardAsset | None:
    reserved = set(reserved_source_urls or set())
    if catalog.status_code == 404:
        return PublicationCardAsset(
            status_code=404,
            media_type=MEDIA_IMAGE,
            media="",
            image="",
            poster="",
            source_url="",
            reserved_source_urls=(),
        )
    if catalog.status_code >= 400:
        return None

    image_choice = _choose_image_candidate(catalog, publication_title, publication_year, reserved)
    poster_path = ""
    used_urls: list[str] = []
    if image_choice:
        poster_path = _write_card_image(
            catalog.page_url,
            image_choice.candidate.url,
            image_dir,
            _build_card_image(image_choice.image),
        )
        used_urls.append(image_choice.candidate.url)

    if prefer_video:
        video_choice = _choose_video_asset(
            catalog,
            publication_title,
            publication_year,
            image_dir,
            reserved.union(used_urls),
            image_reference_score=image_choice.score if image_choice else None,
        )
        if video_choice:
            video_candidate = video_choice.candidate
            local_video = video_choice.local_video
            if video_candidate.poster_url:
                poster_path = _build_card_image_from_asset_url(
                    catalog.page_url,
                    video_candidate.poster_url,
                    image_dir,
                )
            if not poster_path:
                poster_path = _write_card_image(
                    catalog.page_url,
                    f"{video_candidate.url}#best-frame",
                    image_dir,
                    _build_card_image(video_choice.preview_image),
                )
            reserved_urls = [video_candidate.url]
            if used_urls:
                reserved_urls.extend(used_urls)
            if poster_path and video_candidate.poster_url:
                reserved_urls.append(video_candidate.poster_url)
            return PublicationCardAsset(
                status_code=catalog.status_code,
                media_type=MEDIA_VIDEO,
                media=local_video,
                image=poster_path or "/placeholder.svg",
                poster=poster_path or "/placeholder.svg",
                source_url=video_candidate.url,
                reserved_source_urls=tuple(_dedupe_keep_order(reserved_urls)),
            )

    if image_choice and poster_path:
        return PublicationCardAsset(
            status_code=catalog.status_code,
            media_type=MEDIA_IMAGE,
            media=poster_path,
            image=poster_path,
            poster=poster_path,
            source_url=image_choice.candidate.url,
            reserved_source_urls=(image_choice.candidate.url,),
        )

    return None


def build_card_image_from_webpage(page_url: str, image_dir: Path) -> str:
    catalog = inspect_webpage(page_url)
    asset = select_publication_card_asset(
        catalog,
        publication_title="",
        publication_year=0,
        image_dir=image_dir,
        reserved_source_urls=set(),
        prefer_video=False,
    )
    return asset.image if asset else ""
