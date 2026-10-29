"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClientSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/client/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.replace("/login?role=client"); router.refresh();
    } catch { setError("Could not sign out. Try again."); setBusy(false); }
  }
  return <div><button type="button" onClick={signOut} disabled={busy} className="min-h-11 text-sm font-semibold text-orangeAction hover:underline disabled:opacity-50">{busy ? "Signing out…" : "Sign out"}</button>{error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}</div>;
}
