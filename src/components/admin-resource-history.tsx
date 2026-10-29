import { auditHistory } from "@/lib/admin-audit";
import { readAdministration } from "@/lib/admin-store";
/** Render only after the caller has authorized this department's read permission. */
export async function AdminResourceHistory({ resource }: { resource: "product" | "news" | "client" }) {
  const events = (await auditHistory()).filter((event) => event.resource === resource).slice(-100).reverse();
  const users = (await readAdministration()).users;
  return <section className="mt-8 rounded-card border border-ink/10 bg-white p-6"><h2 className="text-2xl">Change history</h2><div className="mt-5 max-h-96 space-y-3 overflow-y-auto">{events.map((event) => <details key={event.id} className="border-t pt-3"><summary className="cursor-pointer text-sm leading-7">{event.action} · {event.at} · {users.find((user) => user.id === event.actorId)?.name || event.actorId}</summary><pre className="overflow-auto whitespace-pre-wrap break-all p-3 text-xs">{JSON.stringify({ before: event.before, after: event.after, reason: event.reason }, null, 2)}</pre></details>)}{!events.length ? <p className="text-sm text-stone-500">History starts with changes recorded after the department upgrade.</p> : null}</div></section>;
}
