import { NextResponse } from "next/server";
import { checkProductAccess, productApiError, readProductForm } from "@/lib/admin-product-api";
import { deleteMarketplaceProduct, saveMarketplaceProduct } from "@/lib/marketplace-store";

export const runtime = "nodejs";
type Context = { params: { slug: string } };

export async function PUT(request: Request, { params }: Context) {
  const denied = checkProductAccess(request, true);
  if (denied) return denied;
  try {
    return NextResponse.json({ product: await saveMarketplaceProduct(await readProductForm(request), params.slug) });
  } catch (error) { return productApiError(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = checkProductAccess(request, true);
  if (denied) return denied;
  try {
    await deleteMarketplaceProduct(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) { return productApiError(error); }
}
