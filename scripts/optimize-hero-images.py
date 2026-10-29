"""Prepare responsive hero assets (development utility; requires Pillow).

Run from the repository root after changing a source PNG:
    python -m pip install Pillow
    python scripts/optimize-hero-images.py
Runtime image conversion and Pillow are not required by the deployed website.
"""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
sources = {
    "main": "mainpage_hero.png",
    "agriculture": "agriculture_hero.png",
    "agro-real-estate": "Agro-realestate_hero.png",
    "flexisave": "Flexisave_hero.png",
    "partner": "Partnerprogram_hero.png",
}
output = root / "src" / "assets" / "heroes"
output.mkdir(parents=True, exist_ok=True)
for name, filename in sources.items():
    source = root / "src" / "assets" / filename
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        for width in (640, 1024, image.width):
            size = (width, round(image.height * width / image.width))
            target = output / f"{name}-{width}.webp"
            image.resize(size, Image.Resampling.LANCZOS).save(target, "WEBP", quality=80, method=6)
            print(f"{target.name}: {target.stat().st_size:,} bytes ({size[0]} x {size[1]})")
