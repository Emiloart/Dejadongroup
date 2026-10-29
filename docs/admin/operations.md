# Deployment and operational runbook

## Before rollout

1. Use a persistent restricted directory for `DEJADON_DATA_DIR`, production HTTPS and exactly **one Node application process**. Do not use a PM2 cluster, multiple containers, serverless replicas or a second maintenance writer on this adapter. A multi-process transactional database/object-store adapter is a separate infrastructure project.
2. Stop the old application and back up the entire data directory, including uploads. Restrict access: clients, staff, partner profiles and private documents contain personal information. File permissions are not a substitute for Windows ACLs, encrypted backups and host access controls.
3. The standalone migration command uses the repository’s TypeScript build dependency; run it before pruning development dependencies, or use the built application’s idempotent first-sign-in migration. Export `DEJADON_DATA_DIR` in the command environment and run `npm run migrate:admin`. The standalone command does not load Next’s `.env.local`. Migration 2 creates a restricted timestamped `migration-backups/admin-v2-*` copy of the current JSON documents, freezes legacy paid tier snapshots and records the migration and audit event. It is additive and idempotent. No accounts, prices, settlements or production fixtures are invented. Missing upload files are not reconstructed; back up the entire directory separately.
4. Run the production build and verification commands, then start the new app. Old stateless admin cookies intentionally require sign-in again. Existing client and partner accounts/sessions continue to use their existing hashes and IDs. First admin sign-in also runs the idempotent migration if it has not been applied.
5. Sign in, confirm each department’s assigned scopes and review the [financial policy](financial-workflows.md). Existing ordinary environment staff are deliberately limited to Media and Marketplace rather than retaining broad client access.

## One-time owner bootstrap

Set `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` (12–128 characters) in the server environment before first sign-in. Alternatively an existing single-owner installation with no `SUPER_ADMIN_*` values can bootstrap from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Partial Super Admin configuration never elevates ordinary staff.

The first valid bootstrap creates hashed named accounts once, persists the `bootstrapped` flag and audit event, and uses those records thereafter. If explicit Super Admin credentials and distinct valid `ADMIN_*` credentials exist at that time, the ordinary account is created with Media and Marketplace roles only. There is no public bootstrap endpoint independent of valid credentials. Environment values cannot reactivate a suspended owner or reset a password after bootstrap.

After confirming persisted access and backups, remove bootstrap passwords from the running environment, restart, and sign in using the persisted account. Change the owner password through the password-confirmation control. Provision at least one additional trusted Super Admin if independent approval or recovery coverage is needed. The application prevents removing the final active Super Admin and prevents changing your own role assignment; a second owner performs changes to your access.

Use `/admin/users` to invite staff, set roles, additional grants/denials and separate client/partner scopes. Copy the single-use invitation token immediately and provide it securely to the intended person. The person opens `/admin-activate`, supplies the invited email, token and a new password. Invitations expire after 24 hours; replacement invalidates the previous token. No automatic invitation email is claimed. New or public partner/client accounts have no administrative authority.

Suspend/deactivate accounts or revoke their sessions in `/admin/users` with a reason and confirmation. Assignment changes revoke sessions immediately. An administrator’s password change revokes all other sessions and replaces the current cookie. Owner recovery after losing every active owner credential requires a deployment operator restoring a trusted administrative backup while the application is stopped; editing live identity files or rerunning bootstrap is not an account-recovery mechanism.

## Sessions and reverse proxy

Admin passwords use salted scrypt; invitation and 256-bit opaque session tokens are stored as SHA-256 hashes. Sessions expire after eight hours. Cookies are HttpOnly, SameSite=Lax, Secure in production, and sign-out revokes the server session. Role/scope/status changes are resolved per request. Role changes in a cookie have no authority.

Staff provisioning, policy changes, promo modifications and financial execution require a password confirmation within ten minutes. The header control confirms the current password and optionally changes it. Authentication, activation and reauthentication have application attempt limits. Configure trusted reverse-proxy limits too; strip untrusted forwarded headers and supply the real client IP/HTTPS protocol. Do not expose a second backend listener that bypasses the proxy. Origin/Host/protocol checks protect cookie-authenticated writes. SameSite cookies and origin checks supplement server authorization, not replace it.

## Provider configuration

Copy only placeholder names from `.env.example`; never commit real values.

| Variable | Purpose |
| --- | --- |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | One-time owner bootstrap |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Legacy single-owner bootstrap or initial limited publishing staff |
| `DEJADON_DATA_DIR` | Absolute persistent restricted directory |
| `RESEND_API_KEY`, `RESEND_FROM` | Partner OTP email and verified sender |
| `PAYSTACK_SECRET_KEY` | Server-only NGN registration/upgrade/refund integration |
| `APP_BASE_URL` | Public HTTPS origin for payment callback |
| `PARTNER_RECONCILE_SECRET` | Random 32+ character scheduler credential |

Configure Paystack webhook `https://YOUR-DOMAIN/api/paystack/webhook`. Callbacks use `/partner-programme/payment`. Configure a scheduler to POST `/api/internal/partner-payments/reconcile` every minute with `Authorization: Bearer YOUR_PARTNER_RECONCILE_SECRET`. The handler validates the webhook’s raw-body HMAC and independently verifies charges/refund outcomes. Keep test and live data directories separate. Missing credentials fail closed; no app route bypasses payment/email verification for testing.

There is no configured client-transfer provider, shipping integration, marketplace checkout, quantitative stock system, newsletter delivery campaign or commission ledger. Do not advertise those operations as live.

## Journal recovery and backups

Back up the entire directory together while the app is stopped, or use a coordinated filesystem snapshot. Include JSON documents, `uploads`, `managed-assets`, migration backups and any `.transaction.json` journal. No maintenance process may modify the directory while the app is running.

The storage queue recovers a complete redo journal before reading or accepting another mutation. It writes/fsyncs staged file contents and uses rename replacement. A valid leftover journal should be replayed by the application, not deleted to hide an error. An invalid journal fails closed: stop the application, preserve a forensic copy, and restore a consistent trusted directory backup. Power-loss semantics also depend on the operating system and disk; no arbitrary hardware-failure or distributed atomicity guarantee is claimed.

Audit hash chains help compare against trusted offline backups. Disk administrators can modify/recompute them, so retain backups outside the application’s writable identity. Monitor storage errors, denied privileged activity and refund/payment exceptions. Logs must never contain environment secrets, tokens, full bank details or live personal fixtures.

## Rollback

Stop the application and provider reconciliation scheduler. Preserve the post-upgrade directory before recovery. Restore the **entire** pre-upgrade backup and the previous application revision together; do not restore only a single financial/identity file or reuse new admin cookies. Post-upgrade payments and provider refunds cannot be undone by a database restore. Reconcile Paystack activity since the backup before reopening payment registration. Prefer a forward fix where live financial activity occurred.

Migration backups provide pre-migration JSON documents for inspection, not a substitute for the complete upload/data backup. Schema changes are additive; SQL constraints/migrations and RLS do not exist in this repository.
