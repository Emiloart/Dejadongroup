import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-access";
import { AdminError } from "@/lib/admin-store";
import { CatalogError, maxProductImageBytes } from "@/lib/marketplace-store";
import { readLimitedBody, RequestBodyTooLarge } from "@/lib/request-body";

export async function checkProductAccess(request: Request, write = false) {
  return adminGuard(request, write ? "marketplace.products.manage" : "marketplace.products.read", write);
}

export async function readProductForm(request: Request) {
  const limit = maxProductImageBytes + 128 * 1024;
  if (!request.body || !request.headers.get("content-type")?.startsWith("multipart/form-data")) throw new CatalogError("Submit the product form with its photo.");
  try {
    return await new Response(await readLimitedBody(request, limit), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch (error) {
    if (error instanceof RequestBodyTooLarge) throw new CatalogError("Choose a photo smaller than 5 MB.", 413);
    throw new CatalogError("The product form could not be read. Please try again.");
  }
}

export function productApiError(error: unknown) {
  if (error instanceof CatalogError || error instanceof AdminError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Marketplace operation failed", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "The product could not be saved. Please try again." }, { status: 500 });
}
