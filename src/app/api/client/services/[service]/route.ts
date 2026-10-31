import { NextResponse } from "next/server";
import { getCurrentClient, readClientBody } from "@/lib/client-auth";
import { isSameOrigin } from "@/lib/admin-auth";
import { contentApiError } from "@/lib/content-api";
import { AdminError } from "@/lib/admin-store";
import { requireClientService } from "@/lib/client-services";
import { clientSavingsView, requestSavingsEnrollment, consentToSavings, ownSavingsAccount } from "@/lib/savings-store";
import { initiateSavingsPayment, confirmSavingsPayment } from "@/lib/savings-payments";
import { requestSavingsWithdrawal, cancelSavingsWithdrawal } from "@/lib/finance-store";
import { readCollection, storageTransaction } from "@/lib/site-storage";
import type { SavingsPayment, SavingsService } from "@/lib/savings-types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: { service: string } };
const json = (data: unknown) => NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
async function access(service: string) {
  const client = await getCurrentClient(); if (!client) throw new AdminError("Sign in to your client account.", 401);
  if (service !== "flexisave" && service !== "food_package_savings") throw new AdminError("Service not found.", 404);
  await requireClientService(client.id, service); return { client, service: service as SavingsService };
}
export async function GET(_request: Request, { params }: Context) {
  try { const { client, service } = await access(params.service); return json(await clientSavingsView(client.id, service)); }
  catch (error) { return contentApiError(error); }
}
export async function POST(request: Request, { params }: Context) {
  try {
    if (!isSameOrigin(request)) throw new AdminError("Refresh the page and try again.", 403);
    const input = await readClientBody(request);
    const context = await storageTransaction(async () => {
      const { client, service } = await access(params.service);
      if (input.action === "enroll") return { result: await requestSavingsEnrollment(client.id, service, input) };
      const account = await ownSavingsAccount(client.id, String(input.accountId || ""));
      if (account.service !== service) throw new AdminError("Savings record not found.", 404);
      if (input.action === "consent") return { result: await consentToSavings(client.id, account.id, input) };
      if (input.action === "withdraw") return { result: await requestSavingsWithdrawal(client.id, account.id, input) };
      if (input.action === "cancel-withdrawal") return { result: await cancelSavingsWithdrawal(client.id, account.id, String(input.id || "")) };
      if (input.action === "contribute") return { client, account };
      if (input.action === "verify") {
        const payment = (await readCollection<SavingsPayment>("finance-payments")).find((item) => item.clientId === client.id && item.accountId === account.id && item.reference === input.reference);
        if (!payment) throw new AdminError("Payment not found.", 404);
        return { client, account, reference: payment.reference };
      }
      throw new AdminError("Choose a supported action.");
    });
    if ("result" in context) return json({ ok: true });
    return json("reference" in context ? await confirmSavingsPayment(context.reference!) : await initiateSavingsPayment(context.client.id, context.account.id));
  } catch (error) { return contentApiError(error); }
}
