import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";

export type CollectionName = "news" | "newsletter" | "clients" | "partner-programme" | "administration" | "audit" | "finance" | "managed-content" | "assets" | "client-notes" | "migrations";
export const dataDirectory = () => path.resolve(process.env.DEJADON_DATA_DIR || path.join(process.cwd(), ".data"));
type Transaction = { directory: string; writes: Map<string, unknown> };
type Shared = typeof globalThis & { dejadonTransactions?: AsyncLocalStorage<Transaction>; dejadonStorageQueues?: Map<string, Promise<unknown>> };
const shared = globalThis as Shared;
const context = shared.dejadonTransactions ||= new AsyncLocalStorage<Transaction>();
const queues = shared.dejadonStorageQueues ||= new Map<string, Promise<unknown>>();
const validName = (name: string) => { if (!/^[a-z][a-z-]*\.json$/.test(name)) throw new Error("Invalid document name"); return name; };
async function atomic(directory: string, name: string, value: unknown) {
  const temporary = path.join(directory, `${name}-${randomUUID()}.tmp`);
  const handle = await open(temporary, "w", 0o600);
  try { await handle.writeFile(JSON.stringify(value)); await handle.sync(); } finally { await handle.close(); }
  await rename(temporary, path.join(directory, name));
}
async function recover(directory: string) {
  try {
    const journal = JSON.parse(await readFile(path.join(directory, ".transaction.json"), "utf8")) as { version: number; documents: [string, unknown][] };
    if (journal.version !== 1 || !Array.isArray(journal.documents)) throw new Error("Invalid storage journal");
    for (const [name, value] of journal.documents) await atomic(directory, validName(name), value);
    await unlink(path.join(directory, ".transaction.json"));
  } catch (error) { if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error; }
}
/** One-process serializable transactions. A durable redo journal recovers coordinated
 * documents after interruption. Never run multiple application processes on this adapter. */
export function storageTransaction<T>(operation: () => Promise<T>): Promise<T> {
  const directory = dataDirectory();
  if (context.getStore()?.directory === directory) return operation();
  const result = (queues.get(directory) || Promise.resolve()).then(async () => {
    await recover(directory);
    const transaction: Transaction = { directory, writes: new Map() };
    return context.run(transaction, async () => {
      const value = await operation();
      if (transaction.writes.size) {
        await mkdir(directory, { recursive: true, mode: 0o700 });
        await atomic(directory, "journal.json", { version: 1, documents: [...transaction.writes] });
        await rename(path.join(directory, "journal.json"), path.join(directory, ".transaction.json"));
        await recover(directory);
      }
      return value;
    });
  });
  queues.set(directory, result.catch(() => undefined));
  return result;
}
export async function readDocument<T>(name: string, fallback: T): Promise<T> {
  return storageTransaction(async () => {
    validName(name);
    const transaction = context.getStore()!;
    if (transaction.writes.has(name)) return structuredClone(transaction.writes.get(name)) as T;
    try { return JSON.parse(await readFile(path.join(transaction.directory, name), "utf8")) as T; }
    catch (error) { if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return structuredClone(fallback); throw error; }
  });
}
export async function writeDocument(name: string, value: unknown) {
  return storageTransaction(async () => { context.getStore()!.writes.set(validName(name), structuredClone(value)); });
}
export async function readCollection<T>(name: CollectionName): Promise<T[]> {
  const stored = await readDocument<{ version: number; items: T[] }>(`${name}.json`, { version: 1, items: [] });
  if (!Array.isArray(stored.items)) throw new Error(`Invalid ${name} data`);
  return stored.items;
}
export function updateCollection<T, R>(name: CollectionName, update: (items: T[]) => { items: T[]; result: R } | Promise<{ items: T[]; result: R }>): Promise<R> {
  return storageTransaction(async () => {
    const { items, result } = await update(await readCollection<T>(name));
    await writeDocument(`${name}.json`, { version: 1, items });
    return result;
  });
}
