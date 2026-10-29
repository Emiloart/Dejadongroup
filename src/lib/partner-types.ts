export type PartnerBenefit = { id: string; title: string; summary: string; content: string };
export type PartnerTier = {
  id: string; name: string; description: string; rank: number; feeKobo: number; active: boolean;
  benefits: PartnerBenefit[]; createdAt: string; updatedAt: string;
};
export type TierPreview = Omit<PartnerTier, "benefits"> & { benefits: Omit<PartnerBenefit, "content">[] };
export type PartnerPromo = {
  id: string; code: string; type: "percent" | "fixed"; value: number; tierIds: string[]; active: boolean;
  startsAt: string; endsAt: string; maxUses: number; perPartnerLimit: number; eligibleEmails: string[];
  createdAt: string; updatedAt: string;
};
export type PartnerProfile = { phone: string; accountNumber: string; location: string; dob: string; occupation: string; nationality: string };
export type PartnerAccount = PartnerProfile & {
  id: string; fullName: string; email: string; username: string; photoDataUrl: string;
  emailVerifiedAt: string | null; profileCompletedAt: string | null; registeredAt: string | null;
  currentTierId: string | null; createdAt: string;
};
export type PartnerQuote = {
  tierId: string; tierName: string; fromTierId: string | null; kind: "registration" | "upgrade";
  baseKobo: number; discountKobo: number; verificationFeeKobo: number; amountKobo: number;
  promoCode: string; fingerprint: string;
};
export type RefundStatus = "none" | "queued" | "submitting" | "pending" | "processing" | "processed" | "failed" | "needs-attention" | "uncertain";
export type PartnerPayment = PartnerQuote & {
  reference: string; partnerId: string; promoId: string | null;
  providerMode: "live" | "test" | "free";
  status: "initializing" | "pending" | "paid" | "failed" | "cancelled" | "rejected";
  checkoutUrl: string | null; expiresAt: string; createdAt: string; paidAt: string | null; lastCheckedAt: string | null;
  receivedKobo: number | null; transactionId: string | null; entitledAt: string | null; failureReason: string;
  refundKobo: number; refundStatus: RefundStatus; refundId: string | null;
  refundAttemptedAt: string | null; refundError: string;
};
export type PartnerView = {
  partner: PartnerAccount; currentTier: PartnerTier | null; tiers: TierPreview[]; payments: PartnerPayment[];
  active: boolean; network: { introduced: number; verified: number; registered: number };
};
export function partnerMoney(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}
