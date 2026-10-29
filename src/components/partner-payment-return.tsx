"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { partnerButtonClass, partnerRequest } from "@/components/partner-form-fields";
import { partnerMoney, type PartnerPayment } from "@/lib/partner-types";

export function PartnerPaymentReturn({ reference }: { reference: string }) {
  const [payment, setPayment] = useState<PartnerPayment | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true; setBusy(true);
    partnerRequest<{ payment: PartnerPayment }>("confirm", { reference }).then((result) => { if (active) setPayment(result.payment); }).catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : "Please sign in and check your payment status."); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [reference]);
  return <div className="mx-auto max-w-2xl py-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Partner Programme</p><h1 className="mt-4 text-4xl">Payment confirmation</h1><p className="mt-4 text-sm leading-7 text-stone-600">We confirm your payment directly with Paystack before changing your membership.</p>{busy ? <p role="status" className="mt-6 text-sm">Checking your payment…</p> : null}{error ? <p role="alert" className="mt-6 text-sm leading-7 text-red-700">{error}</p> : null}{payment ? <div className="mt-6 rounded-card border border-ink/10 bg-white p-6"><h2 className="text-2xl capitalize">{payment.status === "paid" ? "Payment confirmed" : payment.status === "rejected" ? "Payment needs attention" : "Awaiting confirmation"}</h2><p className="mt-3 text-sm leading-7">{payment.tierName} · {partnerMoney(payment.amountKobo)}</p>{payment.failureReason ? <p className="mt-3 text-sm leading-7 text-red-700">{payment.failureReason}</p> : null}{payment.refundKobo ? <p className="mt-3 text-sm leading-7">Your {partnerMoney(payment.refundKobo)} refund is <strong>{payment.refundStatus.replace(/-/g, " ")}</strong>. Bank credit may take longer than the refund request.</p> : null}</div> : null}<Link href={payment?.status === "paid" ? "/dashboard/partner" : "/login?role=partner"} className={`${partnerButtonClass} mt-6`}>{payment?.status === "paid" ? "Open partner dashboard" : "Sign in / continue registration"}</Link></div>;
}
