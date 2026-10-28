import { readProductImage } from "@/lib/marketplace-store";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const image = await readProductImage(params.filename);
  if (!image) return new Response("Image not found", { status: 404 });
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox"
    }
  });
}
