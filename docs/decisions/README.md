# Architecture and business decisions

These records explain decisions that shape the running product. Current business-facing rules are also summarized in the [financial workflows](../admin/financial-workflows.md) and [website and portal guide](../website-and-portals.md). A record is marked **Accepted** when the behavior is implemented. New business terms require an owner-approved change and must be enforced by the server where they affect money, identity or access.

| ADR | Decision |
| --- | --- |
| [0001](0001-single-process-json-storage.md) | Keep the coordinated JSON repositories single-process until a transactional multi-instance store is approved and implemented. |
| [0002](0002-identity-and-paid-entitlements.md) | Reuse verified client identity; unlock partner membership and benefits only from server-confirmed entitlement. |
| [0003](0003-partner-resource-access.md) | Keep partner materials private and authorize them against current membership and an explicit tier allowlist. |
| [0004](0004-financial-state-and-commission-boundary.md) | Treat provider-verified records as money truth and leave unapproved commission/payout accounting unavailable. |
| [0005](0005-supported-framework-and-request-context.md) | Use a supported, patched Next.js release and await request-bound cookies and route values. |
