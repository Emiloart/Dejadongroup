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

Partner tiers, fees, benefits and promo codes are configured by the Super Admin at `/admin/partners`. No example tier prices or benefits are seeded into the live programme.

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

Admin APIs require a signed, expiring HTTP-only session and verify the origin of write requests. Production hosting should use HTTPS. Clients, the Partner Programme, Products, Blog & news, and Newsletter are functional; the remaining admin operations sections continue to be placeholders.

## Agro-Real Estate client accounts

1. Open `/admin/clients`, add the client's verified name and information, and save the record. Email is optional at this stage; if entered, activation must use that same address.
2. Mark the information as verified and save. Enter the property name/location/reference, investment plan and progress, process steps, balance in NGN, and an **Actual Date with your own label** as available. Blank dates and balances display as unavailable rather than invented values.
3. Issue an activation token. Copy it immediately and provide it directly to the verified client; the raw token is shown only once. Tokens expire after seven days, can be revoked, and are invalidated by issuing a replacement. Client invite/referral links are not used.
4. The client chooses **Client → Activate account** at `/login`, enters the token, an email address (including Gmail), and a password of 10–128 characters. Successful activation consumes the token. Future sign-ins use email and password.

`/dashboard/client` shows only the signed-in client's property and map location, investment plan/progress, processes, Actual Date and label, balance, and withdrawal requests filtered by Pending, Processing or Successful. `/dashboard/client/profile` lets clients update their phone, email, and password; changing email or password requires the current password. Verified names and property/financial records are maintained by the administrator. Withdrawal records track requests; the dashboard does not send payments or calculate balances automatically. Admin updates appear on the client's next page load.

Client accounts and records are stored in `clients.json` in the same persistent `DEJADON_DATA_DIR`. Include this sensitive file in restricted backups. Passwords use salted scrypt hashes; activation tokens and opaque session tokens are stored as hashes. Sessions use HTTP-only, SameSite cookies, are secure in production, and expire after eight hours. Password changes revoke previous sessions; sign-out revokes the current session. Removing verification revokes pending tokens and signs out that client. Authentication/profile writes verify their origin and limit attempts; deployments should also apply rate limits at their trusted reverse proxy. Run one application instance with a persistent writable disk, as with the marketplace.

Earlier browser-local client preview accounts cannot access these records and must be activated using an administrator-issued token. Partner accounts use the separate verified registration flow below. Run `npm run build` followed by `npm run test:clients` to check the account workflow with isolated temporary records.

## Partner Programme registration and administration

Partner accounts now live on the server. Earlier browser preview accounts do not grant membership and must register and verify their email. Client and partner sessions remain independent so users can switch portals without signing out of the other account.

Registration has two stages:

1. Enter full name, email and password. Resend sends a six-digit email OTP, valid for ten minutes and limited to five attempts. Resends have a 60-second cooldown and replace the previous code. Unverified accounts cannot submit personal details, open checkout or access benefits.
2. After verification, supply phone, account number, location, DOB, occupation and origin/nationality. Choose an available tier, optionally apply a promo code, review the server-calculated total and complete Paystack checkout. A partial account can sign in later to continue registration.

The dashboard shows the current tier, protected member benefit content, registration/payment/refund status and higher-tier previews. Upgrades charge **the difference between the currently published prices** of the current and selected higher tier, floored at zero. Existing benefits remain until payment confirmation. A zero-fee registration or zero-difference upgrade needs no external charge; all verification and personal-detail requirements still apply. Referral links/QR codes, profile photos and usernames, network introductions, product links, marketing resources and the existing finance sections remain. Commission balances and payouts are not invented or calculated from registration payments.

