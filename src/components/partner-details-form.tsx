"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { partnerButtonClass, PartnerField, partnerInputClass, partnerRequest } from "@/components/partner-form-fields";
import type { PartnerAccount } from "@/lib/partner-types";

export function PartnerDetailsForm({ partner, profile = false, onSaved }: { partner: PartnerAccount; profile?: boolean; onSaved: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [photo, setPhoto] = useState(partner.photoDataUrl);
  function photoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1024 * 1024) { setError("Choose a JPG, PNG or WebP photo under 1 MB."); return; }
    const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === "string") { setPhoto(reader.result); setError(""); } }; reader.readAsDataURL(file);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const formElement = event.currentTarget; const form = new FormData(formElement);
    if (profile && form.get("newPassword") !== form.get("confirmPassword")) { setError("New passwords do not match."); return; }
    const body = Object.fromEntries(form.entries());
    setBusy(true); setError(""); setNotice("");
    try {
      await partnerRequest("profile", { ...body, ...(profile ? { photoDataUrl: photo } : {}) }, "PUT");
      for (const name of ["currentPassword", "newPassword", "confirmPassword"]) { const input = formElement.elements.namedItem(name); if (input instanceof HTMLInputElement) input.value = ""; }
      setNotice("Your details have been saved."); await onSaved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="mt-6"><fieldset disabled={busy} className="min-w-0 space-y-5"><legend className="sr-only">Partner personal details</legend>
    {profile ? <><div className="flex flex-wrap items-center gap-4"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-xl font-semibold">{photo ? <Image src={photo} width={80} height={80} unoptimized alt="Your profile photo" className="h-full w-full object-cover" /> : partner.fullName.slice(0, 1)}</div><PartnerField label="Profile photo" hint="JPG, PNG or WebP, up to 1 MB"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={photoChange} className="mt-2 block max-w-full text-xs" /></PartnerField>{photo ? <button type="button" onClick={() => setPhoto("")} className="min-h-11 text-xs font-semibold text-red-700">Remove photo</button> : null}</div><div className="grid gap-5 sm:grid-cols-2"><PartnerField label="Full name"><input name="fullName" required maxLength={120} defaultValue={partner.fullName} autoComplete="name" className={partnerInputClass} /></PartnerField><PartnerField label="Username" hint="Previous usernames remain reserved for your referral links."><input name="username" required minLength={3} maxLength={20} pattern="[a-z][a-z0-9_]{2,19}" defaultValue={partner.username} autoCapitalize="none" spellCheck={false} className={partnerInputClass} /></PartnerField></div><PartnerField label="Verified email address" hint="Contact our team if your verified email needs to change."><input readOnly type="email" value={partner.email} className={`${partnerInputClass} bg-stone-50`} /></PartnerField></> : null}
    <div className="grid gap-5 sm:grid-cols-2">
      <PartnerField label="Phone number"><input name="phone" type="tel" required maxLength={40} defaultValue={partner.phone} autoComplete="tel" className={partnerInputClass} /></PartnerField>
      <PartnerField label="Account number" hint="Keep any leading zeros."><input name="accountNumber" required minLength={6} maxLength={34} defaultValue={partner.accountNumber} autoComplete="off" className={partnerInputClass} /></PartnerField>
      <PartnerField label="Location"><input name="location" required maxLength={300} defaultValue={partner.location} autoComplete="street-address" className={partnerInputClass} /></PartnerField>
      <PartnerField label="Date of birth"><input name="dob" type="date" required max={new Date().toISOString().slice(0, 10)} defaultValue={partner.dob} autoComplete="bday" className={partnerInputClass} /></PartnerField>
      <PartnerField label="Occupation"><input name="occupation" required maxLength={120} defaultValue={partner.occupation} autoComplete="organization-title" className={partnerInputClass} /></PartnerField>
      <PartnerField label="Origin / Nationality"><input name="nationality" required maxLength={120} defaultValue={partner.nationality} className={partnerInputClass} /></PartnerField>
    </div>
    {profile ? <section className="border-t border-ink/10 pt-5"><h3 className="text-xl">Change password</h3><p className="mt-2 text-xs leading-6 text-stone-600">Leave the new password blank to keep your current password.</p><div className="mt-4 space-y-5"><PartnerField label="Current password"><input name="currentPassword" type="password" maxLength={128} autoComplete="current-password" className={partnerInputClass} /></PartnerField><div className="grid gap-5 sm:grid-cols-2"><PartnerField label="New password"><input name="newPassword" type="password" minLength={10} maxLength={128} autoComplete="new-password" className={partnerInputClass} /></PartnerField><PartnerField label="Confirm new password"><input name="confirmPassword" type="password" minLength={10} maxLength={128} autoComplete="new-password" className={partnerInputClass} /></PartnerField></div></div></section> : null}
    {error ? <p role="alert" className="text-sm leading-6 text-red-700">{error}</p> : null}{notice ? <p role="status" className="text-sm text-agriculture">{notice}</p> : null}
    <button type="submit" className={partnerButtonClass}>{busy ? "Saving…" : profile ? "Save profile" : "Save details & choose tier"}</button>
  </fieldset></form>;
}
