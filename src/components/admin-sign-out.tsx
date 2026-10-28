"use client";

import { useState } from "react";

export function AdminSignOut() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not sign out. Try again.");
      window.location.reload();
    } catch {
      setError("Could not sign out. Try again.");
      setBusy(false);
    }
  }
  return <div><button type="button" disabled={busy} onClick={signOut} className="min-h-9 rounded-card px-3 text-xs font-semibold text-stone-600 hover:bg-ink/5 hover:text-ink disabled:opacity-60">{busy ? "Signing out…" : "Sign out"}</button>{error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}</div>;
}
