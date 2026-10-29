# Department administration

See [the preliminary audit](audit.md) for the actual pre-change implementation. The application retains Next.js route handlers, existing client/partner authentication and the JSON repositories. No second admin authentication provider, database or ORM was introduced.

## Identity, roles, permissions and scopes

`admin-store.ts` stores named administrative identities and hashed opaque sessions. `admin-permissions.ts` is the permission catalogue and default role mapping. Multiple roles combine permissions; explicit grants add permissions and explicit denials remove them. The server resolves the current account, active status, current assignments and session on every request. Role/permission/scope changes revoke sessions. Public client/partner registration cannot provision an administrator.

| Role | Default workspace / authority |
| --- | --- |
| `super_admin` | All six areas, role assignment, security policy, audit and promo modification |
| `media_admin` | Content, original-source news previews, publishing, media, newsletter management/export |
| `marketplace_admin` | Product listings, prices, photos, availability, publication, archive and history |
| `partner_programme_admin` | Assigned partner records, membership access, tiers/benefits and registration/upgrade status; no promo access by default |
| `agro_real_estate_admin` | Assigned clients, verification, activation tokens, property/investment records, milestones/dates, documents, communications and initial withdrawal review |
| `finance_admin` | Payment reads/reconciliation, refund review, withdrawal approval and financial reports; no execution or balance-adjustment permission by default |
| `content_editor` | Draft creation/editing and media uploads; cannot change published content |
| `content_publisher` | Read and explicit publication/unpublication; cannot edit or create content without a separate grant |

Only Super Admin can receive `admin.roles.manage` or `partners.promocodes.manage`. These restrictions are checked both when saving assignments and when deriving effective permissions. Financial execution grants require a Finance or Super Admin assignment. A Finance role alone does not imply execution authority. Manual balance adjustments require an explicit `finance.balances.manage` grant (or Super Admin).

Client and partner scopes are independent: `all`, a list of record IDs, or an empty list granting no records. Missing/invalid identity or permissions cannot grant access. Assigned client administrators cannot create arbitrary new clients; creation requires the create permission and all-client scope. Denied record access uses 404. List APIs filter records before returning sensitive information. Assigned partner payment reconciliation also checks the payment owner’s scope. Private client documents use the client’s scope on every download.

`admin-access.ts` centralizes page authorization, API permission guards, resource scope and mutation revalidation. Privileged writes verify the browser Origin. Ordinary storage mutations revalidate within the same serialized transaction as data and audit persistence. Payment verification/refund calls run outside the encompassing transaction so provider intents are durably saved before external requests. Provider jobs retain their own atomic claims and idempotency protections. Repository helpers are internal server modules; route handlers and administrative services form the authorization boundary.

## Workspaces and routes

| Area | Pages | Protected APIs |
| --- | --- | --- |
| Media & Content | `/admin/content`, `/admin/news`, `/admin/newsletter` | `/api/admin/governance/content`, `/upload`, `/media`; existing news/newsletter APIs |
| Sales & Marketplace | `/admin/products` | Existing `/api/admin/products[/:slug]` with permission/publishing checks |
| Partner Programme | `/admin/partners` | `/api/admin/partner-programme/{overview,tiers,members,promos,payments}` |
| Client & Agro-Real Estate | `/admin/clients`, `/admin/client-records` | Existing client/token APIs; `/api/admin/governance/client-records`, scoped uploads |
| Finance & Payments | `/admin/finance` | `/api/admin/governance/finance` reads, exports, approval actions and reconciliation |
| Super Admin | `/admin/users`, `/admin/audit`, `/admin/settings` | `/api/admin/governance/{users,audit,settings}` |

Unauthenticated APIs return 401; authenticated permission failures return 403; inaccessible records and department pages return 404; incompatible state/duplicate operations return 409. Forms show errors without exposing stack traces or provider credentials. Existing public/client/partner routes retain their authentication boundaries.

Read-only or publication-specific grants are independent from write grants. For example a content publisher uses the explicit publish action, while a content editor imports article drafts and cannot alter a published article. Existing full publishers continue to import article links directly into the four-slide carousel. Blog images always come from the source article; no manual blog-image control was added.

## Content and media

Managed content supports announcements, homepage updates, resources and promotions with unique URL keys, plaintext body, metadata summary, optional safe link, media reference and draft/published/archived states. Homepage key `about` replaces the existing About text only when published. Other published records appear in the managed homepage content section. Draft preview never publishes a record.

Media supports signature/MIME-checked JPG, PNG, WebP, MP4 and WebM, up to 20 MB. Replacement uploads create a new asset; choose it on the content and republish. Folder/title metadata organizes assets. Archiving a referenced published asset is blocked. Private client PDF/image documents are limited to 5 MB and cannot be selected as public content media. Document downloads use attachments, authentication/scope checks and no-store headers. Assets are private until referenced by published content. Upload files are immutable; orphan file cleanup is an offline maintenance task.

Products support draft, published and archived states. Existing DELETE becomes archive, preserving record/history. Public catalogue/detail routes still show only published listings. Quantitative stock, orders, fulfillment, commercial payments and performance analytics are unavailable because there is no source ledger. Availability labels remain supported.

## Persistence and accountability

Existing `products.json`, `news.json`, `newsletter.json`, `clients.json` and `partner-programme.json` remain authoritative. New collections: `administration.json`, `audit.json`, `finance.json`, `managed-content.json`, `assets.json`, `client-notes.json`, and `migrations.json`. Relationships reference stable record IDs and are validated by services; uniqueness and transitions are enforced under the storage mutex. No SQL foreign keys or RLS are claimed.

The single-process adapter serializes coordinated document writes. A redo journal is written before document replacement, file contents are synced, and startup/read recovery replays an incomplete transaction. Ordinary failed callbacks stage nothing. Corrupt journals fail closed and require operator recovery. This protects application-level coordinated writes; it does not provide multi-process locking, arbitrary hardware-failure guarantees or a distributed transaction with Paystack.

Audit events include stable ID, named actor ID, action, resource, UTC time, outcome, correlation ID, reason and redacted changes. No application route edits/deletes audit events. Events link previous/current SHA-256 hashes. This detects accidental/telltale changes when checked against trusted backups, but a disk administrator can recompute a chain; it is not externally immutable. Passwords, session/activation/invitation tokens, full bank accounts and unnecessary profile fields are redacted. Before/after payloads are bounded. Super Admin filters global history by actor/action/resource/date; departments receive only their relevant history. Histories begin at migration, with earlier partner events retained in their existing legacy list.

In-app operational notifications derive from real scoped records: incomplete registrations, payment exceptions, refunds needing attention, withdrawal reviews, financial approvals and denied privileged operations. No new notification provider or automatic email campaign was introduced.
