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

## Agriculture education and editorial artwork

The agriculture landing page now includes a concise educational feature, “The work behind every meal,” covering agriculture's connection to food and livelihoods, food production, feed inputs and practical farming knowledge. Its company claims stay within the supplied workbook and existing public content: palm, pepper and cassava cultivation; poultry, fishery and Black Soldier Fly farming; and the wider group's agricultural consultancy and farm development. It does not claim measured food-price, feed-cost, yield or income improvements.

Background reading is linked in a compact disclosure on the page:

- [FAO: agriculture, food security and livelihoods](https://www.fao.org/cfs/policy-products/voluntary-guidelines-and-policy-recommendations/sustainable-agricultural-development-for-food-security-and-nutrition--what-roles-for-livestock).
- [WorldFish: fish-feed pressures in Nigeria](https://www.worldfishcenter.org/blog/listening-feed-system-field-insights-nigeria).
- [FAO: Edible insects, future prospects for food and feed security](https://www.fao.org/4/i3253e/i3253e.pdf), particularly its animal-feed discussion.

A new image was generated with the built-in imagegen tool, then saved in the repository. It is an editorial illustration, captioned as such on the page, rather than a photograph of De Jadon Group premises. The supplied pepper, broiler, catfish and palm-fruit photos provide the four agriculture navigation previews. The editorial artwork is kept outside the real-photograph gallery.

| Asset | Purpose | Bytes |
| --- | --- | ---: |
| `src/assets/editorial/agriculture-food-systems-source.png` | Original generated master, retained for future preparation | 3,715,241 |
| `src/assets/editorial/agriculture-food-systems-640.webp` | Small responsive version | 94,710 |
| `src/assets/editorial/agriculture-food-systems-960.webp` | Medium responsive version | 194,112 |
| `src/assets/editorial/agriculture-food-systems-1440.webp` | Large responsive version | 380,364 |

`content-media.ts` registers the prepared image; `agriculture-story.tsx` uses the existing responsive image component with explicit dimensions and lazy loading. The large PNG is never referenced by the page. Regenerate the WebP derivatives with the existing `scripts/optimize-content-images.py` development script (Pillow required). The public copy uses no em dashes.

Generation mode: built-in imagegen, new raster image, opaque background. Final prompt:

> Use case: illustration-story. Asset type: landscape editorial illustration for an educational agriculture feature on the De Jadon Group website. Primary request: a refined, inviting illustration about the relationship between productive land and everyday food. Scene: a plausible tropical Nigerian agricultural landscape, seen from a gently elevated viewpoint. Foreground cultivated green pepper plants with a few ripe peppers and richly textured soil; middle distance a modest well-kept freshwater fish pond with earthy banks and a small, separate poultry enclosure; a few oil palms and cultivated green fields beyond. Style: sophisticated hand-painted editorial gouache with fine botanical detail and subtle paper grain, natural proportions and an uncluttered composition. Broad calm shapes, restrained forest greens, warm earth and soft cream, gentle early morning light. Landscape 3:2 composition, full bleed, subjects comfortably inside the frame so it can crop slightly on mobile. This is a conceptual illustration, not documentary evidence of a specific company farm. No text, numbers, logos, diagrams, arrows, collage borders, watermarks, giant produce, floating objects or dramatic cinematic effects.

Validation: `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build` and `git diff --check` passed. Browser review passed at 375px, 768px and 1440px: the 220-word feature (including link labels), four photo previews, lazy-loaded illustration, keyboard-operated reading disclosure and internal links all worked, with no horizontal overflow, page errors or failed image requests. The article and agriculture page contain no em dashes.
