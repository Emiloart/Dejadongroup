"use client";

import Image from "next/image";
import { Camera, Check, Pencil, Save } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getCurrentPreviewAccount, updatePreviewAccount, type PreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

const inputClass = "mt-2 w-full rounded-card border border-ink/15 bg-white px-3 py-3 text-base text-ink outline-none transition-colors focus:border-orange-700 focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:bg-stone-100 disabled:text-stone-500 sm:text-sm";

export function DashboardProfileEditor({ role }: { role: DashboardRole }) {
  const [profile, setProfile] = useState<PreviewAccount | null>(null);
  const [draft, setDraft] = useState<PreviewAccount | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

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
      setEditing(false);
      window.dispatchEvent(new CustomEvent("dejadon:profile-updated", { detail: { role } }));
    } catch {
      setError("This profile could not be saved. Check browser storage and try again.");
    }
  }

  if (!draft || !profile) {
    return <p className="mt-10 border-y border-ink/10 py-8 text-sm text-stone-600">{error || "Loading your account profile…"}</p>;
  }

  const visiblePhoto = editing ? draft.photoDataUrl : profile.photoDataUrl;
  const initials = (editing ? draft.fullName : profile.fullName).trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "DJ";

  return (
    <section aria-labelledby="profile-heading" className="mt-8 border-t border-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 py-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orangeAction/10 text-xl font-semibold text-orange-800">
            {visiblePhoto ? <Image src={visiblePhoto} alt="Your profile photo" width={80} height={80} unoptimized className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-ink">{profile.fullName || "Your name"}</p>
            <p className="text-sm text-stone-600">{profile.username ? "@" + profile.username : "Choose a username"}</p>
            {editing ? (
              <>
                <label htmlFor="profile-photo" className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-card text-sm font-semibold text-orange-700 hover:text-orange-800 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-orange-700">
                  <Camera aria-hidden="true" className="h-4 w-4" /> {draft.photoDataUrl ? "Change photo" : "Add a photo"}
                  <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="sr-only" />
                </label>
                {draft.photoDataUrl ? <button type="button" onClick={() => setDraft((current) => current ? { ...current, photoDataUrl: "" } : current)} className="ml-3 min-h-11 rounded-card text-xs font-medium text-stone-600 underline hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">Remove</button> : null}
              </>
            ) : null}
          </div>
        </div>
        <dl className="min-w-0 border-t border-ink/10 pt-4 sm:border-t-0 sm:border-l sm:py-2 sm:pl-5">
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">User ID</dt>
          <dd className="mt-1 break-all font-mono text-sm text-ink">{profile.id}</dd>
          <dd className="mt-1 text-xs text-stone-600">Browser preview ID</dd>
        </dl>
      </div>
      {editing ? <p className="mt-3 text-xs text-stone-600">Photo: JPG, PNG, or WebP · under 1 MB</p> : null}

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="profile-heading" className="text-2xl font-medium text-ink">Profile details</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Changes are saved in this browser only.</p>
        </div>
        {!editing ? (
          <button type="button" onClick={() => { setEditing(true); setMessage(""); }} className="inline-flex min-h-11 items-center gap-2 border-b border-orangeAction text-sm font-semibold text-orange-700 hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
            <Pencil aria-hidden="true" className="h-4 w-4" /> Edit profile
          </button>
        ) : null}
      </div>
      {message && !editing ? <p role="status" className="mt-4 inline-flex items-center gap-2 text-sm text-agriculture"><Check aria-hidden="true" className="h-4 w-4" />{message}</p> : null}
      {editing ? (
        <form onSubmit={onSave} className="mt-6 max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">Full name
              <input required maxLength={80} autoComplete="name" value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} className={inputClass} placeholder="Your full name" />
            </label>
            <label className="block text-sm font-semibold text-ink">Username
              <input required minLength={3} maxLength={20} pattern="[a-z][a-z0-9_]{2,19}" autoCapitalize="none" autoComplete="username" spellCheck={false} value={draft.username} onChange={(event) => update("username", event.target.value)} className={inputClass} placeholder="Choose a username" />
              <span className="mt-2 block text-xs font-normal leading-5 text-stone-600">You can change this. Previous usernames remain reserved to your account.</span>
            </label>
            <label className="block text-sm font-semibold text-ink">Email
              <input required type="email" autoComplete="email" value={draft.email} onChange={(event) => update("email", event.target.value)} className={inputClass} placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-semibold text-ink">Phone <span className="font-normal text-stone-600">(optional)</span>
              <input type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} placeholder="Your phone number" />
            </label>
          </div>
          {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-ink/10 pt-5">
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-card bg-orangeAction px-5 py-2 text-sm font-semibold text-ink hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              <Save aria-hidden="true" className="h-4 w-4" /> Save changes
            </button>
            <button type="button" onClick={() => { setDraft(profile); setEditing(false); setError(""); }} className="inline-flex min-h-11 items-center rounded-card text-sm font-semibold text-stone-600 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">Cancel</button>
          </div>
        </form>
      ) : (
        <dl className="mt-6 grid max-w-4xl gap-x-10 gap-y-5 border-y border-ink/10 py-5 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold text-ink">Email</dt><dd className="mt-1 break-all text-stone-600">{profile.email}</dd></div>
          <div><dt className="font-semibold text-ink">Phone</dt><dd className="mt-1 text-stone-600">{profile.phone || "Not added"}</dd></div>
        </dl>
      )}
    </section>
  );
}
