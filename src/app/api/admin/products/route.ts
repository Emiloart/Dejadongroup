import { NextResponse } from "next/server";
import { checkProductAccess, productApiError, readProductForm } from "@/lib/admin-product-api";
import { getAdminProducts, saveMarketplaceProduct } from "@/lib/marketplace-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = checkProductAccess(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ products: await getAdminProducts() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return productApiError(error); }
}

export async function POST(request: Request) {
  const denied = checkProductAccess(request, true);
  if (denied) return denied;
  try {
    return NextResponse.json({ product: await saveMarketplaceProduct(await readProductForm(request)) }, { status: 201 });
  } catch (error) { return productApiError(error); }
}
