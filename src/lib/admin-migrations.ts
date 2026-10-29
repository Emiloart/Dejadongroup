import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { dataDirectory, readCollection, updateCollection, storageTransaction } from "@/lib/site-storage";
import type { ProgrammeState } from "@/lib/partner-store";
import { appendAudit } from "@/lib/admin-audit";
export async function migrateAdministration() {
  return storageTransaction(async () => {
    if ((await readCollection<{ version: number }>("migrations")).some((item) => item.version === 2)) return { applied: false, backup: null };
    const directory = dataDirectory();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const backup = path.join(directory, "migration-backups", `admin-v2-${Date.now()}`);
    await mkdir(backup, { recursive: true, mode: 0o700 });
    for (const filename of await readdir(directory)) if (/^[a-z][a-z-]*\.json$/.test(filename) && filename !== "journal.json") await writeFile(path.join(backup, filename), await readFile(path.join(directory, filename)), { mode: 0o600 });
    let snapshots = 0;
    const programme = await readCollection<ProgrammeState>("partner-programme");
    if (programme.length) await updateCollection<ProgrammeState, void>("partner-programme", (items) => {
      for (const state of items) for (const payment of state.payments) if (payment.entitledAt && !payment.tierSnapshot) {
        const tier = state.tiers.find((tier) => tier.id === payment.tierId);
        if (tier) { payment.tierSnapshot = structuredClone(tier); payment.snapshotOrigin = "legacy-migration"; snapshots++; }
      }
      return { items, result: undefined };
    });
    await updateCollection<{ version: number; appliedAt: string; snapshots: number }, void>("migrations", (items) => ({ items: [...items, { version: 2, appliedAt: new Date().toISOString(), snapshots }], result: undefined }));
    await appendAudit({ action: "migration.admin-v2", resource: "migration", resourceId: "2", after: { snapshots }, reason: "Additive migration; legacy benefit snapshots reflect the configuration available at cutover." });
    return { applied: true, backup };
  });
}
