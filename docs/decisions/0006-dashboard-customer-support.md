# ADR 0006: Dashboard customer support uses account-bound tickets

**Status: Accepted**

## Context

Client and active Partner Programme accounts need a private way to raise issues and follow the company's response. De Jadon Group already has separate verified client, partner and staff sessions, a permission and scope model, and a single-process JSON store with coordinated writes. Adding another authentication provider would split account ownership and duplicate authorization.

## Decision

Support is available within authenticated client and active partner dashboards. A ticket is bound server-side to the account ID and role resolved from that dashboard's existing HTTP-only session. The role is part of the ownership key so a client session cannot read a partner ticket, even if IDs overlap. Public website visitors continue to use the existing contact channels.

Tickets use a continuing text conversation with these states: `open`, `in_progress`, `awaiting_customer`, and `resolved`. A customer reply reopens a resolved request. New tickets start unassigned and open; a support agent must claim a ticket before responding or resolving it. A Super Admin can take over an assigned ticket. Each ticket allows up to 100 messages and 200,000 characters of message text; each account can create up to 100 tickets. A message is limited to 4,000 characters.

The administrative workspace is `/admin/support`. The `customer_support_admin` role grants queue access, response, assignment, resolution and internal-note permissions. A read permission is separate from write permissions. Every ticket is further restricted by the administrator's existing client or partner scope. Customer identity shown to authorized support staff is limited to name and email. Internal notes are withheld from customer APIs. Audit records capture staff actions and counts but never copy message or note text.

Support records use the existing `support-tickets.json` collection and coordinated storage transaction. The current one-process and persistent-disk requirements still apply. No second database, Supabase project, real-time chat provider, email notification service, or file attachment flow is added. The support queue and admin overview provide the staff-facing inbox; customers read replies in their dashboard.

## Consequences and operational limits

- Tickets and their contents are personal data. Restrict the persistent data directory and backups, and set a retention and deletion policy before production support launches.
- Dashboard support requires a working account session. Existing phone, WhatsApp and email contact channels remain the fallback for account-access problems.
- Uploads are deferred. Customers and staff should not send passwords, PINs, one-time codes or full bank details in messages.
- There is no published response-time commitment or SLA. The admin queue exposes open, assigned, awaiting-customer and resolved counts without implying a service guarantee.
- A transactional database and external object storage are required before horizontal scaling, attachment support or high-volume support operations.

## Rollback

Hide the dashboard and admin navigation entries and disable the support API routes. Preserve the support collection with the existing data backup until its approved retention period expires. Do not delete tickets as a side effect of changing account status or service access.
