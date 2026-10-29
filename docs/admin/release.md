# Department administration release — 29 October 2026

## Audit findings

The prior application had working product/news/newsletter stores, secure client token activation and verified Paystack/Resend partner registration. It had two environment-based administrator identities, broadly shared ordinary-admin access, nonrevocable signed admin sessions, placeholder sections, editable client financial outcomes and no central accountable audit. Purchased benefits followed mutable tier settings. See [the pre-implementation audit](audit.md).

## Delivered scope

| Area | Implemented | Partial or unavailable |
| --- | --- | --- |
| Media & Content | Draft/preview/publish/unpublish/archive; homepage About updates; announcements/promotions/resources; image/video assets and replacement; original-source blog carousel; subscriber controls/CSV; publication history | Newsletter delivery campaigns require separate campaign operations; no delivery is simulated |
| Sales & Marketplace | Existing product editing/photos/categories/NGN prices; separate publishing permission; availability; archive; price/listing history | No order checkout, quantity inventory, fulfillment, shipping or sales-performance source exists |
| Partner Programme | Assigned member search/profile/verification/payment status; suspension/restoration; tiers/fees/benefits; preserved purchased snapshots; referral attribution; Super-only promo changes | No paying-client commission ledger or commission settlement exists |
| Client & Agro-Real Estate | Assigned records; verification/token workflow; access lifecycle; property/investments/processes/custom date; private documents; communications; pending withdrawal review | Balances remain explicit manual records; historical payment/benefit versions cannot be reconstructed |
| Finance & Payments | Authoritative partner payment/refund views and CSV; separate refundable-fee line items; provider reconciliation; exact-operation reviews/approvals; independent approver policy; idempotent balance execution and refund retry | Withdrawal approval works, but payout execution/settlement is unavailable; no fabricated Successful status |
| Super Admin | Named staff invitations/activation; multiple departments; grants/denials/scopes; suspension/deactivation/revocation; password confirmation/rotation; audit search; approval policy and service readiness | Deployment host/database administrators retain disk-level control; audit is not externally immutable |

Six default roles and optional editor/publisher roles are defined centrally. Reserved role-management and promo-modification permissions cannot be delegated to department staff. Finance reviewers do not receive execution permission by default. Existing client and partner dashboards, public hero/layout and product browsing remain functional.

## Data and API changes

Existing JSON documents remain authoritative. Added administration/session, audit, finance-operation, managed-content/media, client-note and migration collections. A coordinated redo journal handles local multi-document mutations and recovery. Migration 2 backs up existing JSON, preserves accounts/relationships and snapshots legacy entitlements; first sign-in can run it idempotently. Old admin role cookies must sign in again. See [architecture](architecture.md) for the complete permission/API map and [operations](operations.md) for deployment and rollback.

Financial actions retain actor, exact amount/reference, initiator, reviewer/approver and outcome. No API manually marks a charge paid, a refund settled or a client withdrawal Successful. Automatic ₦100 refund requests remain immediate after verified payment; exceptional retries require review and independent approval under the default policy. Upgrade quotes retain the established published-price difference rule. Historical purchases retain fee/benefit snapshots.

## Verification

The baseline TypeScript/lint/content/partner domain checks passed. Regression assertions were updated for intentional behavior changes: named opaque sessions, denied department pages, retained product archives and protected manual balances/withdrawal statuses. Client regression fixtures explicitly preserve synthetic pre-migration balances/statuses rather than using the new API to fabricate settlement.

Release checks:

- Production build, TypeScript and lint: passed with no lint warnings/errors.
- Combined automated suites: **11 passed, 0 failed** after the final build.
- Browser checks: passed staff invitation/activation, permission-aware navigation, content draft/preview, product archive and all six workspaces at 390px width; no browser errors.
- Standalone migration CLI: passed first application and idempotent repeat against an isolated temporary directory.
- Storage tests: rollback, concurrent coordinated writes, redo recovery, corrupt-journal failure, audit hash chain/redaction, idempotent backup migration and permission derivation.
- HTTP security/workflow tests: anonymous/cross-department/direct-URL denial; assigned-client/document isolation; no self-escalation; Super-only promos; preserved purchased benefits; distinct ₦100 entries; refund review/approval/execution and duplicate retry; manual adjustment approval/idempotency; blocked fabricated withdrawal success; suspension/session revocation/password rotation; email/payment/webhook and marketplace regressions.

Commands executed use the local Node CLI equivalents of the npm scripts:

