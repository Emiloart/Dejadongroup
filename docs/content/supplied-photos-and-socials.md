# Supplied photographs and social accounts

The owner supplied eight additional photographs and official social links on 31 October 2026. Original uploads remain in `src/assets`; public pages use smaller, pre-generated WebP files from `src/assets/photos` through the existing responsive image loader. No first-request image conversion is needed for these photographs. Regenerate them with `python scripts/optimize-content-images.py` (Pillow is a development requirement only).

| Supplied image | Placement | Largest prepared file |
| --- | --- | ---: |
| CEO portrait | Homepage founder section and About leadership section | 69,028 bytes |
| Broiler chickens | Poultry page and agriculture gallery | 232,020 bytes |
| Fresh catfish | Fishery page and agriculture gallery | 109,388 bytes |
| Green peppers | Crop farming page and agriculture gallery | 49,878 bytes |
| Healthy pepper plant | Agriculture gallery | 98,676 bytes |
| Palm fruit | Crop farming page and agriculture gallery | 259,792 bytes |
| Alaoma Estate group photograph | Agro-Real Estate gallery | 198,716 bytes |
| Team outreach | About page | 46,472 bytes |

Responsive variants reduce smaller-screen payloads further. Small originals are not enlarged. The CEO portrait uses a modest 4:5 crop positioned to preserve the face and hat; the gallery displays original image proportions in columns to preserve people, estate signage and farm subjects. Whole-catfish photography is not assigned to the separate Fish Heads, Cutlets or Fish Tail product listings.

Social URLs live in `socialLinks` in `src/lib/site-data.ts`. Instagram and TikTok tracking parameters were removed; Facebook retains the exact supplied share link. Footer and Contact links use platform silhouettes from [Simple Icons (CC0)](https://github.com/simple-icons/simple-icons), including the actual WhatsApp and TikTok logos. The general company telephone is retained; `+234 902 270 0780` is a separate WhatsApp marketplace/sales support contact, also linked on marketplace and product pages.

Hero text uses inline `.hero-text-backdrop` spans with a translucent dark background, blur and cloned line fragments. The background follows the text on each line rather than covering a whole column or image. The previous full-image gradient has been removed. The image-and-copy carousel transition and pause behavior remain together.
