"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, Loader2, Package, Pencil, Plus, Search, Upload, X } from "lucide-react";
import { formatProductPrice, getMarketplaceCategoryName, marketplaceCategories, type MarketplaceProduct } from "@/lib/marketplace-data";

type ProductForm = {
  name: string;
  category: MarketplaceProduct["category"];
  summary: string;
  description: string;
  price: string;
  unit: string;
  imageAlt: string;
  status: "draft" | "published";
  availability: "in-stock" | "out-of-stock" | "on-request";
};

type Filter = "all" | "published" | "draft" | "archived";
type FieldErrors = Partial<Record<keyof ProductForm | "image", string>>;

const inputClass = "mt-2 w-full rounded-card border border-stone-300 bg-white px-3.5 py-3 text-base text-ink placeholder:text-stone-400 focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20 disabled:bg-stone-50 sm:text-sm";
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60";
const availabilityLabels = { "in-stock": "In stock", "out-of-stock": "Out of stock", "on-request": "Available on request" };
const maxImageSize = 5 * 1024 * 1024;

function toForm(product?: MarketplaceProduct): ProductForm {
  return {
    name: product?.name ?? "",
    category: product?.category ?? marketplaceCategories[0].slug,
    summary: product?.summary ?? "",
    description: product?.description ?? "",
    price: product?.price == null ? "" : String(product.price),
    unit: product?.unit ?? "",
    imageAlt: product?.imageAlt ?? "",
    status: product?.status === "archived" ? "draft" : product?.status ?? "draft",
    availability: product?.availability ?? "in-stock"
  };
}

function makeFormData(form: ProductForm, status = form.status) {
  const data = new FormData();
  Object.entries({ ...form, status }).forEach(([key, value]) => data.set(key, value));
  return data;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-2 text-sm text-red-700">{message}</p> : null;
}

async function readResult(response: Response): Promise<MarketplaceProduct> {
  const result = await response.json().catch(() => ({})) as { product?: MarketplaceProduct; error?: string };
  if (!response.ok || !result.product) throw new Error(result.error || "We couldn’t save this product. Please try again.");
  return result.product;
}

