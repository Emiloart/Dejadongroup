"""Prepare supplied photos and editorial artwork (development only; requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
sources = {
    "ceo": ("ceo_dejadongroup.jpg", 960),
    "broiler-chickens": ("Broiler_chicken.jpg", 1280),
    "catfish": ("Freshfromfarmcatfishphoto.JPG", 960),
    "green-peppers": ("Greenpepperimage.JPG", 960),
    "pepper-plant": ("Healthypepperplant.jpg", 960),
    "palm-fruit": ("palmfruitintree.jpg", 1280),
    "alaoma-estate-visit": ("Group_photo_in_alaomaestate.jpg", 960),
    "team-outreach": ("team_outreach_group_image.JPG", 960),
}
output = root / "src" / "assets" / "photos"
output.mkdir(parents=True, exist_ok=True)
for name, (filename, limit) in sources.items():
    source = root / "src" / "assets" / filename
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        maximum = min(image.width, limit)
        for width in sorted({min(640, maximum), min(960, maximum), maximum}):
            size = (width, round(image.height * width / image.width))
            target = output / f"{name}-{width}.webp"
            image.resize(size, Image.Resampling.LANCZOS).save(target, "WEBP", quality=80, method=6)
            print(f"{target.name}: {target.stat().st_size:,} bytes; source {source.stat().st_size:,}")

# Keep the generated original alongside its derivatives, outside the real-photo gallery.
editorial = root / "src" / "assets" / "editorial"
with Image.open(editorial / "agriculture-food-systems-source.png") as original:
    image = ImageOps.exif_transpose(original).convert("RGB")
    for width in (640, 960, min(1440, image.width)):
        target = editorial / f"agriculture-food-systems-{width}.webp"
        image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS).save(target, "WEBP", quality=80, method=6)
        print(f"{target.name}: {target.stat().st_size:,} bytes")
