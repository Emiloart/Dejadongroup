# Search indexing and browser icons

The public sitemap is served at `/sitemap.xml`. It contains the homepage, company and business pages, public business subpages, gallery, Partner Programme, contact page and currently published marketplace products. It reads the live catalogue on every request: publishing adds a product, while unpublishing or archiving removes it without a rebuild. Filters, URL fragments, external news sources, unfinished promotion content, account pages, private dashboards and administrative/API routes are excluded. Modification dates are omitted because the catalogue does not store reliable publication timestamps.

`/robots.txt` advertises the sitemap and allows public pages and product media. Administrative, account, payment-return and private API paths are excluded from crawling. Sign-in, dashboard, payment-return and administration pages also declare `noindex`. Access to private data continues to depend on authentication and backend permissions. Vercel preview deployments declare `noindex` and disallow crawling.

Public pages have their own canonical URL, title and description. Marketplace and gallery filters share the unfiltered page's canonical URL.

## Configure the current domain

Set `SITE_URL` to the site's **current public HTTPS origin**, without a path, query or fragment. Build and start the application with the same value. No payment/email secrets are needed for indexing.

```dotenv
SITE_URL=https://your-current-public-domain.example
```

If `SITE_URL` is unset, the origin falls back to `APP_BASE_URL`, then the Vercel production hostname (or deployment hostname), then the intended `https://dejadongroup.com`. On hosting other than Vercel, explicitly configure the current domain before requesting indexing. A localhost HTTP origin is allowed for development.

Once the custom domain is connected and working over HTTPS:

1. Set `SITE_URL=https://dejadongroup.com`, update `APP_BASE_URL` for partner verification/payment callbacks, and rebuild/redeploy.
2. Redirect the old public hostname and any `www` alias to the chosen canonical hostname through the hosting provider.
3. Verify the domain in Google Search Console and submit `https://dejadongroup.com/sitemap.xml`. Check representative pages with URL Inspection. A sitemap helps discovery; Google controls whether and when pages are indexed. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Favicon and FAQ navigation

The approved logo's emblem is used in `src/app/icon.svg`, a transparent multi-size `favicon.ico` (16/32/48 px), and a white-background 180 px `apple-icon.png`. Next.js serves and links these using its metadata file conventions.

Each homepage FAQ category is a direct link to a `#faqs` anchor on its destination. Agriculture links to its existing FAQ section; Agro-Real Estate links to its dedicated FAQ page. Flexisave, Partner Programme and Contact each have a destination FAQ section. The anchor clearance accommodates the sticky header, and individual answers expand on the destination page.
