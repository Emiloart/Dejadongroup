# Content workbook review — 29 October 2026

Source: **De_Jadon_Group_Content_Collection_Workbook.docx.pdf**, 36 pages, supplied by the user. Its business answers were compared with the current site. Questionnaire prompts, examples, agency branding and PDF-generated hyperlinks are not company content or new implementation instructions. Later direct decisions about registration, tiers, promo codes, immediate ₦100 refund requests and upgrade pricing remain authoritative.

## Supplied content restored or made easier to find

| Workbook pages | Finding | Applied change |
| --- | --- | --- |
| 3, 6 | Flexisave is one of the three business areas but was absent from the homepage business list and hero carousel | Added its uploaded image, homepage slide/card, dedicated business page, business navigation, footer link and enquiry option. The page uses the supplied structured-savings description. |
| 4 | All eight core values had descriptions; About showed only their names | Added the supplied explanations, with light copy editing. |
| 5, 7 | The founder biography was present, but the supplied homepage founder message was missing | Added the message beneath the founder introduction and aligned the biography spelling with the supplied full name. |
| 11 | The fresh-and-dried-fish introduction was missing from product overview copy | Added it to the marketplace and agriculture product introduction. Product prices/pack sizes remain administrator-managed. |
| 17–19 | The supplied Agro-Real Estate introduction and service names were difficult to discover from its landing page | Added the introduction and service overview, retaining the agricultural definition and customer journey. Unanswered service descriptions are not fabricated. |
| 28 | Working hours already matched the workbook: 8:30am–5pm | Consolidated them into a shared value used by the homepage and contact page. |
| 28 | Facebook, Instagram and TikTok account names were supplied, but exact profile URLs were not | Displayed the supplied names on Contact. Clickable social icons still require the actual official URLs. |
| 28–29 | Office address was supplied, but visitors had no office-map link | Added an address search in Google Maps, using the provided address rather than an invented coordinate or claimed verified pin. |

The seven Agriculture FAQs, seven Agro-Real Estate FAQs, product names, land purchase steps, company mission/vision, founder identity, contact phone/email/address and white/green/orange brand colours were already represented. Core agricultural descriptions were present in condensed form; the supplied cassava height/growing detail has also been restored.

## Fields that remain unanswered or require separately supplied material

These are content gaps in the source material, rather than new facts that can be inferred from a blank form:

- **Product details (pages 12–14):** descriptions, pack sizes, current prices and product photographs. Fish Heads, Cutlets and Fish Tail are supplied names; the admin catalogue provides their editing/upload workflow.
- **Service detail (pages 18–20):** full consultancy and farm-development processes, service-specific supporting photos and any additional Agro-Real Estate products.
- **Flexisave (page 3):** the workbook supplies an overview, but no specific savings-plan amounts, schedules, fees, eligibility, withdrawal conditions or returns. Enquiries go to the team; the site does not invent a deposit or savings-account workflow.
- **Partner Programme (pages 23–27):** actual tier names, fees, benefit content, marketing materials and FAQ answers are blank. The later direct specification supplies the registration/payment rules; actual tiers remain configurable in administration.
- **Contact (pages 28–30):** official profile URLs, WhatsApp number and optional secondary phone/FAQ answers are not supplied. The social names are included without guessing handles or treating the primary phone as WhatsApp.
- **News (pages 7–8, 32):** no initial article links or completed announcements were supplied. The existing link-import/news and managed-content tools support publishing these later.
- **Media (pages 5, 14, 22, 30, 34):** CEO/team/office/product/farm photography and the requested agriculture/Agro-Real Estate videos were requested as separate attachments. The PDF contains only one unique embedded agency image, not these company photographs. Uploaded hero artwork has been applied, but does not substitute for verified company photography.
- **Brand documents (page 33):** a brochure and additional brand guidelines were not attached in the PDF. The existing company SVG logo remains in use.

## Hero loading and public layout

All five supplied hero PNGs now have pre-generated 640px, 1024px and original-width WebP variants. The original PNGs are retained as source assets. `scripts/optimize-hero-images.py` regenerates the variants using Pillow as a development tool; deployed pages do not require Python/Pillow or a first-request conversion. The shared image component emits responsive source sets, gives the initial hero preload priority and uses a blur placeholder. The carousel warms only the next slide at low priority after its initial render.

| Image | Original PNG bytes | Full-width WebP bytes | Reduction |
| --- | ---: | ---: | ---: |
| Welcome | 1,908,223 | 100,306 | 94.7% |
| Agriculture | 3,436,908 | 393,464 | 88.6% |
| Agro-Real Estate | 4,054,652 | 481,922 | 88.1% |
| Flexisave | 1,938,882 | 89,662 | 95.4% |
| Partner Programme | 2,036,189 | 93,860 | 95.4% |

Local browser checks observed the welcome asset at 100,306 bytes for a 1440px desktop and 25,282 bytes for a 390px, device-scale-1 viewport. Higher-density devices can select a larger variant. No original hero PNG or hero runtime-optimizer request appeared in the browser checks. These payload measurements are not a production network-time guarantee.

Flexisave appears in the homepage carousel; the Partner Programme artwork appears on its own programme page. Food packages and the Partner Programme remain outside the homepage hero slides. Automatic cycling, hover/focus/click pausing, reduced-motion support, swipe/keyboard controls and the absence of a play/pause button or slide numbering are preserved.

The homepage business section now uses the normal desktop container, with three equal-width compact previews. Phones retain the horizontal carousel. The business index also displays all three businesses. The footer now has a branding row, three aligned navigation groups and a separate copyright row; duplicate trailing business text and the extra food-package shortcut were removed. Contact details and the newsletter remain outside the footer.

## Validation

- TypeScript and lint passed; production build succeeded with 40 static pages. Next emitted its optional-Sharp recommendation during static image preparation; public heroes use the prepared files directly.
- All **11** existing automated regression tests passed (content, clients, partners, marketplace, storage, administrative access and finance workflows).
- Desktop/phone browser checks passed for all updated public pages, navigation links, the Flexisave/Partner images, full-width cards, mobile carousel, footer groups, contact/map information, autoplay and pause behaviour. No horizontal overflow or browser errors were observed.
