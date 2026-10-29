# De Jadon Group

Public website, marketplace, Agro-Real Estate client portal, verified Partner Programme and department administration for De Jadon Group, Nigeria. Built with Next.js 14, React 18 and TypeScript.

## Development

```sh
npm install
cp .env.example .env.local
npm run dev
```

Configure server-only credentials in `.env.local`; never commit real credentials. Initial administrator passwords require at least 12 characters. Use `/admin` to sign in and `/admin/users` to provision named staff. Invitations activate at `/admin-activate`.

## Administration

Six areas share one permission-aware shell: Media & Content, Sales & Marketplace, Partner Programme, Client & Agro-Real Estate, Finance & Payments, and Super Admin. APIs enforce explicit permissions and client/partner record scopes. Promo modification and staff role assignments are exclusive to Super Admin. Finance reviewers do not receive refund/payout execution permissions by default.

- [Audit and migration plan](docs/admin/audit.md)
- [Architecture, departments, permissions and API map](docs/admin/architecture.md)
- [Financial workflows and entitlement policy](docs/admin/financial-workflows.md)
- [Deployment, bootstrap, migrations, backups and recovery](docs/admin/operations.md)
- [Business information and portal workflows](docs/website-and-portals.md)
- [Content workbook review and hero-image preparation](docs/content/workbook-review.md)
- [Sitemap, domain configuration, favicons and FAQ navigation](docs/search-indexing.md)
- [Release verification and limitations](docs/admin/release.md)

## Production requirements

Use HTTPS, **one application process**, and a restricted persistent writable `DEJADON_DATA_DIR`. The JSON adapter coordinates changes through a recoverable write journal; it is not a multi-process database. Run the additive migration with `npm run migrate:admin` while the application is stopped. Set `DEJADON_DATA_DIR` in the command environment; this standalone script does not load `.env.local`. First administrator sign-in also runs the idempotent migration.

Partner email verification uses Resend. NGN registration, upgrades and immediate ₦100 verification-fee refund requests use Paystack. Configure credentials, webhook and reconciliation scheduler as described in the runbook. Missing provider configuration fails closed.

Marketplace checkout/orders, quantity inventory, shipping, commission accounting and client payout execution are unavailable. Client balances are explicitly manual; withdrawal approval never claims that money was transferred.

## Verification

```sh
npm run lint
npx tsc --noEmit --incremental false
npm run build
npm run test:content
npm run test:marketplace
npm run test:clients
npm run test:partners
npm run test:admin
```

Integration suites use isolated temporary data and test-only provider interception. They never charge real customers or send real verification email.
