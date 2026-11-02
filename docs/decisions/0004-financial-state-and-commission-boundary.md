# ADR 0004: Keep money provider-verified and commissions unavailable until accounted for

**Status: Accepted**

## Context

The site describes partner referrals and displays partner finance sections. Partner registration payments, client withdrawals, savings contributions and referral commissions have different business meanings and different settlement evidence.

## Decision

Only a verified provider transaction (or the explicitly eligible zero-fee flow) can establish a paid partner entitlement. A 100% registration discount requires the separately acknowledged refundable ₦100 verification payment; once Paystack confirms it, the system requests its refund immediately and tracks the provider's settlement state. A manual client balance is an administrative record, not a bank balance. A withdrawal approval is not a transfer. The application does not calculate or accrue partner commissions from registration fees or referrals; no commission ledger or partner payout execution is implemented. Finance must not treat registration proceeds as a commission.

## Consequences

The UI identifies unavailable commission and payout records instead of inventing a balance. A future commission flow needs an owner-approved earning event, attribution and reversal rules, a ledger, payee verification and a separately reconciled payout workflow. Those are new business and financial controls, not a setting that turns on an existing feature.
