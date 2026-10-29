import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

type CollectionName = "news" | "newsletter" | "clients";
const directory = () => path.resolve(process.env.DEJADON_DATA_DIR || path.join(process.cwd(), ".data"));

export async function readCollection<T>(name: CollectionName): Promise<T[]> {
  try {
    const stored: unknown = JSON.parse(await readFile(path.join(directory(), `${name}.json`), "utf8"));
    if (!stored || typeof stored !== "object" || !("items" in stored) || !Array.isArray(stored.items)) throw new Error(`Invalid ${name} data`);
    return stored.items as T[];
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

type StorageGlobal = typeof globalThis & { dejadonContentQueues?: Map<string, Promise<unknown>> };
export function updateCollection<T, R>(name: CollectionName, update: (items: T[]) => { items: T[]; result: R } | Promise<{ items: T[]; result: R }>): Promise<R> {
  const shared = globalThis as StorageGlobal;
  const queues = shared.dejadonContentQueues ||= new Map();
  const key = path.join(directory(), `${name}.json`);
  const operation = (queues.get(key) || Promise.resolve()).then(async () => {
    const { items, result } = await update(await readCollection<T>(name));
    await mkdir(directory(), { recursive: true });
    const temporary = path.join(directory(), `${name}-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify({ version: 1, items }, null, 2), { mode: 0o600 });
    await rename(temporary, key);
    return result;
  });
  queues.set(key, operation.catch(() => undefined));
  return operation;
}
