import assert from "node:assert/strict";
import { test } from "node:test";
import support from "./partner-test-support.cjs";

test("client and partner dashboard support is private, scoped, persistent and auditable", { timeout: 180000 }, async () => {
  const h = await support.startPartnerHarness();
  try {
    const ownerCookie = await h.adminSession();
    const adminPost = async (resource, body, cookie = ownerCookie, status = 200) => h.json(await h.request(`/api/admin/governance/${resource}`, { cookie, method: "POST", body }), status);
    async function clientAccount(fullName, email) {
      const record = (await h.json(await h.request("/api/admin/clients", { cookie: ownerCookie, method: "POST", body: { fullName, email, verified: true, withdrawals: [] } }), 201)).client;
      const issued = await h.json(await h.request(`/api/admin/clients/${record.id}/token`, { cookie: ownerCookie, method: "POST", body: { action: "issue" } }));
      const activated = await h.request("/api/client/register", { method: "POST", body: { token: issued.token, email, password: "client-support-test-password" } });
      await h.json(activated, 201);
      return { record, cookie: h.cookie(activated) };
    }

    const firstClient = await clientAccount("Support Client One", "support-one@example.test");
    const secondClient = await clientAccount("Support Client Two", "support-two@example.test");

    const tier = (await h.json(await h.request("/api/admin/partner-programme/tiers", { cookie: ownerCookie, method: "POST", body: {
      name: "Support test tier", description: "Temporary isolated support test", rank: 1, fee: "0", active: true,
      benefits: [{ id: "support-test-benefit", title: "Support test", summary: "Test only", content: "Test only" }]
    } }))).tier;
    const partnerEmail = "support-partner@example.test";
    const signup = await h.request("/api/partner/register", { method: "POST", body: { email: partnerEmail, fullName: "Support Partner", password: "partner-support-test-password" } });
    await h.json(signup, 201);
    const partnerCookie = h.cookie(signup);
    await h.json(await h.request("/api/partner/verify", { cookie: partnerCookie, method: "POST", body: { code: h.inbox.get(partnerEmail) } }));
    await h.json(await h.request("/api/partner/profile", { cookie: partnerCookie, method: "PUT", body: { phone: "08010000000", accountNumber: "0012345678", location: "Awka", dob: "1990-01-01", occupation: "Farmer", nationality: "Nigerian" } }));
    const quote = (await h.json(await h.request("/api/partner/quote", { cookie: partnerCookie, method: "POST", body: { tierId: tier.id } }))).quote;
    await h.json(await h.request("/api/partner/checkout", { cookie: partnerCookie, method: "POST", body: { tierId: tier.id, fingerprint: quote.fingerprint } }), 201);
    const partner = (await h.json(await h.request("/api/partner/session", { cookie: partnerCookie }))).partner;
    assert.ok(partner.id);

    const firstTicket = (await h.json(await h.request("/api/support/client", { cookie: firstClient.cookie, method: "POST", body: { category: "investment", subject: "Property allocation update", message: "Please share the next update for my property." } }), 201)).ticket;
    const secondTicket = (await h.json(await h.request("/api/support/client", { cookie: secondClient.cookie, method: "POST", body: { category: "account", subject: "Private account question", message: "This message belongs to the second client." } }), 201)).ticket;
    const partnerTicket = (await h.json(await h.request("/api/support/partner", { cookie: partnerCookie, method: "POST", body: { category: "partner_programme", subject: "Partner materials", message: "Where can I find the new partner materials?" } }), 201)).ticket;
    assert.match(firstTicket.reference, /^DJ-SUP-[A-F0-9]{12}$/);
    assert.equal("ownerId" in firstTicket, false);
    assert.equal((await h.request(`/api/support/client/${secondTicket.id}`, { cookie: firstClient.cookie })).status, 404, "clients cannot read another client's ticket");
    assert.equal((await h.request(`/api/support/partner/${firstTicket.id}`, { cookie: partnerCookie })).status, 404, "partner and client IDs are separate ownership domains");
    assert.equal((await h.request("/api/support/client", { cookie: partnerCookie })).status, 401, "the requested dashboard role must have its own authenticated session");
    assert.equal((await h.request("/api/support/client", { cookie: firstClient.cookie, method: "POST", headers: { Origin: "https://wrong.example.test" }, body: { category: "account", subject: "Wrong origin", message: "Should be rejected." } })).status, 403);
    assert.equal((await h.request("/api/support/client", { cookie: firstClient.cookie, method: "POST", body: { category: "unsupported", subject: "Bad category", message: "Should be rejected." } })).status, 400);

    const supportEmail = "support-agent@example.test";
    const supportPassword = "support-agent-test-password";
    const invitation = await adminPost("users", {
      name: "Support Agent", email: supportEmail, roles: ["customer_support_admin"], grants: [], denied: [],
      scope: { clients: [firstClient.record.id], partners: [partner.id] }, confirm: true, reason: "Create a scoped support test account"
    });
    await h.json(await h.request("/api/admin/session", { method: "PUT", body: { email: supportEmail, password: supportPassword, token: invitation.invitation } }));
    const agentCookie = await h.adminSession({ email: supportEmail, password: supportPassword });
    const publishingCookie = await h.adminSession(h.staff);

    assert.equal((await h.request("/api/admin/support")).status, 401);
    assert.equal((await h.request("/api/admin/support", { cookie: publishingCookie })).status, 403, "ordinary publishing staff do not get support access");
    assert.equal((await h.request("/admin/support", { cookie: publishingCookie })).status, 404);
    const adminWorkspace = await h.request("/admin/support", { cookie: agentCookie });
    assert.equal(adminWorkspace.status, 200);
    assert.match(await adminWorkspace.text(), /Customer support/);
    assert.match(await (await h.request("/dashboard/client/support", { cookie: firstClient.cookie })).text(), /New request/);
    assert.match(await (await h.request("/dashboard/partner/support", { cookie: partnerCookie })).text(), /New request/);

    const queue = await h.json(await h.request("/api/admin/support", { cookie: agentCookie }));
    assert.deepEqual(new Set(queue.tickets.map((ticket) => ticket.id)), new Set([firstTicket.id, partnerTicket.id]));
    assert.equal(queue.counts.open, 2);
    assert.doesNotMatch(JSON.stringify(queue), /accountNumber|dob|sessions|passwordHash/);
    const adminOverview = await h.request("/admin", { cookie: agentCookie });
    assert.match(await adminOverview.text(), /Customer support requests waiting for the team/);
    assert.equal((await h.request(`/api/admin/support/${secondTicket.id}`, { cookie: agentCookie })).status, 404, "support staff cannot inspect accounts outside their client and partner scopes");
    assert.equal((await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: publishingCookie })).status, 403);
    assert.equal((await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: agentCookie, method: "POST", body: { action: "resolve" } })).status, 409, "an agent must take ownership before resolving a request");

    await h.json(await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: agentCookie, method: "POST", body: { action: "claim" } }));
    const replyText = "SUPPORT_REPLY_PRIVATE_SENTINEL";
    await h.json(await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: agentCookie, method: "POST", body: { action: "reply", message: replyText } }));
    const internalText = "INTERNAL_NOTE_PRIVATE_SENTINEL";
    await h.json(await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: agentCookie, method: "POST", body: { action: "note", message: internalText } }));
    const customerDetail = (await h.json(await h.request(`/api/support/client/${firstTicket.id}`, { cookie: firstClient.cookie }))).ticket;
    assert.equal(customerDetail.messages.at(-1).body, replyText);
    assert.equal("notes" in customerDetail, false, "internal notes are never returned to dashboard users");
    const adminDetail = (await h.json(await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: agentCookie }))).ticket;
    assert.equal(adminDetail.notes.at(-1).body, internalText);

    await h.json(await h.request(`/api/admin/support/${firstTicket.id}`, { cookie: agentCookie, method: "POST", body: { action: "resolve" } }));
    const reopened = (await h.json(await h.request(`/api/support/client/${firstTicket.id}`, { cookie: firstClient.cookie, method: "POST", body: { action: "reply", message: "I still need one more detail." } }))).ticket;
    assert.equal(reopened.status, "open", "a customer reply reopens a resolved request");

    const audit = await h.json(await h.request("/api/admin/governance/audit", { cookie: ownerCookie }));
    const auditText = JSON.stringify(audit);
    assert.match(auditText, /support\.ticket\.replied/);
    assert.doesNotMatch(auditText, /SUPPORT_REPLY_PRIVATE_SENTINEL|INTERNAL_NOTE_PRIVATE_SENTINEL/, "support message text is never copied to the audit log");

    await h.restart();
    const persisted = await h.json(await h.request("/api/admin/support", { cookie: agentCookie }));
    assert.equal(persisted.tickets.find((ticket) => ticket.id === firstTicket.id).status, "open");
    assert.equal((await h.json(await h.request(`/api/support/partner/${partnerTicket.id}`, { cookie: partnerCookie }))).ticket.subject, "Partner materials");
  } finally { await h.close(); }
});
