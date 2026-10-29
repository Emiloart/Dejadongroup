import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { dataDirectory, readCollection, updateCollection } from "@/lib/site-storage";
import { AdminError } from "@/lib/admin-store";
import { appendAudit } from "@/lib/admin-audit";
import { managedContent } from "@/lib/managed-content";
export type Asset = { id: string; filename: string; mime: string; title: string; folder: string; bytes: number; archived: boolean; createdAt: string; createdBy: string; clientId: string | null };
export const assets = () => readCollection<Asset>("assets");
export async function uploadAsset(file: File, title: string, folder: string, actorId: string, clientId: string | null = null) {
  if (!file || typeof file.arrayBuffer !== "function" || !file.size || file.size > (clientId ? 5 : 20) * 1024 * 1024) throw new AdminError("Choose a supported file within the upload limit (documents 5 MB; media 20 MB).");
  if (!title.trim() || title.length > 160 || folder.length > 80) throw new AdminError("Enter a title of up to 160 characters and folder up to 80 characters.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? ["png", "image/png"] : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? ["jpg", "image/jpeg"] : bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP" ? ["webp", "image/webp"] : clientId && bytes.subarray(0,5).toString() === "%PDF-" ? ["pdf", "application/pdf"] : !clientId && bytes.subarray(4,8).toString() === "ftyp" ? ["mp4", "video/mp4"] : !clientId && bytes.subarray(0,4).equals(Buffer.from([26,69,223,163])) && bytes.subarray(0,100).includes(Buffer.from("webm")) ? ["webm", "video/webm"] : null;
  if (!kind || file.type !== kind[1]) throw new AdminError(clientId ? "Use a valid PDF, JPG, PNG or WebP document." : "Use a valid JPG, PNG, WebP, MP4 or WebM asset.");
  const id = randomUUID(); const filename = `${id}.${kind[0]}`;
  await mkdir(path.join(dataDirectory(), "managed-assets"), { recursive: true, mode: 0o700 });
  await writeFile(path.join(dataDirectory(), "managed-assets", filename), bytes, { mode: 0o600 });
  const asset: Asset = { id, filename, mime: kind[1], title: title.trim(), folder: folder.trim(), bytes: bytes.length, archived: false, createdAt: new Date().toISOString(), createdBy: actorId, clientId };
  await updateCollection<Asset, void>("assets", (items) => ({ items: [...items, asset], result: undefined }));
  await appendAudit({ action: clientId ? "client.document.uploaded" : "media.uploaded", resource: clientId ? "client-document" : "media", resourceId: clientId || id, after: asset });
  return asset;
}
export async function archiveAsset(id: string) {
  if ((await managedContent()).some((item) => item.status === "published" && item.assetId === id)) throw new AdminError("Replace this asset in published content before archiving it.", 409);
  return updateCollection<Asset, Asset>("assets", async (items) => { const asset = items.find((item) => item.id === id && !item.clientId); if (!asset) throw new AdminError("Asset not found.", 404); asset.archived = true; await appendAudit({ action: "media.archived", resource: "media", resourceId: id }); return { items, result: asset }; });
}
export async function assetBytes(asset: Asset) { return readFile(path.join(dataDirectory(), "managed-assets", asset.filename)); }
