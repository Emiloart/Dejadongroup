import { AdminResourceHistory } from "@/components/admin-resource-history";
import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShell } from "@/components/admin-shell";
import { adminPage } from "@/lib/admin-access";
import { getAdminProducts } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = await adminPage("marketplace.products.read"); if (!admin) return null;
  const products = await getAdminProducts();

  return (
    <AdminShell section="products">
      <AdminProductManager initialProducts={products} />
    <AdminResourceHistory resource="product" /></AdminShell>
  );
}