export function AdminProductManager({ initialProducts }: { initialProducts: MarketplaceProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(() => toForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const editorWasOpen = useRef(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (editorOpen || editorWasOpen.current) headingRef.current?.focus();
    editorWasOpen.current = editorOpen;
  }, [editorOpen]);

  function openEditor(product?: MarketplaceProduct) {
    setEditing(product ?? null);
    setForm(toForm(product));
    setImageFile(null);
    setRemoveImage(false);
    setErrors({});
    setError("");
    setNotice("");
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function updateField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    let message = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) message = "Choose a JPG, PNG, or WebP image.";
    else if (file.size > maxImageSize) message = "Choose an image smaller than 5 MB.";
    setErrors((current) => ({ ...current, image: message || undefined }));
    if (message) {
      event.target.value = "";
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
  }

  function updateList(product: MarketplaceProduct) {
    setProducts((current) => current.some((item) => item.slug === product.slug)
      ? current.map((item) => item.slug === product.slug ? product : item)
      : [product, ...current]);
  }

  async function saveProduct(status = form.status) {
    if (pending) return;
    const nextErrors: FieldErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter a product name.";
    if (!form.summary.trim()) nextErrors.summary = "Add a short description for the product preview.";
    if (form.price.trim() && !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(form.price.trim())) nextErrors.price = "Enter a price of 0 or more with up to two decimal places, or leave it blank.";
    if (errors.image) nextErrors.image = errors.image;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError("Please check the highlighted fields before saving.");
      document.getElementById(`product-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    setPending("save");
    setError("");
    try {
      const data = makeFormData(form, status);
      if (imageFile) data.set("image", imageFile);
      if (removeImage) data.set("removeImage", "true");
      const response = await fetch(editing ? `/api/admin/products/${encodeURIComponent(editing.slug)}` : "/api/admin/products", {
        method: editing ? "PUT" : "POST",
        body: data
      });
      const product = await readResult(response);
      updateList(product);
      setEditorOpen(false);
      setNotice(product.status === "published" ? `${product.name} is published in the marketplace.` : `${product.name} is saved as a draft.`);
      setFilter("all");
      setQuery("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t save this product. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function moveToDraft(product: MarketplaceProduct) {
    if (pending) return;
    setPending(product.slug);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, { method: "PUT", body: makeFormData(toForm(product), "draft") });
      updateList(await readResult(response));
      setNotice(`${product.name} was moved to drafts and is hidden from the marketplace.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t update this product. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function archive(product: MarketplaceProduct) {
    if (pending || !window.confirm(`Archive ${product.name} and hide it from the marketplace?`)) return;
    setPending(product.slug); setError(""); setNotice("");
    try { const response = await fetch(`/api/admin/products/${encodeURIComponent(product.slug)}`, { method: "DELETE" }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to archive this product."); updateList({ ...product, status: "archived" }); setNotice(`${product.name} has been archived. Its history is retained.`); router.refresh(); } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to archive this product."); } finally { setPending(null); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveProduct();
  }

  const photo = imagePreview || (!removeImage ? editing?.image : null);
  const visibleProducts = products.filter((product) =>
    (filter === "all" || product.status === filter) &&
    `${product.name} ${product.summary} ${getMarketplaceCategoryName(product.category)}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          {editorOpen && <button type="button" disabled={!!pending} onClick={() => { setEditorOpen(false); setError(""); }} className="mb-5 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-stone-600 hover:text-ink"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to products</button>}
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Marketplace management</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-4xl font-medium tracking-tight focus:outline-none sm:text-5xl">{editorOpen ? editing ? "Edit product" : "Add a product" : "Products"}</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">{editorOpen ? "Add a photo, set your price, and tell customers what’s available." : "Manage the products, photos, and prices customers see in your marketplace."}</p>
        </div>
        {!editorOpen && <button type="button" className={`${buttonClass} bg-ink text-white hover:bg-stone-700`} onClick={() => openEditor()}><Plus aria-hidden="true" className="h-4 w-4" /> Add product</button>}
      </div>

      {notice && <p role="status" className="mt-6 flex items-start gap-2 rounded-card border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{notice}</p>}
      {error && <p role="alert" className="mt-6 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {editorOpen ? (
        <form onSubmit={submit} className="mt-8" noValidate>
          <fieldset disabled={!!pending} className="min-w-0">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
              <div className="space-y-6">
                <section aria-labelledby="product-details-heading" className="rounded-card border border-ink/10 bg-white p-5 sm:p-7">
                  <h2 id="product-details-heading" className="text-2xl font-medium">Product details</h2>
                  <div className="mt-6">
                    <label htmlFor="product-name" className="text-sm font-semibold">Product name <span className="text-orange-700">*</span></label>
                    <input id="product-name" name="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required maxLength={120} className={inputClass} placeholder="e.g. Fresh fish cutlets" aria-invalid={!!errors.name} aria-describedby={errors.name ? "product-name-error" : undefined} />
                    <FieldError id="product-name-error" message={errors.name} />
                  </div>
                  <div className="mt-5">
                    <label htmlFor="product-category" className="text-sm font-semibold">Category</label>
                    <select id="product-category" name="category" value={form.category} onChange={(event) => updateField("category", event.target.value as ProductForm["category"])} className={inputClass}>
                      {marketplaceCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                    </select>
                  </div>
                  <div className="mt-5">
                    <label htmlFor="product-summary" className="text-sm font-semibold">Short description <span className="text-orange-700">*</span></label>
                    <textarea id="product-summary" name="summary" value={form.summary} onChange={(event) => updateField("summary", event.target.value)} required rows={3} maxLength={300} className={inputClass} placeholder="A brief description for the marketplace product card." aria-invalid={!!errors.summary} aria-describedby={errors.summary ? "product-summary-error" : "product-summary-help"} />
                    <p id="product-summary-help" className="mt-1 text-xs text-stone-500">Keep it short and clear. Up to 300 characters.</p>
                    <FieldError id="product-summary-error" message={errors.summary} />
                  </div>
                  <div className="mt-5">
                    <label htmlFor="product-description" className="text-sm font-semibold">Full product details</label>
                    <textarea id="product-description" name="description" value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={6} maxLength={8000} className={inputClass} placeholder="Include sizes, contents, preparation, packaging, collection, or delivery details." />
                    <p className="mt-1 text-xs text-stone-500">These details appear on the product page.</p>
                  </div>
                </section>

                <section aria-labelledby="pricing-heading" className="rounded-card border border-ink/10 bg-white p-5 sm:p-7">
                  <h2 id="pricing-heading" className="text-2xl font-medium">Price & availability</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="product-price" className="text-sm font-semibold">Price (NGN)</label>
                      <input id="product-price" name="price" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={(event) => updateField("price", event.target.value)} className={inputClass} placeholder="e.g. 7500" aria-invalid={!!errors.price} aria-describedby={errors.price ? "product-price-error" : "product-price-help"} />
                      <p id="product-price-help" className="mt-2 text-xs leading-5 text-stone-500">Leave blank to show “Price on enquiry”.</p>
                      <FieldError id="product-price-error" message={errors.price} />
                    </div>
                    <div>
                      <label htmlFor="product-unit" className="text-sm font-semibold">Unit / pack size</label>
                      <input id="product-unit" name="unit" value={form.unit} onChange={(event) => updateField("unit", event.target.value)} maxLength={80} className={inputClass} placeholder="e.g. kg, 5 kg pack, box" />
                      <p className="mt-2 text-xs leading-5 text-stone-500">Customers will see the price per unit.</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <label htmlFor="product-availability" className="text-sm font-semibold">Availability</label>
                    <select id="product-availability" name="availability" value={form.availability} onChange={(event) => updateField("availability", event.target.value as ProductForm["availability"])} className={inputClass}>
                      {Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section aria-labelledby="product-photo-heading" className="rounded-card border border-ink/10 bg-white p-5 sm:p-7">
                  <h2 id="product-photo-heading" className="text-2xl font-medium">Product photo</h2>
                  <p id="product-photo-help" className="mt-2 text-sm leading-6 text-stone-600">Use a clear product photo. JPG, PNG, or WebP, up to 5 MB.</p>
                  <div className="relative mt-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-card border border-dashed border-stone-300 bg-stone-50">
                    {photo ? <Image src={photo} alt={form.imageAlt || "Product photo preview"} fill sizes="(max-width: 1280px) 80vw, 400px" unoptimized className="object-contain p-2" /> : <div className="p-5 text-center text-stone-400"><ImagePlus aria-hidden="true" className="mx-auto h-10 w-10" /><p className="mt-3 text-sm">Your photo will appear here</p></div>}
                  </div>
                  <label className={`${buttonClass} mt-4 w-full cursor-pointer border border-stone-300 text-ink hover:bg-stone-50 focus-within:ring-2 focus-within:ring-orange-700 focus-within:ring-offset-2`}>
                    <Upload aria-hidden="true" className="h-4 w-4" /> {photo ? "Change photo" : "Upload photo"}
                    <input id="product-image" ref={imageInputRef} name="image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload product photo" aria-invalid={!!errors.image} aria-describedby={errors.image ? "product-image-error" : "product-photo-help"} onChange={selectImage} />
                  </label>
                  {imageFile && <p className="mt-2 break-all text-xs text-stone-500">{imageFile.name}</p>}
                  <FieldError id="product-image-error" message={errors.image} />
                  {photo && <button type="button" onClick={() => { setImageFile(null); setRemoveImage(true); setErrors((current) => ({ ...current, image: undefined })); if (imageInputRef.current) imageInputRef.current.value = ""; }} className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-red-700"><X aria-hidden="true" className="h-4 w-4" /> Remove photo</button>}
                  <div className="mt-5">
                    <label htmlFor="product-image-alt" className="text-sm font-semibold">Photo description</label>
                    <input id="product-image-alt" name="imageAlt" value={form.imageAlt} onChange={(event) => updateField("imageAlt", event.target.value)} maxLength={160} className={inputClass} placeholder="e.g. Fresh cutlets in a sealed pack" />
                    <p className="mt-2 text-xs leading-5 text-stone-500">Helps customers who use screen readers.</p>
                  </div>
                </section>

                <section aria-labelledby="publishing-heading" className="rounded-card border border-ink/10 bg-white p-5 sm:p-7">
                  <h2 id="publishing-heading" className="text-2xl font-medium">Visibility</h2>
                  <div className="mt-5 space-y-3">
                    {([{ value: "draft", title: "Draft", help: "Only visible in this admin workspace." }, { value: "published", title: "Published", help: "Visible to customers in the marketplace." }] as const).map((option) => (
                      <label key={option.value} className={`flex cursor-pointer items-start gap-3 rounded-card border p-4 ${form.status === option.value ? "border-orange-700 bg-orange-50/50" : "border-stone-200"}`}>
                        <input type="radio" name="status" value={option.value} checked={form.status === option.value} onChange={() => updateField("status", option.value)} className="mt-1 h-4 w-4 accent-orange-700" />
                        <span><span className="block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-stone-600">{option.help}</span></span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 rounded-card border border-ink/10 bg-white p-4 sm:p-5">
              <button type="button" onClick={() => { setEditorOpen(false); setError(""); }} className={`${buttonClass} border border-stone-300 text-stone-600 hover:bg-stone-50`}>Cancel</button>
              {form.status === "published" && <button type="button" onClick={() => void saveProduct("draft")} className={`${buttonClass} border border-stone-300 text-ink hover:bg-stone-50`}>Save as draft</button>}
              <button type="submit" className={`${buttonClass} bg-ink text-white hover:bg-stone-700`}>{pending === "save" ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Check aria-hidden="true" className="h-4 w-4" />}{pending === "save" ? "Saving…" : form.status === "published" ? editing?.status === "published" ? "Save changes" : "Publish product" : "Save draft"}</button>
            </div>
          </fieldset>
        </form>
      ) : (
        <section aria-label="Product list" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 pb-5">
            <div className="flex flex-wrap gap-1 rounded-card border border-ink/10 bg-white p-1" aria-label="Filter products by visibility">
              {(["all", "published", "draft", "archived"] as const).map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`min-h-10 rounded px-3 text-sm font-semibold ${filter === value ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-50"}`}>{value === "all" ? "All products" : value === "draft" ? "Drafts" : value === "archived" ? "Archived" : "Published"}<span className="ml-2 text-xs opacity-75">{products.filter((product) => value === "all" || product.status === value).length}</span></button>)}
            </div>
            <div className="relative w-full sm:w-72">
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input id="product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="min-h-11 w-full rounded-card border border-stone-300 bg-white py-2 pl-10 pr-3 text-base sm:text-sm" />
            </div>
          </div>
          <p aria-live="polite" className="mt-5 text-xs text-stone-500">{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}</p>
          {visibleProducts.length ? <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {visibleProducts.map((product) => (
              <article key={product.slug} className="flex min-w-0 flex-col rounded-card border border-ink/10 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-card bg-warm sm:h-28 sm:w-28">
                    {product.image ? <Image src={product.image} alt={product.imageAlt || product.name} fill sizes="112px" unoptimized className="object-cover" /> : <Package aria-hidden="true" className="h-8 w-8 text-stone-400" />}
                  </div>
                  <div className="min-w-0">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.status === "published" ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-600"}`}>{product.status === "published" ? "Published" : product.status === "archived" ? "Archived" : "Draft"}</span>
                    <h2 className="mt-2 break-words text-xl font-medium">{product.name}</h2>
                    <p className="mt-1 text-xs text-stone-500">{getMarketplaceCategoryName(product.category)}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600">{product.summary}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm"><p className="font-semibold text-ink">{formatProductPrice(product)}{typeof product.price === "number" && product.unit ? ` / ${product.unit}` : ""}</p><p className="text-xs text-stone-500">{availabilityLabels[product.availability ?? "on-request"]}</p></div>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/10 pt-3">
                  <button type="button" disabled={!!pending} onClick={() => openEditor(product)} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800 disabled:opacity-50"><Pencil aria-hidden="true" className="h-3.5 w-3.5" /> Edit product</button>
                  {product.status !== "archived" ? <button type="button" disabled={!!pending} onClick={() => void archive(product)} className="min-h-10 text-xs font-semibold text-red-700">Archive listing</button> : null}
                  {product.status === "published" && <><Link href={`/marketplace/${product.slug}`} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-stone-600 hover:text-ink">View <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link><button type="button" disabled={!!pending} onClick={() => void moveToDraft(product)} className="ml-auto inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-stone-500 hover:text-ink disabled:opacity-50">{pending === product.slug && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}Move to drafts</button></>}
                </div>
              </article>
            ))}
          </div> : <div className="mt-4 rounded-card border border-dashed border-stone-300 px-5 py-16 text-center"><Package aria-hidden="true" className="mx-auto h-9 w-9 text-stone-400" /><h2 className="mt-4 text-2xl font-medium">{query || filter !== "all" ? "No matching products" : "Add your first product"}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">{query || filter !== "all" ? "Try a different search or visibility filter." : "Start with a product name and photo, then add a price and publish when you’re ready."}</p>{!query && filter === "all" && <button type="button" onClick={() => openEditor()} className={`${buttonClass} mt-5 bg-ink text-white hover:bg-stone-700`}><Plus aria-hidden="true" className="h-4 w-4" /> Add product</button>}</div>}
        </section>
      )}
    </div>
  );
}
