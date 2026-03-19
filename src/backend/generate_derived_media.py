from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = ROOT / "public"
LAB_LIFE_SOURCE_DIR = PUBLIC_DIR / "vpx-assets" / "about" / "lab-life"
LAB_LIFE_WEB_DIR = LAB_LIFE_SOURCE_DIR / "web"
HOME_GIF = PUBLIC_DIR / "vpx-assets" / "home" / "home_robot.gif"
HOME_MP4 = PUBLIC_DIR / "vpx-assets" / "home" / "home_robot.mp4"
PEOPLE_JSON_FILES = [
    PUBLIC_DIR / "people" / "faculty.json",
    PUBLIC_DIR / "people" / "phd.json",
    PUBLIC_DIR / "people" / "graduate.json",
    PUBLIC_DIR / "people" / "part-time.json",
    PUBLIC_DIR / "people" / "Undergraduate.json",
]
PROJECT_JSON_FILES = [
    PUBLIC_DIR / "content" / "ongoing-projects.json",
    PUBLIC_DIR / "content" / "completed-projects.json",
]
PUBLICATION_JSON_FILES = [
    PUBLIC_DIR / "publications" / "recent_publications.json",
    PUBLIC_DIR / "publications" / "project_publications.json",
]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
FFMPEG_PATH = shutil.which("ffmpeg")


def log(message: str) -> None:
    print(message)


def public_path_from_url(url: str) -> Path | None:
    if not url or not url.startswith("/"):
        return None
    return PUBLIC_DIR / url.lstrip("/")


def public_url_from_path(path: Path) -> str:
    return f"/{path.relative_to(PUBLIC_DIR).as_posix()}"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json_if_changed(path: Path, payload: Any) -> bool:
    rendered = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    current = path.read_text(encoding="utf-8")
    if current == rendered:
        return False
    path.write_text(rendered, encoding="utf-8")
    log(f"updated {path.relative_to(ROOT)}")
    return True


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def source_is_newer(source: Path, target: Path) -> bool:
    if not target.exists():
        return True
    return source.stat().st_mtime > target.stat().st_mtime


def save_image_derivative(
    source: Path,
    target: Path,
    *,
    max_dimension: int,
    quality: int = 82,
    copy_if_small: bool = False,
) -> bool:
    if not source.exists():
        return False

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)

        if copy_if_small and source.suffix.lower() == target.suffix.lower() and max(image.size) <= max_dimension:
            if target.exists() and target.stat().st_size == source.stat().st_size:
                return False
            ensure_parent(target)
            shutil.copy2(source, target)
            log(f"copied {target.relative_to(ROOT)}")
            return True

        if not source_is_newer(source, target):
            return False

        ensure_parent(target)

        if max(image.size) > max_dimension:
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

        suffix = target.suffix.lower()
        save_kwargs: dict[str, Any]

        if suffix in {".jpg", ".jpeg"}:
            if image.mode not in {"RGB", "L"}:
                alpha = image.getchannel("A") if "A" in image.getbands() else None
                background = Image.new("RGB", image.size, (255, 255, 255))
                background.paste(image.convert("RGB"), mask=alpha)
                image = background
            elif image.mode == "L":
                image = image.convert("RGB")
            save_kwargs = {
                "quality": quality,
                "optimize": True,
                "progressive": True,
            }
        elif suffix == ".png":
            save_kwargs = {"optimize": True}
        elif suffix == ".webp":
            if image.mode not in {"RGB", "RGBA"}:
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            save_kwargs = {"quality": quality, "method": 6}
        else:
            raise ValueError(f"Unsupported image output format: {target.suffix}")

        image.save(target, **save_kwargs)

    log(f"generated {target.relative_to(ROOT)}")
    return True


def run_ffmpeg(command: list[str], label: str) -> bool:
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as exc:
        log(f"warning: failed to generate {label}: {exc.stderr.strip() or exc.stdout.strip()}")
        return False
    log(f"generated {label}")
    return True


def ensure_home_background_video() -> bool:
    if not HOME_GIF.exists() or not FFMPEG_PATH:
        if HOME_GIF.exists() and not FFMPEG_PATH:
            log("warning: ffmpeg not available, skipped home background video refresh")
        return False
    if not source_is_newer(HOME_GIF, HOME_MP4):
        return False

    ensure_parent(HOME_MP4)
    return run_ffmpeg(
        [
            FFMPEG_PATH,
            "-y",
            "-i",
            str(HOME_GIF),
            "-movflags",
            "+faststart",
            "-pix_fmt",
            "yuv420p",
            "-vf",
            r"fps=18,scale=min(1280\,iw):-2:flags=lanczos",
            "-an",
            "-crf",
            "28",
            str(HOME_MP4),
        ],
        HOME_MP4.relative_to(ROOT).as_posix(),
    )


def ensure_lab_life_web_images() -> int:
    count = 0
    if not LAB_LIFE_SOURCE_DIR.exists():
        return count

    for source in sorted(LAB_LIFE_SOURCE_DIR.iterdir()):
        if not source.is_file() or source.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        target = LAB_LIFE_WEB_DIR / source.name
        if save_image_derivative(
            source,
            target,
            max_dimension=1600,
            quality=82,
            copy_if_small=True,
        ):
            count += 1
    return count


def people_source_url(current_url: str) -> str:
    return current_url.replace("/people/people_image/thumbs/", "/people/people_image/", 1)


def people_thumb_url(source_url: str) -> str:
    return source_url.replace("/people/people_image/", "/people/people_image/thumbs/", 1)