```sh
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/next/dist/bin/next lint
node node_modules/next/dist/bin/next build
node --test scripts/admin-storage.test.cjs scripts/content.test.cjs scripts/partner.test.cjs scripts/admin.integration.test.mjs scripts/client.integration.test.mjs scripts/partner.integration.test.mjs scripts/marketplace.integration.test.mjs
```

A GitHub Actions workflow now runs lint, type check, build and all automated suites on main/PR changes. Hosted CI status is not claimed by the local results. Browser QA used the already installed external Playwright test tools; no browser dependency or real service credential was added to the application.

## Deployment and remaining dependencies

Use one application process, a persistent restricted writable data directory, HTTPS and trusted proxy rate limits. Run the migration with the application stopped and retain complete data/upload backups. Confirm staff scopes and provision an independent authorized reviewer before manual financial operations. Configure Resend, Paystack, callback/webhook and the reconciliation scheduler before live registration/payments. These services were prepared and tested through isolated provider fixtures; no live credentials were available and no live charge/email/deployment is claimed.

Audit commit: `dd07ab6`. Implementation commit: `9fc1521`. The documentation/CI commit follows the implementation on `main`. Unrelated existing `NUL`, Python cache and TypeScript build-info files are excluded.

## Implementation files

Source and regression files in the implementation commit:

```text
package.json
scripts/admin-storage.test.cjs
scripts/admin-test-loader.cjs
scripts/admin.integration.test.mjs
scripts/client.integration.test.mjs
scripts/marketplace.integration.test.mjs
scripts/migrate-admin.cjs
scripts/partner.integration.test.mjs
src/app/admin-activate/page.tsx
src/app/admin/[section]/page.tsx
src/app/admin/clients/page.tsx
src/app/admin/layout.tsx
src/app/admin/news/page.tsx
src/app/admin/newsletter/page.tsx
src/app/admin/page.tsx
src/app/admin/partners/page.tsx
src/app/admin/products/page.tsx
src/app/api/admin/clients/[id]/route.ts
src/app/api/admin/clients/[id]/token/route.ts
src/app/api/admin/clients/route.ts
src/app/api/admin/governance/[resource]/route.ts
src/app/api/admin/news/[id]/route.ts
src/app/api/admin/news/route.ts
src/app/api/admin/newsletter/[id]/route.ts
src/app/api/admin/newsletter/route.ts
src/app/api/admin/partner-programme/[resource]/route.ts
src/app/api/admin/products/[slug]/route.ts
src/app/api/admin/products/route.ts
src/app/api/admin/session/route.ts
src/app/api/managed-media/[id]/route.ts
src/app/page.tsx
src/components/admin-activation.tsx
src/components/admin-client-manager.tsx
src/components/admin-client-records.tsx
src/components/admin-content-workspace.tsx
src/components/admin-finance.tsx
src/components/admin-governance.tsx
src/components/admin-news-manager.tsx
src/components/admin-partner-programme.tsx
src/components/admin-product-manager.tsx
src/components/admin-reauthenticate.tsx
src/components/admin-resource-history.tsx
src/components/admin-shell.tsx
src/components/admin-sign-in.tsx
src/components/admin-sign-out.tsx
src/components/admin-workspace-ui.tsx
src/components/managed-public-content.tsx
src/lib/admin-access.ts
src/lib/admin-assets.ts
src/lib/admin-audit.ts
src/lib/admin-auth.ts
src/lib/admin-client-records.ts
src/lib/admin-client-service.ts
src/lib/admin-data.ts
src/lib/admin-migrations.ts
src/lib/admin-notifications.ts
src/lib/admin-partner-service.ts
src/lib/admin-permissions.ts
src/lib/admin-product-api.ts
src/lib/admin-store.ts
src/lib/client-store.ts
src/lib/client-types.ts
src/lib/content-api.ts
src/lib/content-types.ts
src/lib/finance-store.ts
src/lib/managed-content.ts
src/lib/marketplace-data.ts
src/lib/marketplace-store.ts
src/lib/news-store.ts
src/lib/partner-api.ts
src/lib/partner-payments.ts
src/lib/partner-store.ts
src/lib/partner-types.ts
src/lib/site-storage.ts
```

Release documentation: `README.md`, `.env.example`, `docs/website-and-portals.md`, `docs/admin/{audit,architecture,financial-workflows,operations,release}.md`; CI: `.github/workflows/verify.yml`.
