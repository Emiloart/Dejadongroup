# De Jadon Group

De Jadon Group is a Nigerian investment and wealth-creation company focused on practical opportunities for individuals, families, businesses and organizations to build and preserve wealth.

The current website presents the group's active public business areas:

- **Agriculture**: crop farming, livestock and agricultural products.
- **Agro-Real Estate**: agricultural land sales, agricultural consultancy/advice and farm development.
- **Partner Program**: a referral-based program where partners can introduce prospective customers and earn a 10% commission when a referred prospect becomes a paying client.

## Agriculture

Current agricultural operations presented on the site include:

- Palm
- Pepper
- Cassava
- Poultry
- Fishery
- Black Soldier Fly (BSF / maggot)

Current products supplied for publication:

- Fish Heads
- Cutlets
- Fish Tail

## Agro-Real Estate

De Jadon Group defines Agro-Real Estate as the combination of agriculture and real estate, where land is acquired, developed, managed or sold specifically for agricultural purposes and related investments.

Current services:

1. Agricultural Land Sales
2. Agricultural Consultancy / Advice
3. Farm Development

The supplied customer process covers inspection, subscription, payment, allocation and transfer documentation.

## Partner Program

The current confirmed referral rule is:

> Partners receive a 10% commission when a referred prospect becomes a paying client.

Additional partner packages, tiers and program terms will be published only after they are formally supplied by De Jadon Group.

## Contact

**Office:** Shop C15 Ebube Dike Shopping Mall, Umuodu Road, Good Will Junction, Nodu, Okpuno, Awka, Anambra State.

**Phone:** 08070458759  
**Email:** dejadongroup@gmail.com  
**Working hours:** 8:30am – 5:00pm

## Website Content

The website content is based on the information supplied by De Jadon Group during the content collection process. Items that have not been formally supplied, including additional product catalogue details, product photography, business-section videos, social links and expanded Partner Program terms, are intentionally not fabricated.

## Project

This repository contains the De Jadon Group public website and its supporting content structure.

Built for De Jadon Group.

## Marketplace administration

The marketplace is managed at `/admin/products`. Administrators can upload JPG, PNG or WebP photos (up to 5 MB), enter NGN prices and pack sizes, describe products, set availability, and save drafts or publish listings. Published changes are read by the public catalogue without rebuilding the website. Drafts are hidden from product listings and direct product URLs.

To enable administrator sign-in, copy `.env.example` to `.env.local`, set `ADMIN_EMAIL` and a strong, unique `ADMIN_PASSWORD` of at least 12 characters, then restart the application. These credentials are separate from the client and partner preview accounts. Never commit `.env.local` or real credentials.

The application stores products and uploaded photos on the server in `.data/` by default. In production, set `DEJADON_DATA_DIR` to an absolute directory on a persistent disk and run one application instance. Back up that directory together; it contains `products.json` and `uploads/`. Deployments on ephemeral or read-only filesystems require a persistent database/object-storage adapter before using product administration. Existing catalogue items start without invented prices or product photos.

Admin APIs require a signed, expiring HTTP-only session and verify the origin of write requests. Production hosting should use HTTPS. The remaining admin operations sections continue to be placeholders; Products is functional.
