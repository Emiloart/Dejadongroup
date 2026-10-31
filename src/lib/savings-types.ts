export const clientServices = ["agro_real_estate", "flexisave", "food_package_savings"] as const;
export type ClientService = typeof clientServices[number];
export type SavingsService = Exclude<ClientService, "agro_real_estate">;
export const serviceLabels: Record<ClientService, string> = { agro_real_estate: "Agro-Real Estate", flexisave: "FlexiSave", food_package_savings: "Food Package Savings" };
export const servicePaths: Record<ClientService, string> = { agro_real_estate: "agro-real-estate", flexisave: "flexisave", food_package_savings: "food-package-savings" };
export type RecordEvent = { id: string; at: string; actorId: string; action: string; reason: string };
export type ServiceAssignment = {
  id: string; clientId: string; service: ClientService; status: "enabled" | "suspended" | "inactive";
  createdAt: string; updatedAt: string; createdBy: string; updatedBy: string; history: RecordEvent[];
};
export type SavingsPlanConfig = {
  id: string; name: string; service: SavingsService; status: "draft" | "published" | "withdrawn"; version: number;
  contributionKobo: number; frequency: "daily" | "weekly" | "monthly"; interval: number; graceDays: number;
  targetKobo: number | null; terms: string; consentText: string; requirePhone: boolean;
  withdrawalsAllowed: boolean; withdrawalHoldDays: number; minimumBalanceKobo: number; withdrawalRequiresTarget: boolean;
  createdAt: string; updatedAt: string; updatedBy: string;
};
export type FoodSavingsOffer = {
  id: string; productSlug: string; contents: string; targetKobo: number; planIds: string[]; fulfillmentTerms: string;
  fulfillmentStages: { id: string; label: string; final: boolean }[];
  status: "draft" | "published" | "withdrawn"; version: number; createdAt: string; updatedAt: string; updatedBy: string;
};
export type PackageSnapshot = {
  offerId: string; offerVersion: number; productSlug: string; name: string; description: string; image: string | null; imageAlt: string;
  contents: string; targetKobo: number; fulfillmentTerms: string; fulfillmentStages: FoodSavingsOffer["fulfillmentStages"];
};
export type SavingsAccount = {
  id: string; clientId: string; assignmentId: string; service: SavingsService; representativeId: string | null;
  enrollmentStatus: "started" | "information_pending" | "submitted" | "reviewed" | "approved" | "rejected" | "cancelled";
  accountStatus: "not_active" | "active" | "suspended" | "completed";
  plan: SavingsPlanConfig; package: PackageSnapshot | null;
  consent: { at: string; clientId: string; text: string } | null;
  startDate: string | null; approvedAt: string | null; activatedAt: string | null;
  fulfillment: { stageId: string | null; complete: boolean; updates: RecordEvent[] };
  createdAt: string; updatedAt: string; history: RecordEvent[];
};
export type SavingsPayment = {
  id: string; reference: string; clientId: string; accountId: string; amountKobo: number; currency: "NGN"; providerMode: "test";
  payerEmail: string; transactionId: string | null; checkoutUrl: string | null;
  status: "pending" | "failed" | "cancelled" | "confirmed" | "reversed" | "exception";
  providerStatus: string; receivedKobo: number | null; exception: string; createdAt: string; updatedAt: string; paidAt: string | null;
  refunds?: { id: string; amountKobo: number; status: string }[];
};
/** Shared Finance records: one receipt/allocation per reference; compensating debits retain the receipt. */
export type FinanceLedgerEntry = {
  id: string; clientId: string; accountId: string; reference: string; kind: "contribution" | "reversal" | "refund";
  amountKobo: number; direction: "credit" | "debit"; reversesId: string | null; createdAt: string; providerMode: "test";
};
export const savingsMoney = (kobo: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
