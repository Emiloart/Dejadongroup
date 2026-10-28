export class RequestBodyTooLarge extends Error {}

export async function readLimitedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new RequestBodyTooLarge();
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new RequestBodyTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
