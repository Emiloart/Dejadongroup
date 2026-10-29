# Financial controls and purchased entitlements

## Authority and amounts

`partner-programme.json` remains the source of payment/refund truth. Paystack verification checks reference, integer NGN amount, provider environment, payer email, saved checkout terms and account eligibility. A callback query, browser flag, product administrator or client administrator cannot mark a payment paid. The finance view/exports are derived from those records; no parallel editable paid-state ledger exists.

Financial calculations use integer kobo, including percentage discounts calculated with integer basis-point arithmetic. Existing manually entered client/product NGN decimal display fields are retained for compatibility; adjustment calculations convert validated decimal text to integer kobo before comparison. The application does not automatically accrue investment returns or derive referral commissions from registration payments.

Confirmed payments expose stable financial line-item IDs for registration/upgrade proceeds and, separately, refundable verification fees. Linked refunds have their own stable line-item ID and provider-controlled status. These are distinct ledger allocations under one Paystack charge, not fabricated additional provider charges. Mismatched/rejected receipts remain unallocated rather than being attributed to purchased benefits. CSV reports retain registration and refundable-fee amounts separately.

## Partner rules

Registration requires verified email, all required personal details and confirmed payment/free checkout. Promos apply only to initial registration and validate tier, status, dates, discount, email eligibility and usage/reservations. Only Super Admin changes promo configuration; Partner Programme admins cannot obtain that write permission through additional grants.

A full registration-fee discount requires explicit acknowledgment of the refundable ₦100 fee. Confirmation persists the refund job and immediately requests its refund, as already established by the owner. Bank settlement timing remains Paystack/bank-controlled. Refund settlement does not remove membership from an otherwise valid verification-fee registration.

Upgrades cost the nonnegative difference between the **currently published** current-tier and selected higher-tier prices, as established by the owner. Historical purchase prices never change. Higher tier rank and an available target tier are required; benefits change only after eligible backend confirmation. Free registrations/zero-difference upgrades still require verification and personal details.

Each checkout freezes the target tier’s fee, description and full benefit content. Existing purchased benefits remain frozen when a tier is edited or hidden. A deliberate subsequent upgrade purchases the new target snapshot. Legacy paid purchases without snapshots are frozen at migration using the tier configuration available at cutover. Earlier overwritten benefit versions cannot be reconstructed; the snapshot records its legacy origin. Private snapshots are stripped from public/unpaid checkout and payment-history responses. Active members receive only their entitled current snapshot.

## Review, approval and execution

Financial permissions are separate: transaction read/reconcile, refund review/execute, withdrawal review/approve/execute, manual balance maintenance and reports. Finance reviewers have no execution permission by default. Super Admin grants sensitive execution only to Finance personnel.

The default configurable policy requires a different authorized administrator to approve every manual balance adjustment, withdrawal review and exceptional refund retry. No monetary thresholds are invented. Super Admin can change this policy only with recent password confirmation, an explicit confirmation and a recorded reason. Automatic ₦100 refunds follow the established system rule rather than waiting for an administrator.

Operations have immutable kind, recipient/client, amount and reference snapshots. Review states are `review → approved/rejected`; approved manual adjustments become `executed` after atomic persistence. Duplicate execution returns the existing result. A stale balance or changed refund terms cannot execute against the prior approval. Rejected requests are retained. A changed reviewed withdrawal must be a new request. Initiation, review, approval, claim and outcome events identify their actors and supporting reasons.

Manual balances are administrative records. Use Finance → Request a financial operation → Manual balance adjustment, enter the absolute new balance, supporting reference and reason, then obtain approval and execute. The old and new kobo values are retained. A successful save never means that a bank transfer occurred. Ordinary client editors cannot change balances through the legacy client form or direct API.

Withdrawal requests retain the established public `pending`, `processing`, `successful` statuses. New administrative requests start Pending. Client admins submit the exact request to Finance; Finance independently approves/rejects its internal review. **Approval does not mark it Processing or Successful.** No transfer provider, beneficiary verification or settlement integration exists, so payout execution returns 409 and remains unavailable. Historical statuses are preserved and identified as legacy administrative records, not newly provider-verified settlements. A future payout integration must bind approvals to verified recipients, persist idempotent transfer intents and reconcile authoritative settlement before changing public status.

## Refund safety

Refund amounts originate from the saved eligible payment (verification fee or rejected-payment receipt); administrators cannot enter arbitrary refund amounts. Retry eligibility checks the original received amount. The provider preflight also checks existing nonfailed refunds before another submission. Only failed/uncertain/attention cases enter exceptional review. Financial reviewers can approve but need a separate execution grant to submit.

Approved refund execution first persists an execution claim, then calls the existing provider reconciliation/retry workflow outside the enclosing transaction, then records the outcome. The provider refund job also retains its own lease/ID/state. A network interruption or lost response remains uncertain and is reconciled against Paystack before another submission. A duplicate request cannot create an additional local approval or blindly duplicate a refund. An abandoned execution claim can be retried after two minutes; provider reconciliation still precedes submission.

A refund operation’s `executed` means the approved retry was checked/submitted, **not settled**. `pending`, `processing`, `processed`, `failed`, `needs-attention` and `uncertain` remain provider-facing states. Failed/uncertain results do not claim successful execution. Paystack bank-detail intervention must happen in Paystack and be reconciled here. There is no invented manual “mark refunded” control.

Configure Paystack webhooks and the reconciliation scheduler in [operations](operations.md). Use separate persistent directories for test and live keys. Never infer live entitlements from test-mode confirmations.
