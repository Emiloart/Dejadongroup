import { adminOperation, can } from "@/lib/admin-access";
import { audited } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { NextResponse } from "next/server";
import { checkProductAccess, productApiError, readProductForm } from "@/lib/admin-product-api";
import { getAdminProducts, saveMarketplaceProduct } from "@/lib/marketplace-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await checkProductAccess(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ products: await getAdminProducts() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return productApiError(error); }
}

export async function POST(request: Request) {
  const denied = await checkProductAccess(request, true);
  if (denied) return denied;
  try {
    return NextResponse.json({ product: await adminOperation(request, "marketplace.products.manage", async (admin) => { const form = await readProductForm(request); if (form.get("status") === "published" && !can(admin, "marketplace.products.publish")) throw new AdminError("Publishing permission is required.", 403); return audited("product.created", "product", "new", () => saveMarketplaceProduct(form)); }) }, { status: 201 });
  } catch (error) { return productApiError(error); }
}