The Super Admin can create/edit tiers, order them, set NGN fees, publish/hide registration options and configure public benefit summaries plus protected member content. Hiding a tier stops new checkouts but preserves existing members. Changes to benefit content apply on the member's next refresh. Higher tier order determines upgrade eligibility. Tier prices and benefits require no code changes. Configure prices and partial discounts to keep positive charges at or above [Paystack's NGN transaction minimum](https://paystack.com/docs/api/#supported-currency); a zero-fee transaction needs no gateway charge.

Promo controls are restricted to the Super Admin, including every API write and read of the programme management workspace. Codes support percentage or fixed NGN discounts, eligible tiers, activation, validity dates, total/per-partner usage limits and an optional verified-email allowlist. Promos apply to initial registration only. Usage reservations and tier grants share one atomic server transaction so concurrent checkouts cannot reserve the last use twice. Checkout amounts and terms are saved for up to 30 minutes (or the promo's earlier expiry); changing or disabling a promo affects new quotes. Confirmed uses cannot be reset by renaming a code. Cancelled, underpaid, mismatched or late successful checkouts do not grant membership and queue a full refund.

When a promo covers the full registration fee, checkout instead requires explicit acknowledgement and payment of **₦100 as a refundable eligibility fee**. On server-confirmed success, the backend records the refund job and immediately requests the full ₦100 refund. Membership remains valid after this expected refund. Paystack/banks determine actual credit timing, which is displayed separately; the site does not claim an instant bank credit. Refund events and reconciliation update Pending/Processing/Processed/Failed/Needs Attention statuses. An ambiguous network response is reconciled against existing Paystack refunds before retrying, preventing duplicate refund requests. The Super Admin can reconcile/retry a failed or ambiguous refund; refunds requiring bank details must be completed in Paystack and checked again here.

### Owner and ordinary admin access

On existing single-owner installations, `ADMIN_EMAIL` / `ADMIN_PASSWORD` is the Super Admin. To add an ordinary admin, set distinct `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` for the owner and use `ADMIN_*` for the ordinary account. Passwords must contain at least 12 characters. An ordinary admin can continue using existing client/content tools but cannot manage partner tiers, benefits, promo codes or programme payments. Partially configured Super Admin credentials never elevate the ordinary admin. Changed admin credentials invalidate existing admin sessions.

### Connect Resend and Paystack

Set the server-only values in `.env.local` using [.env.example](.env.example): `RESEND_API_KEY`, `RESEND_FROM` (a verified Resend sender), `PAYSTACK_SECRET_KEY`, `APP_BASE_URL` (the site's HTTPS origin), and a random `PARTNER_RECONCILE_SECRET` of at least 32 characters. No service secrets are sent to browsers. Restart the application after configuring them. Missing email/payment credentials fail closed; the application does not simulate delivery or successful payments.

In Paystack, configure the webhook URL as `https://YOUR-DOMAIN/api/paystack/webhook`. Payment callbacks use `/partner-programme/payment`. The backend validates the raw-body HMAC signature, then independently verifies successful transactions, reference, NGN amount, payer email, payment environment and saved checkout eligibility. Callback parameters and client-supplied amounts/statuses cannot activate a tier. Duplicate webhook/callback deliveries are idempotent.

Configure a scheduler to POST to `/api/internal/partner-payments/reconcile` every minute, with `Authorization: Bearer YOUR_PARTNER_RECONCILE_SECRET`. This recovers pending payments and queued refunds after interruptions. Uncertain refund submissions are reconciled and escalated for Super Admin review rather than blindly submitted again. Configure trusted reverse-proxy rate limits as well as the application's authentication/OTP limits.

Use separate persistent data directories for Paystack test and live environments. Payments are labelled with their environment, and test payments do not grant entitlements when live keys are active. `partner-programme.json` stores accounts, salted scrypt password hashes, hashed sessions and OTPs, tier/promo configuration, reservations, payment/refund records and a bounded audit log. Back up this sensitive file with restricted access. This JSON adapter, like the marketplace, requires one application instance and a persistent writable disk; use a transactional database adapter before scaling to multiple instances.

After a production build, `npm run test:partners` runs domain and HTTP integration checks. The HTTP harness preloads test-only provider interception into its child process and uses isolated temporary storage; production application code contains no payment or email bypass. Tests never send real email, charge a customer or request a live refund. Provider references: [Paystack verification](https://paystack.com/docs/payments/verify-payments/), [Paystack webhooks](https://paystack.com/docs/payments/webhooks/), [Paystack refunds](https://paystack.com/docs/payments/refunds/), [Resend email API](https://resend.com/docs/api-reference/emails/send-email).

## Blog, news, and newsletter

Use `/admin/news` to add a public blog or news URL. The server imports the source’s title, original preview image, and opening paragraph (or its description when article text is unavailable). There is no image upload or manual image-editing step. Articles publish immediately, and up to four can appear in the homepage carousel. Hide, refresh, remove, or reorder articles in the same workspace. Sites that block automated access, require sign-in, or render their article only in JavaScript may not provide a usable preview.

The preview reader permits only public HTTP(S) pages, validates DNS results and each redirect, pins connections to the validated public address, and limits download sizes and timeouts. Source HTML is converted to plain text; scripts and markup are not rendered in cards.

Newsletter signups are stored with consent timestamps and deduplicated by email address. `/admin/newsletter` provides a private subscriber list, removal controls, and CSV export for use with your email campaign service. The site captures subscriptions; sending newsletters requires your email service and is not performed by the signup form. No outbound email is sent automatically.

`news.json` and `newsletter.json` use the same persistent `DEJADON_DATA_DIR` as the marketplace. Include them in backups. Contact details are shown in the homepage contact section and on `/contact`; the footer uses separate branding, navigation, and copyright rows.
