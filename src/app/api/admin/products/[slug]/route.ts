import { adminOperation, can } from "@/lib/admin-access";
import { audited } from "@/lib/admin-audit";
import { AdminError } from "@/lib/admin-store";
import { NextResponse } from "next/server";
import { checkProductAccess, productApiError, readProductForm } from "@/lib/admin-product-api";
import { getAdminProducts, deleteMarketplaceProduct, saveMarketplaceProduct } from "@/lib/marketplace-store";

export const runtime = "nodejs";
type Context = { params: { slug: string } };

export async function PUT(request: Request, { params }: Context) {
  const denied = await checkProductAccess(request, true);
  if (denied) return denied;
  try {
    return NextResponse.json({ product: await adminOperation(request, "marketplace.products.manage", async (admin) => { const form = await readProductForm(request); const before = (await getAdminProducts()).find((item) => item.slug === params.slug); if ((form.get("status") === "published" || before?.status === "published") && !can(admin, "marketplace.products.publish")) throw new AdminError("Publishing permission is required.", 403); return audited("product.updated", "product", params.slug, () => saveMarketplaceProduct(form, params.slug), before); }) });
  } catch (error) { return productApiError(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = await checkProductAccess(request, true);
  if (denied) return denied;
  try {
    await adminOperation(request, "marketplace.products.manage", async (admin) => {
      const before = (await getAdminProducts()).find((product) => product.slug === params.slug);
      if (before?.status === "published" && !can(admin, "marketplace.products.publish")) throw new AdminError("Publishing permission is required to archive a published listing.", 403);
      return audited("product.archived", "product", params.slug, async () => { await deleteMarketplaceProduct(params.slug); return { ...before, status: "archived" }; }, before);
    });
    return NextResponse.json({ ok: true });
  } catch (error) { return productApiError(error); }
}
