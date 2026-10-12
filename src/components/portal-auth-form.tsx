"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerPreviewAccount, signInPreviewAccount } from "@/lib/preview-account";
import type { DashboardRole } from "@/types/site";

type Mode = "signin" | "signup";
const inputClass = "mt-2 w-full rounded-card border border-ink/15 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-orangeAction";

export function PortalAuthForm({ initialRole, nextPath }: { initialRole: DashboardRole; nextPath?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<DashboardRole>(initialRole);
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const result = mode === "signup"
        ? await registerPreviewAccount({ role, fullName, username, email, phone, password })
        : await signInPreviewAccount(role, email, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const root = "/dashboard/" + role;
      const destination = nextPath && (nextPath === root || nextPath.startsWith(root + "/") || nextPath.startsWith(root + "?") || nextPath.startsWith(root + "#"))
        ? nextPath
        : root;
      router.push(destination);
      router.refresh();
    } catch {
      setError("This browser could not open the account. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orangeAction">Choose your portal</p>
        <div className="mt-3 flex gap-6 border-b border-ink/10">
          {(["partner", "client"] as const).map((option) => (
            <button key={option} type="button" aria-pressed={role === option} onClick={() => { setRole(option); setError(""); }} className={`min-h-11 border-b-2 text-sm font-semibold capitalize ${role === option ? "border-orangeAction text-ink" : "border-transparent text-stone-500 hover:text-orangeAction"}`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 flex gap-6 border-b border-ink/10">
        <button type="button" aria-pressed={mode === "signin"} onClick={() => { setMode("signin"); setError(""); }} className={`min-h-11 border-b-2 text-sm font-semibold ${mode === "signin" ? "border-orangeAction text-ink" : "border-transparent text-stone-500 hover:text-orangeAction"}`}>Sign in</button>
        <button type="button" aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setError(""); }} className={`min-h-11 border-b-2 text-sm font-semibold ${mode === "signup" ? "border-orangeAction text-ink" : "border-transparent text-stone-500 hover:text-orangeAction"}`}>Create account</button>
      </div>

      <form onSubmit={onSubmit} className="mt-6">
        <h2 className="text-2xl font-medium text-ink">{mode === "signup" ? "Create your " + role + " account" : "Sign in to your " + role + " account"}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{mode === "signup" ? "Your details will appear in this portal’s profile." : "Use the email and password saved for this portal."}</p>

        {mode === "signup" ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">Full name
              <input required maxLength={80} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className={inputClass} placeholder="Your full name" />
            </label>
            <label className="block text-sm font-semibold text-ink">Username
              <input required minLength={3} maxLength={20} pattern="[a-z][a-z0-9_]{2,19}" autoCapitalize="none" autoComplete="username" spellCheck={false} value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className={inputClass} placeholder="Choose a username" />
            </label>
          </div>
        ) : null}

        <div className={mode === "signup" ? "mt-5 grid gap-5 sm:grid-cols-2" : "mt-6 grid gap-5"}>
          <label className="block text-sm font-semibold text-ink">Email
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" />
          </label>
          {mode === "signup" ? (
            <label className="block text-sm font-semibold text-ink">Phone <span className="font-normal text-stone-500">(optional)</span>
              <input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="Your phone number" />
            </label>
          ) : null}
          <label className="block text-sm font-semibold text-ink">Password
            <input required type="password" minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} />
          </label>
          {mode === "signup" ? (
            <label className="block text-sm font-semibold text-ink">Confirm password
              <input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} placeholder="Enter it again" />
            </label>
          ) : null}
        </div>

        {error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}</p> : null}
        <button disabled={busy} type="submit" className="mt-7 inline-flex min-h-11 items-center rounded-card bg-orangeAction px-6 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
        {mode === "signup" ? <p className="mt-4 text-xs leading-5 text-stone-500">Usernames are unique in this browser. Earlier usernames stay reserved if you change yours later.</p> : null}
      </form>
    </div>
  );
}
