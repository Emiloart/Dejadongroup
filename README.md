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

To enable administrator sign-in, copy `.env.example` to `.env.local`, set `ADMIN_EMAIL` and a strong, unique `ADMIN_PASSWORD` of at least 12 characters, then restart the application. These credentials are separate from client accounts and partner preview accounts. Never commit `.env.local` or real credentials.

The application stores products and uploaded photos on the server in `.data/` by default. In production, set `DEJADON_DATA_DIR` to an absolute directory on a persistent disk and run one application instance. Back up that directory together; it contains `products.json` and `uploads/`. Deployments on ephemeral or read-only filesystems require a persistent database/object-storage adapter before using product administration. Existing catalogue items start without invented prices or product photos.

Admin APIs require a signed, expiring HTTP-only session and verify the origin of write requests. Production hosting should use HTTPS. Clients, Products, Blog & news, and Newsletter are functional; the remaining admin operations sections continue to be placeholders.

## Agro-Real Estate client accounts

1. Open `/admin/clients`, add the client's verified name and information, and save the record. Email is optional at this stage; if entered, activation must use that same address.
2. Mark the information as verified and save. Enter the property name/location/reference, investment plan and progress, process steps, balance in NGN, and an **Actual Date with your own label** as available. Blank dates and balances display as unavailable rather than invented values.
3. Issue an activation token. Copy it immediately and provide it directly to the verified client; the raw token is shown only once. Tokens expire after seven days, can be revoked, and are invalidated by issuing a replacement. Client invite/referral links are not used.
4. The client chooses **Client → Activate account** at `/login`, enters the token, an email address (including Gmail), and a password of 10–128 characters. Successful activation consumes the token. Future sign-ins use email and password.

`/dashboard/client` shows only the signed-in client's property and map location, investment plan/progress, processes, Actual Date and label, balance, and withdrawal requests filtered by Pending, Processing or Successful. `/dashboard/client/profile` lets clients update their phone, email, and password; changing email or password requires the current password. Verified names and property/financial records are maintained by the administrator. Withdrawal records track requests; the dashboard does not send payments or calculate balances automatically. Admin updates appear on the client's next page load.

Client accounts and records are stored in `clients.json` in the same persistent `DEJADON_DATA_DIR`. Include this sensitive file in restricted backups. Passwords use salted scrypt hashes; activation tokens and opaque session tokens are stored as hashes. Sessions use HTTP-only, SameSite cookies, are secure in production, and expire after eight hours. Password changes revoke previous sessions; sign-out revokes the current session. Removing verification revokes pending tokens and signs out that client. Authentication/profile writes verify their origin and limit attempts; deployments should also apply rate limits at their trusted reverse proxy. Run one application instance with a persistent writable disk, as with the marketplace.

Earlier browser-local client preview accounts cannot access these records and must be activated using an administrator-issued token. Partner preview accounts and partner referral tools remain available separately. Run `npm run build` followed by `npm run test:clients` to check the account workflow with isolated temporary records.

## Blog, news, and newsletter

Use `/admin/news` to add a public blog or news URL. The server imports the source’s title, original preview image, and opening paragraph (or its description when article text is unavailable). There is no image upload or manual image-editing step. Articles publish immediately, and up to four can appear in the homepage carousel. Hide, refresh, remove, or reorder articles in the same workspace. Sites that block automated access, require sign-in, or render their article only in JavaScript may not provide a usable preview.

The preview reader permits only public HTTP(S) pages, validates DNS results and each redirect, pins connections to the validated public address, and limits download sizes and timeouts. Source HTML is converted to plain text; scripts and markup are not rendered in cards.

Newsletter signups are stored with consent timestamps and deduplicated by email address. `/admin/newsletter` provides a private subscriber list, removal controls, and CSV export for use with your email campaign service. The site captures subscriptions; sending newsletters requires your email service and is not performed by the signup form. No outbound email is sent automatically.

`news.json` and `newsletter.json` use the same persistent `DEJADON_DATA_DIR` as the marketplace. Include them in backups. Contact details are shown in the homepage contact section and on `/contact`; the footer uses separate branding, navigation, and copyright rows.