def ensure_people_thumbs() -> int:
    count = 0
    for json_path in PEOPLE_JSON_FILES:
        payload = load_json(json_path)
        changed = False

        for item in payload:
            image_url = (item.get("image") or "").strip()
            if not image_url.startswith("/people/people_image/"):
                continue

            source_url = people_source_url(image_url)
            source_path = public_path_from_url(source_url)
            if not source_path or not source_path.exists():
                continue

            thumb_url = people_thumb_url(source_url)
            thumb_path = public_path_from_url(thumb_url)
            if not thumb_path:
                continue

            if save_image_derivative(
                source_path,
                thumb_path,
                max_dimension=640,
                quality=82,
                copy_if_small=True,
            ):
                count += 1

            if item.get("image") != thumb_url:
                item["image"] = thumb_url
                changed = True

        if changed:
            write_json_if_changed(json_path, payload)

    return count


def resolve_existing_source_url(current_url: str, variant_prefix: str, source_prefix: str) -> str | None:
    if not current_url:
        return None

    if current_url.startswith(variant_prefix):
        relative = current_url.removeprefix(variant_prefix)
        variant_folder = Path(variant_prefix.rstrip("/")).name
        while relative.startswith(f"{variant_folder}/"):
            relative = relative.removeprefix(f"{variant_folder}/")
        candidate_base = PUBLIC_DIR / source_prefix.lstrip("/") / relative
        stem = candidate_base.with_suffix("")
        for extension in (candidate_base.suffix, ".png", ".jpg", ".jpeg", ".webp"):
            if not extension:
                continue
            candidate = stem.with_suffix(extension.lower())
            if candidate.exists():
                return public_url_from_path(candidate)
        return None

    if current_url.startswith(source_prefix):
        source_path = public_path_from_url(current_url)
        return current_url if source_path and source_path.exists() else None

    return None


def project_card_url(source_url: str) -> str:
    if source_url.startswith("/content/ongoing_image/"):
        target = source_url.replace("/content/ongoing_image/", "/content/ongoing_image/card/", 1)
    else:
        target = source_url.replace("/content/completed_image/", "/content/completed_image/card/", 1)
    return str(Path(target).with_suffix(".jpg")).replace("\\", "/")


def ensure_project_card_images() -> int:
    count = 0
    for json_path in PROJECT_JSON_FILES:
        payload = load_json(json_path)
        changed = False

        for item in payload:
            candidates = [
                (item.get("thumbnail") or "").strip(),
                *((item.get("images") or [])[:1]),
                (item.get("image") or "").strip(),
            ]

            source_url = None
            for candidate in candidates:
                source_url = resolve_existing_source_url(
                    candidate,
                    "/content/ongoing_image/card/",
                    "/content/ongoing_image/",
                ) or resolve_existing_source_url(
                    candidate,
                    "/content/completed_image/card/",
                    "/content/completed_image/",
                )
                if source_url:
                    break

            if not source_url:
                continue

            source_path = public_path_from_url(source_url)
            target_url = project_card_url(source_url)
            target_path = public_path_from_url(target_url)
            if not source_path or not target_path:
                continue

            if save_image_derivative(
                source_path,
                target_path,
                max_dimension=1280,
                quality=82,
                copy_if_small=False,
            ):
                count += 1

            if item.get("thumbnail") != target_url:
                item["thumbnail"] = target_url
                changed = True

        if changed:
            write_json_if_changed(json_path, payload)

    return count


def publication_source_video_url(current_url: str) -> str:
    if "_card." not in current_url:
        return current_url
    stem, suffix = current_url.rsplit("_card", 1)
    original = f"{stem}{suffix}"
    original_path = public_path_from_url(original)
    if original_path and original_path.exists():
        return original
    return current_url


def publication_card_video_url(source_url: str) -> str:
    source_path = Path(source_url)
    return str(source_path.with_name(f"{source_path.stem}_card{source_path.suffix}")).replace("\\", "/")


def ensure_publication_card_videos() -> int:
    count = 0
    for json_path in PUBLICATION_JSON_FILES:
        payload = load_json(json_path)
        changed = False

        for item in payload.get("publications", []):
            if item.get("mediaType") != "video":
                continue

            current_media = (item.get("media") or "").strip()
            if not current_media:
                continue

            source_url = publication_source_video_url(current_media)
            source_path = public_path_from_url(source_url)
            if not source_path or not source_path.exists():
                continue

            if not FFMPEG_PATH:
                log("warning: ffmpeg not available, skipped publication card previews")
                break

            target_url = publication_card_video_url(source_url)
            target_path = public_path_from_url(target_url)
            if not target_path:
                continue

            if source_is_newer(source_path, target_path):
                ensure_parent(target_path)
                if run_ffmpeg(
                    [
                        FFMPEG_PATH,
                        "-y",
                        "-ss",
                        "0",
                        "-t",
                        "12",
                        "-i",
                        str(source_path),
                        "-an",
                        "-vf",
                        r"fps=24,scale=min(960\,iw):-2:flags=lanczos",
                        "-c:v",
                        "libx264",
                        "-preset",
                        "medium",
                        "-crf",
                        "28",
                        "-movflags",
                        "+faststart",
                        "-pix_fmt",
                        "yuv420p",
                        str(target_path),
                    ],
                    target_path.relative_to(ROOT).as_posix(),
                ):
                    count += 1

            if item.get("media") != target_url and target_path.exists():
                item["media"] = target_url
                changed = True

        if changed:
            write_json_if_changed(json_path, payload)

    return count


def main() -> int:
    total_updates = 0
    total_updates += ensure_lab_life_web_images()
    total_updates += ensure_people_thumbs()
    total_updates += ensure_project_card_images()
    total_updates += ensure_publication_card_videos()
    if ensure_home_background_video():
        total_updates += 1

    log(f"derived media refresh complete ({total_updates} updates)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
