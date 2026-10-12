"use client";

import Image from "next/image";
import { Check, Copy, Download, Link2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { getCurrentPreviewAccount, type PreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

export function DashboardReferralTools({ role }: { role: DashboardRole }) {
  const [profile, setProfile] = useState<PreviewAccount | null>(null);
  const [origin, setOrigin] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    function refreshProfile() {
      try {
        setProfile(getCurrentPreviewAccount(role));
      } catch {
        setProfile(null);
      }
    }
    refreshProfile();
    window.addEventListener("dejadon:profile-updated", refreshProfile);
    window.addEventListener("storage", refreshProfile);
    return () => {
      window.removeEventListener("dejadon:profile-updated", refreshProfile);
      window.removeEventListener("storage", refreshProfile);
    };
  }, [role]);

  const username = profile?.username || "";
  const destination = role === "partner" ? "/partner-program" : "/businesses";
  const referralUrl = origin && username ? origin + destination + "?ref=" + encodeURIComponent(username) : "";

  useEffect(() => {
    let cancelled = false;
    if (!referralUrl) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(referralUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#241F19", light: "#FFFFFF" }
    }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (!cancelled) {
        setHasError(true);
        setMessage("The QR code could not be generated. Your link is still available.");
      }
    });
    return () => { cancelled = true; };
  }, [referralUrl]);

  async function copyLink() {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setHasError(false);
      setMessage("Referral link copied.");
    } catch {
      setHasError(true);
      setMessage("Copy is unavailable. Select the link text and copy it manually.");
    }
  }

  return (
    <section id="referral-link" aria-labelledby="referral-heading" className="mt-14 scroll-mt-28 border-t border-ink/10 pt-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orangeAction">Share your link</p>
        <h2 id="referral-heading" className="mt-3 text-2xl font-medium text-ink">Referral tools</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {role === "partner" ? "Share the Partner Program with a prospective client." : "Share De Jadon Group’s businesses with someone interested."}
        </p>
      </div>

      {referralUrl ? (
        <div className="mt-8 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_208px] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <label htmlFor="referral-url" className="text-sm font-semibold text-ink">Your referral link</label>
            <div className="mt-2 flex min-w-0 items-center gap-2 rounded-card border border-ink/15 bg-white px-3">
              <Link2 aria-hidden="true" className="h-4 w-4 shrink-0 text-orangeAction" />
              <input id="referral-url" readOnly value={referralUrl} onFocus={(event) => event.target.select()} className="min-w-0 flex-1 py-3 text-sm text-ink outline-none" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-2 rounded-card bg-orangeAction px-4 text-sm font-semibold text-white hover:bg-orange-700">
                <Copy aria-hidden="true" className="h-4 w-4" /> Copy link
              </button>
              {qrDataUrl ? (
                <a href={qrDataUrl} download={"dejadon-" + username + "-referral-qr.png"} className="inline-flex min-h-11 items-center gap-2 rounded-card border border-orangeAction px-4 text-sm font-semibold text-orangeAction hover:bg-orange-50">
                  <Download aria-hidden="true" className="h-4 w-4" /> Download QR code
                </a>
              ) : null}
            </div>
            {message ? <p role="status" className={`mt-3 inline-flex items-center gap-2 text-sm ${hasError ? "text-red-700" : "text-agriculture"}`}>{hasError ? null : <Check aria-hidden="true" className="h-4 w-4" />}{message}</p> : null}
            <p className="mt-6 max-w-xl border-t border-ink/10 pt-4 text-xs leading-5 text-stone-500">This preview link opens the website with your username in the URL. Referral attribution, sign-ups, and commissions are not recorded yet.</p>
          </div>
          <div className="flex items-start justify-center lg:justify-end">
            {qrDataUrl ? (
              <figure className="text-center">
                <div className="border border-ink/10 bg-white p-3">
                  <Image src={qrDataUrl} alt={"QR code for @" + username + " referral link"} width={176} height={176} unoptimized className="h-44 w-44" />
                </div>
                <figcaption className="mt-2 text-xs text-stone-500">Scan to open your link</figcaption>
              </figure>
            ) : <p className="text-sm text-stone-500">Generating QR code…</p>}
          </div>
        </div>
      ) : (
        <div className="mt-8 border-y border-ink/10 py-6">
          <p className="text-sm leading-6 text-stone-600">Save your name and choose a username above to generate your personal link and QR code.</p>
          <a href="#profile-heading" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-orangeAction hover:text-orange-700">Go to profile details</a>
        </div>
      )}
    </section>
  );
}
