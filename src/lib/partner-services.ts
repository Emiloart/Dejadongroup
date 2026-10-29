import { createHmac, timingSafeEqual } from "node:crypto";
import { ContentError } from "@/lib/content-api";

export function serviceConfiguration() {
  return { email: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM), payments: Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.APP_BASE_URL) };
}
export function appBaseUrl() {
  try {
    const url = new URL(process.env.APP_BASE_URL || "");
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || !(url.protocol === "https:" || url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error();
    return url.origin;
  } catch { throw new ContentError("The programme is not ready for payments. Please contact De Jadon Group.", 503); }
}
export async function sendPartnerOtp(email: string, otp: string, deliveryId: string) {
  if (!serviceConfiguration().email) throw new ContentError("Verification email is not set up yet. Please contact De Jadon Group.", 503);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `partner-verification/${deliveryId}` },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], subject: "Verify your De Jadon Group partner email", text: `Your De Jadon Group verification code is ${otp}. It expires in 10 minutes. Do not share this code. If you did not create an account, ignore this email.` }),
    signal: AbortSignal.timeout(15000), cache: "no-store"
  });
  if (!response.ok) throw new ContentError("We could not send the verification email. Please try resending the code.", 502);
}
export function otpDigest(partnerId: string, otp: string) {
  if (!process.env.RESEND_API_KEY) throw new ContentError("Email verification is not configured.", 503);
  return createHmac("sha256", process.env.RESEND_API_KEY).update(`${partnerId}:${otp}`).digest("hex");
}
export async function paystack<T>(route: string, body?: Record<string, unknown>): Promise<T> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new ContentError("Payments are not set up yet. Please contact De Jadon Group.", 503);
  let response: Response;
  try {
    response = await fetch(`https://api.paystack.co${route}`, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000), cache: "no-store" });
  } catch { throw new ContentError("The payment service did not respond. Please check the payment status before trying again.", 502); }
  // Paystack IDs can be unsigned 64-bit integers. Preserve large IDs as strings.
  const result = JSON.parse((await response.text()).replace(/("id"\s*:\s*)(\d{16,})(?=\s*[,}])/g, '$1"$2"'));
  if (!response.ok || result.status !== true || !result.data) throw new ContentError("The payment service could not complete this request. Please try checking its status again.", 502);
  return result.data as T;
}
export function validPaystackSignature(raw: Buffer, supplied: string | null) {
  if (!process.env.PAYSTACK_SECRET_KEY || !supplied || !/^[a-f0-9]{128}$/i.test(supplied)) return false;
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(supplied, "hex"));
}
