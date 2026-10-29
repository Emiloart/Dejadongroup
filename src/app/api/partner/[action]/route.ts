import { adminCookieOptions } from "@/lib/admin-auth";
import { contentApiError, ContentError } from "@/lib/content-api";
import { currentPartnerToken, getCurrentPartnerView, partnerCookie, partnerCookieName, partnerJson, partnerWriteGuard, readPartnerBody } from "@/lib/partner-api";
import { getPublicPartnerTiers, getPartnerQuote, registerPartner, resendPartnerOtp, savePartnerProfile, signInPartner, signOutPartner, verifyPartnerOtp } from "@/lib/partner-store";
import { cancelPartnerCheckout, createPartnerCheckout, verifyOwnPartnerPayment } from "@/lib/partner-payments";
import { textField } from "@/lib/partner-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: { action: string } };

export async function GET(_request: Request, { params }: Context) {
  try {
    if (params.action === "tiers") return partnerJson({ tiers: await getPublicPartnerTiers() });
    if (params.action === "session") { const view = await getCurrentPartnerView(); return partnerJson(view || { error: "Sign in to your partner account." }, view ? 200 : 401); }
    if (params.action === "benefits") {
      const view = await getCurrentPartnerView();
      if (!view) return partnerJson({ error: "Sign in to your partner account." }, 401);
      if (!view.active) return partnerJson({ error: "Complete verification, registration and payment to access benefits." }, 403);
      return partnerJson({ benefits: view.currentTier!.benefits });
    }
    return partnerJson({ error: "Not found." }, 404);
  } catch (error) { return contentApiError(error); }
}
export async function POST(request: Request, { params }: Context) {
  const action = params.action;
  if (!["register", "session", "verify", "resend", "quote", "checkout", "confirm", "cancel"].includes(action)) return partnerJson({ error: "Not found." }, 404);
  const denied = partnerWriteGuard(request, action, action === "checkout" ? 10 : 20); if (denied) return denied;
  try {
    const input = await readPartnerBody(request);
    if (action === "register" || action === "session") {
      const result = action === "register" ? await registerPartner(input) : await signInPartner(input);
      const { token, ...safe } = result;
      return partnerCookie(partnerJson(safe, action === "register" ? 201 : 200), token);
    }
    const token = currentPartnerToken();
    if (!token || !await getCurrentPartnerView()) throw new ContentError("Sign in to your partner account.", 401);
    if (action === "verify") return partnerJson({ partner: await verifyPartnerOtp(token, input) });
    if (action === "resend") { await resendPartnerOtp(token); return partnerJson({ sent: true }); }
    if (action === "quote") return partnerJson({ quote: await getPartnerQuote(token, input) });
    if (action === "checkout") return partnerJson({ payment: await createPartnerCheckout(token, input) }, 201);
    const reference = textField(input.reference, "payment reference", 80, true);
    if (action === "confirm") return partnerJson({ payment: await verifyOwnPartnerPayment(token, reference) });
    return partnerJson({ payment: await cancelPartnerCheckout(token, reference) });
  } catch (error) { return contentApiError(error); }
}
export async function PUT(request: Request, { params }: Context) {
  if (params.action !== "profile") return partnerJson({ error: "Not found." }, 404);
  const denied = partnerWriteGuard(request, "profile"); if (denied) return denied;
  try {
    const token = currentPartnerToken(); if (!token) throw new ContentError("Sign in to update your profile.", 401);
    const result = await savePartnerProfile(token, await readPartnerBody(request, true));
    const response = partnerJson({ partner: result.partner });
    return result.token ? partnerCookie(response, result.token) : response;
  } catch (error) { return contentApiError(error); }
}
export async function DELETE(request: Request, { params }: Context) {
  if (params.action !== "session") return partnerJson({ error: "Not found." }, 404);
  const denied = partnerWriteGuard(request, "logout", 60); if (denied) return denied;
  try {
    const token = currentPartnerToken(); if (token) await signOutPartner(token);
    const response = partnerJson({ ok: true }); response.cookies.set(partnerCookieName, "", { ...adminCookieOptions, maxAge: 0 }); return response;
  } catch (error) { return contentApiError(error); }
}
