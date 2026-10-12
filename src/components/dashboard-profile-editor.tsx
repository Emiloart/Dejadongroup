"use client";

import Image from "next/image";
import { Camera, Check, Save } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getCurrentPreviewAccount, updatePreviewAccount, type PreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

const inputClass = "mt-2 w-full rounded-card border border-ink/15 bg-white px-3 py-3 text-sm text-ink outline-none transition-colors focus:border-orangeAction disabled:bg-stone-100 disabled:text-stone-500";

export function DashboardProfileEditor({ role }: { role: DashboardRole }) {
  const [profile, setProfile] = useState<PreviewAccount | null>(null);
  const [draft, setDraft] = useState<PreviewAccount | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const account = getCurrentPreviewAccount(role);
      setProfile(account);
      setDraft(account);
    } catch {
      setError("Account details are unavailable in this browser.");
    }
  }, [role]);

  function update(field: "fullName" | "username" | "email" | "phone", value: string) {
    setDraft((current) => current ? { ...current, [field]: field === "username" ? value.toLowerCase().replace(/[^a-z0-9_]/g, "") : value } : current);
    setMessage("");
    setError("");
  }

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Choose a photo smaller than 1 MB for this browser preview.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraft((current) => current ? { ...current, photoDataUrl: reader.result as string } : current);
        setError("");
        setMessage("");
      }
    };
    reader.onerror = () => setError("This photo could not be read. Try another file.");
    reader.readAsDataURL(file);
  }

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !profile) return;
    const next = {
      ...draft,
      fullName: draft.fullName.trim(),
      username: draft.username.trim().toLowerCase(),
      email: draft.email.trim(),
      phone: draft.phone.trim()
    };
    try {
      const result = updatePreviewAccount(profile.id, next);
      if (!result.ok) {
        setError(result.message);
        setMessage("");
        return;
      }
      setProfile(result.account);
      setDraft(result.account);
      setError("");
      setMessage("Profile saved in this browser.");
      window.dispatchEvent(new CustomEvent("dejadon:profile-updated", { detail: { role } }));
    } catch {
      setError("This profile could not be saved. Check browser storage and try again.");
    }
  }

  if (!draft || !profile) {
    return <p className="mt-10 border-y border-ink/10 py-8 text-sm text-stone-600">{error || "Loading your account profile…"}</p>;
  }

  const initials = draft.fullName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "DJ";
  const usernameLocked = Boolean(profile.username);

  return (
    <section aria-labelledby="profile-heading" className="mt-8 border-t border-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 py-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orangeAction/10 text-xl font-semibold text-orangeAction">
            {draft.photoDataUrl ? <Image src={draft.photoDataUrl} alt="Your profile photo" width={80} height={80} unoptimized className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-ink">{profile.fullName || "Your name"}</p>
            <p className="text-sm text-stone-600">{profile.username ? "@" + profile.username : "Choose a username"}</p>
            <label htmlFor="profile-photo" className="mt-1 inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm font-semibold text-orangeAction hover:text-orange-700">
              <Camera aria-hidden="true" className="h-4 w-4" /> {draft.photoDataUrl ? "Change photo" : "Add a photo"}
            </label>
            <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="sr-only" />
            {draft.photoDataUrl ? <button type="button" onClick={() => setDraft((current) => current ? { ...current, photoDataUrl: "" } : current)} className="ml-3 text-xs font-medium text-stone-600 underline hover:text-orangeAction">Remove</button> : null}
          </div>
        </div>
        <dl className="min-w-0 border-t border-ink/10 pt-4 sm:border-t-0 sm:border-l sm:py-2 sm:pl-5">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">User ID</dt>
          <dd className="mt-1 break-all font-mono text-sm text-ink">{profile.id}</dd>
          <dd className="mt-1 text-xs text-stone-500">Browser preview ID</dd>
        </dl>
      </div>
      <p className="mt-3 text-xs text-stone-500">Photo: JPG, PNG, or WebP · under 1 MB</p>

      <div className="mt-8 max-w-2xl">
        <h2 id="profile-heading" className="text-2xl font-medium text-ink">Edit personal details</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Changes are saved in this browser only.</p>
      </div>
      <form onSubmit={onSave} className="mt-6 max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">Full name
              <input required maxLength={80} autoComplete="name" value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} className={inputClass} placeholder="Your full name" />
            </label>
            <label className="block text-sm font-semibold text-ink">Username
              <input required minLength={3} maxLength={20} pattern="[a-z][a-z0-9_]{2,19}" autoCapitalize="none" autoComplete="username" spellCheck={false} disabled={usernameLocked} value={draft.username} onChange={(event) => update("username", event.target.value)} className={inputClass} placeholder="Choose a username" />
              <span className="mt-2 block text-xs font-normal leading-5 text-stone-600">{usernameLocked ? "Chosen username is locked for this preview account." : "3–20 characters. Once saved, you cannot change it in this browser."}</span>
            </label>
            <label className="block text-sm font-semibold text-ink">Email
              <input required type="email" autoComplete="email" value={draft.email} onChange={(event) => update("email", event.target.value)} className={inputClass} placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-semibold text-ink">Phone <span className="font-normal text-stone-500">(optional)</span>
              <input type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} placeholder="Your phone number" />
            </label>
          </div>
          {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-ink/10 pt-5">
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-card bg-orangeAction px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              <Save aria-hidden="true" className="h-4 w-4" /> Save profile
            </button>
            {message ? <p role="status" className="inline-flex items-center gap-2 text-sm text-agriculture"><Check aria-hidden="true" className="h-4 w-4" />{message}</p> : null}
          </div>
      </form>
    </section>
  );
}
