# Administrative audit — 29 October 2026

Baseline: `main`, `5a9e6dd`. This report precedes implementation.

## Working infrastructure

Next.js 14 / React 18 / TypeScript. Local JSON repositories, atomic per-file rename and process-local write queues; no SQL database, ORM, migrations, RLS, order engine or CI workflow. One app instance and persistent writable disk are required. Uploaded product images are signature-checked. Public article imports validate redirects, DNS and response size. Newsletter stores consent and supports CSV export.

Client accounts use verified, single-use expiring tokens, scrypt passwords, hashed revocable sessions and own-record dashboards. Partner accounts implement Resend OTP verification, required personal details, configurable tiers, restricted benefit endpoints, Paystack initialization/verification/webhooks, promo reservations and immediate refundable-₦100 refund requests. Reconciliation handles ambiguous refunds without blindly resubmitting. Current partner payment amounts are integer kobo. No real provider credentials are present.

## Gaps and risks

| Area | Current implementation | Required work |
| --- | --- | --- |
| Identity | Two environment credentials; signed eight-hour role cookies | Named staff, controlled provisioning, persisted revocable sessions, lifecycle, permissions and resource scopes |
| Authorization | Server admin guards exist, but ordinary admins share client/content/product access; all partner operations Super-only | Reusable permission boundary on pages, APIs and sensitive data operations |
| Media | News import and newsletter functional; other content tools placeholders | Publication workflow, assets, announcements/resources, content history |
| Marketplace | Listings, prices, images, publication and availability functional | Archive/history; explicitly unavailable orders, quantity inventory, shipping and sales analytics |
| Partners | Verified membership, tiers, promos and authoritative payments functional | Partner operational access, suspension/search, purchased benefit snapshots; retain Super-only promos |
| Clients | Property, investment, milestones, dates, manual balances and withdrawal records functional | Assigned-record scopes, access lifecycle, documents/communications; prevent arbitrary balance/status changes |
| Finance | Partner payment/refund records and reconciliation functional | Permission separation, exact-operation approvals, linked reporting, manual adjustment ledger and withdrawal review; no payout provider exists |
| Audit | Bounded partner event list without actor or before/after | Central append-only, redacted, searchable audit with transactional mutations |
| Interface | Shared shell; referrals/land/content/settings placeholders | Six permission-aware workspaces and governance tools |

Financial weakness: a client editor can currently set balances and mark withdrawals successful without an approval trail. Tier edits currently replace purchased benefit content. Sign-out clears admin cookies without revoking the underlying signed session. No administrative account suspension or named actor accountability exists.

## Preservation and migration plan

Retain JSON file shapes and public APIs where possible. Add an additive versioned migration, coordinated journaled writes, administrative identities/sessions, audit, finance workflow and managed-content collections. Existing unsigned identity assumptions will not be migrated: legacy admin cookies must sign in again. Preserve client/partner hashes, sessions, records and financial references. Snapshot existing paid entitlements at migration because earlier benefit versions were never recorded; identify that historical limitation explicitly.

Implement identity/permission boundaries first, then shared navigation and department tools, then finance/governance. Never infer paid outcomes from browser flags. Preserve the established published-price difference upgrade rule and immediate ₦100 refund-request trigger. Keep public design and client/partner dashboards intact.

Baseline validation: TypeScript, lint and five content/partner domain tests pass. Existing HTTP suites will also run against a production build before release.
