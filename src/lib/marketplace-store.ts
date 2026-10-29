import { readDocument, writeDocument, storageTransaction } from "@/lib/site-storage";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { marketplaceCategories, marketplaceProducts, type MarketplaceProduct } from "@/lib/marketplace-data";

export class CatalogError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export const maxProductImageBytes = 5 * 1024 * 1024;
export const marketplaceDataDirectory = () => path.resolve(process.env.DEJADON_DATA_DIR || path.join(process.cwd(), ".data"));

const uploadDirectory = () => path.join(marketplaceDataDirectory(), "uploads");

function defaults(product: MarketplaceProduct): MarketplaceProduct {
  return { description: "", price: null, unit: "", image: null, imageAlt: product.name, status: "published", availability: "on-request", ...product };
}

export async function getAdminProducts(): Promise<MarketplaceProduct[]> {
  const catalog = await readDocument<{ version: number; products: MarketplaceProduct[] }>("products.json", { version: 1, products: marketplaceProducts });
  if (!Array.isArray(catalog.products)) throw new Error("Invalid catalogue file");
  return catalog.products.map(defaults);
}

export async function getPublishedProducts() {
  return (await getAdminProducts()).filter((product) => product.status === "published");
}

export async function getPublishedProduct(slug: string) {
  return (await getPublishedProducts()).find((product) => product.slug === slug);
}

const mutate = storageTransaction;
const persist = (products: MarketplaceProduct[]) => writeDocument("products.json", { version: 1, products });

function field(form: FormData, key: string, maxLength: number, required = false) {
  const raw = form.get(key);
  if (raw !== null && typeof raw !== "string") throw new CatalogError(`Invalid ${key}.`);
  const value = (raw || "").trim();
  if (required && !value) throw new CatalogError(`Enter a ${key}.`);
  if (value.length > maxLength) throw new CatalogError(`${key} must be ${maxLength} characters or fewer.`);
  return value;
}

function productFields(form: FormData) {
  const name = field(form, "name", 120, true);
  const category = marketplaceCategories.find((item) => item.slug === field(form, "category", 40))?.slug;
  if (!category) throw new CatalogError("Choose a valid product category.");
  const status = field(form, "status", 20);
  if (status !== "draft" && status !== "published") throw new CatalogError("Choose draft or published.");
  const availability = field(form, "availability", 20);
  if (availability !== "in-stock" && availability !== "out-of-stock" && availability !== "on-request") throw new CatalogError("Choose a valid availability.");
  const rawPrice = field(form, "price", 20);
  if (rawPrice && !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(rawPrice)) throw new CatalogError("Enter a valid price with up to two decimal places.");
  return {
    name, category, status, availability,
    summary: field(form, "summary", 300, true),
    description: field(form, "description", 8000),
    price: rawPrice ? Number(rawPrice) : null,
    unit: field(form, "unit", 80),
    imageAlt: field(form, "imageAlt", 160) || name
  } satisfies Omit<MarketplaceProduct, "slug" | "image">;
}

async function saveImage(image: File) {
  if (image.size > maxProductImageBytes) throw new CatalogError("Choose a photo smaller than 5 MB.");
  const bytes = Buffer.from(await image.arrayBuffer());
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  const extension = png ? "png" : jpeg ? "jpg" : webp ? "webp" : null;
  const expectedMime = png ? "image/png" : jpeg ? "image/jpeg" : "image/webp";
  if (!extension || image.type !== expectedMime) throw new CatalogError("Upload a valid JPG, PNG or WebP photo.");
  const filename = `${randomUUID()}.${extension}`;
  await mkdir(uploadDirectory(), { recursive: true });
  await writeFile(path.join(uploadDirectory(), filename), bytes, { mode: 0o600 });
  return `/api/media/${filename}`;
}

export async function saveMarketplaceProduct(form: FormData, slug?: string) {
  const fields = productFields(form);
  const file = form.get("image");
  if (typeof file === "string") throw new CatalogError("Choose a photo to upload.");
  return mutate(async () => {
    const products = await getAdminProducts();
    const existing = slug ? products.find((product) => product.slug === slug) : undefined;
    if (slug && !existing) throw new CatalogError("Product not found.", 404);
    let productSlug = slug;
    if (!productSlug) {
      const base = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
      productSlug = base;
      let suffix = 2;
      while (products.some((product) => product.slug === productSlug)) productSlug = `${base}-${suffix++}`;
    }
    let image = form.get("removeImage") === "true" ? null : existing?.image || null;
    if (file && file.size > 0) image = await saveImage(file);
    const product: MarketplaceProduct = { ...fields, slug: productSlug, image };
    await persist(existing ? products.map((item) => item.slug === productSlug ? product : item) : [...products, product]);
    return product;
  });
}

export async function deleteMarketplaceProduct(slug: string) {
  return mutate(async () => {
    const products = await getAdminProducts();
    if (!products.some((product) => product.slug === slug)) throw new CatalogError("Product not found.", 404);
    await persist(products.map((product) => product.slug === slug ? { ...product, status: "archived" } : product));
  });
}

export async function readProductImage(filename: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$/.test(filename)) return null;
  try {
    const bytes = await readFile(path.join(uploadDirectory(), filename));
    const extension = path.extname(filename);
    return { bytes, contentType: extension === ".jpg" ? "image/jpeg" : extension === ".png" ? "image/png" : "image/webp" };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
