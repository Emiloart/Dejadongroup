# ADR 0002: Reuse identity and verify partner entitlements on the server

**Status: Accepted**

## Context

Clients are registered by staff verification and a one-time activation token. Partners register with email/password, verify email, complete personal details and then pay or complete an eligible zero-fee registration. A successful browser redirect alone cannot establish membership.

## Decision

Keep one client identity for all assigned client services. Service assignment grants route access but does not itself activate a savings agreement or confirm money. For partners, the backend owns registration, payment confirmation, current membership and tier changes. Payment callbacks are checked against saved checkout terms and the payment provider. Partner benefits come from the confirmed purchase snapshot; editing or hiding a tier does not rewrite benefits already purchased. A later upgrade uses the currently published price difference, and its new benefits become available only after backend confirmation. Registration promo codes do not apply to upgrades.

## Consequences

Session cookies and request fields cannot grant another service, mark a payment paid or select benefits. Historical purchases remain interpretable after administrators update current tier configuration. Pricing and tier ordering have to use current configuration for new quotes, while benefit access continues to use the customer's confirmed snapshot.
