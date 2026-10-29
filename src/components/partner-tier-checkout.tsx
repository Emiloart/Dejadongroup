"use client";

import { useState, type FormEvent } from "react";
import { partnerButtonClass, PartnerField, partnerInputClass, partnerRequest } from "@/components/partner-form-fields";
import { partnerMoney, type PartnerPayment, type PartnerQuote, type PartnerView } from "@/lib/partner-types";

export function PartnerTierCheckout({ view, onChanged }: { view: PartnerView; onChanged: () => void | Promise<void> }) {
  const tiers = view.tiers.filter((tier) => !view.currentTier || tier.rank > view.currentTier.rank);
  const [tierId, setTierId] = useState(tiers[0]?.id || ""); const [promoCode, setPromoCode] = useState("");
  const [quote, setQuote] = useState<PartnerQuote | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const pending = view.payments.some((item) => ["initializing", "pending"].includes(item.status) && Date.parse(item.expiresAt) > Date.now());
  async function review() {
    setBusy(true); setError(""); setQuote(null); setAccepted(false);
    try { setQuote((await partnerRequest<{ quote: PartnerQuote }>("quote", { tierId, promoCode })).quote); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!quote || busy) return;
    setBusy(true); setError("");
    try {
      const { payment } = await partnerRequest<{ payment: PartnerPayment }>("checkout", { tierId, promoCode, fingerprint: quote.fingerprint, refundableFeeAccepted: accepted });
      if (payment.checkoutUrl) window.location.assign(payment.checkoutUrl);
      else await onChanged();
    } catch (failure) { setQuote(null); setError(failure instanceof Error ? failure.message : "Please try again."); await onChanged(); }
    finally { setBusy(false); }
  }
  if (!tiers.length) return <p className="mt-5 rounded-card border border-dashed border-ink/20 p-5 text-sm leading-7 text-stone-600">{view.active ? "You are on the highest available tier. New upgrade options will appear here when published." : "Partner tiers are being prepared. You can return here after the team publishes the registration options."}</p>;
  if (pending) return <p className="mt-5 rounded-card bg-orange-50 p-5 text-sm leading-7 text-orange-900">You have a checkout in progress. Resume it or check its payment status below. Cancel it before choosing another tier or promo code.</p>;
  return <form onSubmit={checkout} className="mt-5"><fieldset disabled={busy} className="min-w-0"><legend className="sr-only">{view.active ? "Choose a higher partner tier" : "Choose your partner tier"}</legend>
    <div className="grid gap-4 md:grid-cols-2">{tiers.map((tier) => <label key={tier.id} className={`block min-w-0 cursor-pointer rounded-card border bg-white p-5 ${tierId === tier.id ? "border-orange-700 ring-1 ring-orange-700" : "border-ink/15"}`}><span className="flex items-center gap-3"><input type="radio" name="tier" required value={tier.id} checked={tierId === tier.id} onChange={() => { setTierId(tier.id); setQuote(null); setError(""); }} className="h-4 w-4 accent-orange-700" /><span className="break-words text-lg font-semibold">{tier.name}</span></span><span className="mt-3 block text-2xl">{partnerMoney(view.currentTier ? Math.max(0, tier.feeKobo - view.currentTier.feeKobo) : tier.feeKobo)}</span><span className="mt-1 block text-xs text-stone-600">{view.currentTier ? `Upgrade difference · full tier price ${partnerMoney(tier.feeKobo)}` : "Registration fee"}</span><span className="mt-3 block whitespace-pre-line break-words text-sm leading-7 text-stone-600">{tier.description}</span>{tier.benefits.length ? <span className="mt-4 block border-t border-ink/10 pt-3">{tier.benefits.map((benefit) => <span key={benefit.id} className="mt-2 block break-words text-sm"><span className="font-semibold">✓ {benefit.title}</span>{benefit.summary ? <span className="mt-1 block text-xs leading-6 text-stone-600">{benefit.summary}</span> : null}</span>)}</span> : null}</label>)}</div>
    {!view.active ? <div className="mt-5"><PartnerField label="Promo code (optional)"><input maxLength={40} value={promoCode} onChange={(event) => { setPromoCode(event.target.value.toUpperCase()); setQuote(null); setError(""); }} autoComplete="off" className={partnerInputClass} /></PartnerField></div> : <p className="mt-5 text-xs leading-6 text-stone-600">Upgrades use the difference between the currently published prices of your current and selected tiers. Your current benefits remain available until the upgrade payment is confirmed.</p>}
    <button type="button" disabled={!tierId || busy} onClick={review} className={`${partnerButtonClass} mt-5`}>{busy ? "Please wait…" : "Review total"}</button>
    {quote ? <div className="mt-5 rounded-card border border-ink/15 bg-warm p-5"><h3 className="text-xl">Your payment summary</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt>{quote.kind === "upgrade" ? "Upgrade difference" : "Registration fee"}</dt><dd>{partnerMoney(quote.baseKobo)}</dd></div>{quote.discountKobo ? <div className="flex justify-between gap-4"><dt>Promo discount</dt><dd>−{partnerMoney(quote.discountKobo)}</dd></div> : null}{quote.verificationFeeKobo ? <div className="flex justify-between gap-4"><dt>Refundable verification fee</dt><dd>{partnerMoney(quote.verificationFeeKobo)}</dd></div> : null}<div className="flex justify-between gap-4 border-t border-ink/10 pt-3 font-semibold"><dt>Total payable</dt><dd>{partnerMoney(quote.amountKobo)}</dd></div></dl>{quote.verificationFeeKobo ? <div className="mt-5 rounded-card border border-orange-200 bg-orange-50 p-4"><p className="text-sm font-semibold text-orange-950">Your promo covers 100% of the registration fee.</p><p className="mt-2 text-sm leading-7 text-orange-950">A refundable ₦100 payment verifies eligibility and completes registration. We request the full ₦100 refund immediately after Paystack confirms payment. Bank credit can take longer; track its status in your dashboard.</p><label className="mt-4 flex items-start gap-3 text-sm leading-6"><input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-orange-700" /><span>I understand the purpose and refundable nature of this ₦100 fee.</span></label></div> : null}<button type="submit" disabled={busy} className={`${partnerButtonClass} mt-5`}>{busy ? "Opening checkout…" : quote.amountKobo ? `Pay ${partnerMoney(quote.amountKobo)} with Paystack` : "Complete registration"}</button><p className="mt-3 text-xs leading-6 text-stone-600">Benefits unlock after the server confirms your registration and applicable payment. Checkout quotes are reserved for up to 30 minutes.</p></div> : null}
    {error ? <p role="alert" className="mt-4 text-sm leading-7 text-red-700">{error}</p> : null}
  </fieldset></form>;
}
