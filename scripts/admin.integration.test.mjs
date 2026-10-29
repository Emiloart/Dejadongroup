import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import support from "./partner-test-support.cjs";

test("department APIs, assigned resources, staff lifecycle, content publication and financial separation", { timeout: 180000 }, async () => {
  const h = await support.startPartnerHarness();
  try {
    const ownerCookie = await h.adminSession();
    const call = (route, cookie = ownerCookie, body, method = body ? "POST" : "GET") => h.request(route, { cookie, body, method });
    const post = async (resource, body, cookie = ownerCookie, status = 200) => h.json(await call(`/api/admin/governance/${resource}`, cookie, body), status);
    async function invite(name, roles, scope = { clients: "all", partners: "all" }, grants = [], denied = []) {
      const email = `${name}@example.test`; const password = `test-${name}-password-strong`;
      const result = await post("users", { name, email, roles, grants, denied, scope, confirm: true, reason: "Authorized department assignment" });
      assert.ok(result.invitation); assert.doesNotMatch(JSON.stringify(result.user), /passwordHash|inviteHash|passwordSalt/);
      await h.json(await h.request("/api/admin/session", { method: "PUT", body: { email, password, token: result.invitation, roles: ["super_admin"] } }));
      assert.equal((await h.request("/api/admin/session", { method: "PUT", body: { email, password, token: result.invitation } })).status, 400);
      return { cookie: await h.adminSession({ email, password }), user: result.user, email, password };
    }
    for (const resource of ["users", "audit", "content", "finance", "client-records", "settings"]) assert.equal((await h.request(`/api/admin/governance/${resource}`)).status, 401);
    const clientInput = { fullName: "Client assigned one", verified: true, withdrawals: [{ id: "request-one", amount: 1200, date: "2026-10-26", reference: "WR-ONE", note: "Review requested", status: "pending" }] };
    const first = (await h.json(await call("/api/admin/clients", ownerCookie, clientInput), 201)).client;
    const second = (await h.json(await call("/api/admin/clients", ownerCookie, { fullName: "Restricted client two", verified: true }), 201)).client;
    const media = await invite("media", ["media_admin"]);
    const sales = await invite("sales", ["marketplace_admin"]);
    const programme = await invite("programme", ["partner_programme_admin"]);
    const agro = await invite("agro", ["agro_real_estate_admin"], { clients: [first.id], partners: [] });
    const finance = await invite("finance", ["finance_admin"], { clients: "all", partners: "all" }, ["finance.balances.manage"]);
    const editor = await invite("editor", ["content_editor"]);
    const publisher = await invite("publisher", ["content_publisher"]);
    const matrix = [
      [media, "/api/admin/news", "/api/admin/clients", "/admin/clients"],
      [sales, "/api/admin/products", "/api/admin/partner-programme/overview", "/admin/partners"],
      [programme, "/api/admin/partner-programme/overview", "/api/admin/governance/finance", "/admin/finance"],
      [agro, "/api/admin/clients", "/api/admin/newsletter", "/admin/newsletter"],
      [finance, "/api/admin/governance/finance", "/api/admin/products", "/admin/products"]
    ];
    for (const [staff, allowed, denied, page] of matrix) {
      assert.equal((await call(allowed, staff.cookie)).status, 200);
      assert.equal((await call(denied, staff.cookie)).status, 403);
      assert.equal((await call(page, staff.cookie)).status, 404);
      assert.equal((await call("/api/admin/governance/users", staff.cookie, { roles: ["super_admin"], confirm: true, reason: "Escalation attempt" })).status, 403);
    }
    const listingEditor = await invite("listing-editor", ["marketplace_admin"], { clients: [], partners: [] }, [], ["marketplace.products.publish"]);
    const seededProducts = (await h.json(await call("/api/admin/products", listingEditor.cookie))).products;
    assert.equal((await call(`/api/admin/products/${seededProducts[0].slug}`, listingEditor.cookie, undefined, "DELETE")).status, 403, "archiving a published listing requires publishing permission");
    const productForm = (status) => { const form = new FormData(); for (const [key, value] of Object.entries({ name: "Draft under review", category: seededProducts[0].category, summary: "Draft listing", description: "Details", status, availability: "on-request", price: "1000" })) form.set(key, value); return form; };
    const draftProductResponse = await fetch(`${h.origin}/api/admin/products`, { method: "POST", headers: { Origin: h.origin, Cookie: listingEditor.cookie }, body: productForm("draft") });
    const draftProduct = (await h.json(draftProductResponse, 201)).product;
    assert.equal((await fetch(`${h.origin}/api/admin/products/${draftProduct.slug}`, { method: "PUT", headers: { Origin: h.origin, Cookie: listingEditor.cookie }, body: productForm("published") })).status, 403);
    assert.equal((await call(`/api/admin/products/${draftProduct.slug}`, listingEditor.cookie, undefined, "DELETE")).status, 200);
    const scoped = await h.json(await call("/api/admin/clients", agro.cookie)); assert.deepEqual(scoped.clients.map((client) => client.id), [first.id]);
    assert.equal((await call(`/api/admin/clients/${second.id}`, agro.cookie, { ...second }, "PUT")).status, 404);
    assert.equal((await call(`/api/admin/clients/${second.id}/token`, agro.cookie, { action: "issue" })).status, 404);
    assert.equal((await call(`/api/admin/clients/${first.id}`, agro.cookie, { ...first, balance: 999 }, "PUT")).status, 400);
    assert.equal((await call(`/api/admin/clients/${first.id}`, ownerCookie, { ...first, withdrawals: first.withdrawals.map((item) => ({ ...item, status: "successful" })) }, "PUT")).status, 400);
    assert.equal((await call("/api/admin/partner-programme/promos", programme.cookie, { code: "BYPASS" })).status, 403);
    assert.equal((await call("/api/admin/partner-programme/promos", media.cookie, { code: "BYPASS" })).status, 403);
    assert.equal((await call("/api/admin/partner-programme/payments", sales.cookie, { action: "mark-paid" })).status, 403);
    const tier = (await h.json(await call("/api/admin/partner-programme/tiers", programme.cookie, { name: "Department tier", rank: 1, fee: "0", active: true, benefits: [{ id: "purchased-guide", title: "Guide", summary: "Public summary", content: "PURCHASED CONTENT" }] }))).tier;
    const promoBody = { code: "ONLYOWNER", type: "percent", value: 100, tierIds: [tier.id], active: true, maxUses: 1, perPartnerLimit: 1, eligibleEmails: [], confirm: true, reason: "Approved registration campaign" };
    await h.json(await call("/api/admin/partner-programme/promos", ownerCookie, promoBody));
    const programmeView = await h.json(await call("/api/admin/partner-programme/overview", programme.cookie)); assert.deepEqual(programmeView.promos, []);
    const registered = await h.request("/api/partner/register", { method: "POST", body: { email: "member@example.test", fullName: "Purchased member", password: "member-password-strong", roles: ["super_admin"] } }); await h.json(registered, 201); const memberCookie = h.cookie(registered);
    assert.equal((await call("/api/admin/products", memberCookie)).status, 401);
    const partnerPost = (action, body) => h.request(`/api/partner/${action}`, { method: "POST", body, cookie: memberCookie });
    await h.json(await partnerPost("verify", { code: h.inbox.get("member@example.test") }));
    await h.json(await h.request("/api/partner/profile", { method: "PUT", cookie: memberCookie, body: { phone: "08012345678", accountNumber: "0012345678", location: "Awka", dob: "1990-01-01", occupation: "Farmer", nationality: "Nigerian" } }));
    const quote = (await h.json(await partnerPost("quote", { tierId: tier.id }))).quote;
    const purchase = await h.json(await partnerPost("checkout", { tierId: tier.id, fingerprint: quote.fingerprint }), 201); assert.doesNotMatch(JSON.stringify(purchase), /tierSnapshot/);
    await h.json(await call("/api/admin/partner-programme/tiers", programme.cookie, { ...tier, fee: "1000", benefits: [] }));
    const memberView = await h.json(await call("/api/partner/session", memberCookie)); assert.equal(memberView.currentTier.benefits[0].content, "PURCHASED CONTENT");
    assert.equal((await call("/api/partner/benefits/purchased-guide", memberCookie)).status, 200);
    // Exercise an exceptional refund through review, independent approval and execution.
    const refundSignup = await h.request("/api/partner/register", { method: "POST", body: { email: "refund@example.test", fullName: "Refund member", password: "refund-password-strong" } }); await h.json(refundSignup, 201); const refundCookie = h.cookie(refundSignup);
    const refundPartner = (action, body, method = "POST") => h.request(`/api/partner/${action}`, { cookie: refundCookie, body, method });
    await h.json(await refundPartner("verify", { code: h.inbox.get("refund@example.test") }));
    await h.json(await refundPartner("profile", { phone: "08012345678", accountNumber: "0012345678", location: "Awka", dob: "1990-01-01", occupation: "Farmer", nationality: "Nigerian" }, "PUT"));
    const refundQuote = (await h.json(await refundPartner("quote", { tierId: tier.id, promoCode: "ONLYOWNER" }))).quote;
    const refundCheckout = (await h.json(await refundPartner("checkout", { tierId: tier.id, promoCode: "ONLYOWNER", fingerprint: refundQuote.fingerprint, refundableFeeAccepted: true }), 201)).payment;
    assert.equal(refundCheckout.verificationFeeKobo, 10000); assert.doesNotMatch(JSON.stringify(refundCheckout), /tierSnapshot|PURCHASED CONTENT/);
    h.pay(refundCheckout.reference); await h.json(await refundPartner("confirm", { reference: refundCheckout.reference })); assert.equal(h.refundPosts, 1);
    const providerRefund = [...h.refunds.values()][0]; providerRefund.status = "failed";
    const paymentFile = path.join(h.directory, "partner-programme.json"); const programmeDisk = JSON.parse(await readFile(paymentFile, "utf8")); programmeDisk.items[0].payments.find((payment) => payment.reference === refundCheckout.reference).refundStatus = "failed"; await writeFile(paymentFile, JSON.stringify(programmeDisk));
    const refundReview = await post("finance", { action: "initiate", kind: "refund-retry", reference: refundCheckout.reference, amount: "999999", confirm: true, reason: "Review provider-confirmed failed verification refund" }); assert.equal(refundReview.amountKobo, 10000);
    assert.equal((await call("/api/admin/governance/finance", ownerCookie, { action: "initiate", kind: "refund-retry", reference: refundCheckout.reference, confirm: true, reason: "Duplicate refund request" })).status, 409);
    await post("finance", { action: "approve", id: refundReview.id, confirm: true, reason: "Independent failed-refund review" }, finance.cookie);
    assert.equal((await call("/api/admin/governance/finance", finance.cookie, { action: "execute", id: refundReview.id, confirm: true, reason: "Reviewer cannot execute refunds" })).status, 403);
    const retries = await Promise.all([1, 2].map(() => call("/api/admin/governance/finance", ownerCookie, { action: "execute", id: refundReview.id, confirm: true, reason: "Execute the approved refund retry" })));
    assert.ok(retries.every((response) => [200, 409].includes(response.status))); assert.equal(h.refundPosts, 2);
    await post("finance", { action: "execute", id: refundReview.id, confirm: true, reason: "Duplicate execution remains idempotent" }); assert.equal(h.refundPosts, 2);
    const refundView = await h.json(await call("/api/admin/governance/finance")); const refundTransaction = refundView.rows.find((payment) => payment.reference === refundCheckout.reference); assert.equal(refundTransaction.registrationFeeKobo, 0); assert.equal(refundTransaction.refundableVerificationFeeKobo, 10000); assert.equal(refundTransaction.refundStatus, "pending"); assert.equal(refundView.entries.find((entry) => entry.id === `${refundCheckout.reference}:verification`).amountKobo, 10000); assert.equal(refundView.entries.filter((entry) => entry.id === `${refundCheckout.reference}:verification`).length, 1);
    const adjustment = await post("finance", { action: "initiate", kind: "balance", clientId: first.id, amount: "125000.50", reference: "MANUAL-BALANCE-ONE", confirm: true, reason: "Verified opening balance reference" });
    assert.equal((await call("/api/admin/governance/finance", ownerCookie, { action: "approve", id: adjustment.id, confirm: true, reason: "Self approval attempt" })).status, 403);
    assert.equal((await call("/api/admin/governance/finance", agro.cookie, { action: "approve", id: adjustment.id, confirm: true, reason: "Unauthorized review" })).status, 403);
    await post("finance", { action: "approve", id: adjustment.id, confirm: true, reason: "Opening balance verified independently" }, finance.cookie);
    const executions = await Promise.all([1, 2].map(() => post("finance", { action: "execute", id: adjustment.id, confirm: true, reason: "Apply approved manual balance" })));
    assert.ok(executions.every((item) => item.state === "executed"));
    assert.equal((await h.json(await call("/api/admin/clients"))).clients.find((client) => client.id === first.id).balance, 125000.5);
    const withdrawal = await post("finance", { action: "initiate", kind: "withdrawal", clientId: first.id, withdrawalId: "request-one", reference: "WR-ONE", confirm: true, reason: "Verified supporting withdrawal request" }, agro.cookie);
    assert.equal((await call("/api/admin/governance/finance", agro.cookie, { action: "approve", id: withdrawal.id, confirm: true, reason: "Try own approval" })).status, 403);
    await post("finance", { action: "approve", id: withdrawal.id, confirm: true, reason: "Request independently reviewed" }, finance.cookie);
    assert.equal((await call("/api/admin/governance/finance", ownerCookie, { action: "execute", id: withdrawal.id, confirm: true, reason: "Try unsupported execution" })).status, 409);
    assert.equal((await h.json(await call("/api/admin/clients"))).clients.find((client) => client.id === first.id).withdrawals[0].status, "pending");
    assert.equal((await call("/api/admin/governance/finance", finance.cookie, { action: "execute", id: withdrawal.id, confirm: true, reason: "No execution permission" })).status, 403);
    const entry = { kind: "homepage", title: "Reviewed homepage introduction", body: "Prepared by an editor.", summary: "Metadata", slug: "about", href: "", assetId: "", status: "draft" };
    const draft = await post("content", entry, editor.cookie);
    assert.equal((await call("/api/admin/governance/content", editor.cookie, { ...draft, status: "published" })).status, 403);
    assert.doesNotMatch(await (await h.request("/")).text(), /Reviewed homepage introduction/);
    await post("content", { id: draft.id, action: "publish" }, publisher.cookie);
    assert.match(await (await h.request("/")).text(), /Reviewed homepage introduction/);
    assert.equal((await call("/api/admin/governance/content", editor.cookie, { ...draft, body: "Unapproved replacement" })).status, 403);
    await post("content", { id: draft.id, action: "unpublish" }, publisher.cookie);
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=", "base64");
    async function upload(clientId, cookie) { const form = new FormData(); form.set("title", clientId ? "Private supporting record" : "Public media preview"); form.set("file", new Blob([png], { type: "image/png" }), "image.png"); const response = await fetch(`${h.origin}/api/admin/governance/upload${clientId ? `?clientId=${clientId}` : ""}`, { method: "POST", headers: { Origin: h.origin, Cookie: cookie }, body: form }); return h.json(response); }
    const publicAsset = await upload(null, media.cookie);
    assert.equal((await h.request(`/api/managed-media/${publicAsset.id}`)).status, 404);
    const published = await post("content", { ...entry, slug: "announcement-one", kind: "announcement", status: "published", assetId: publicAsset.id }, media.cookie);
    assert.equal((await h.request(`/api/managed-media/${publicAsset.id}`)).status, 200);
    assert.equal((await call("/api/admin/governance/media", media.cookie, { id: publicAsset.id })).status, 409);
    await post("content", { ...published, status: "archived" }, media.cookie);
    assert.equal((await h.request(`/api/managed-media/${publicAsset.id}`)).status, 404);
    const privateAsset = await upload(first.id, agro.cookie);
    assert.equal((await h.request(`/api/managed-media/${privateAsset.id}`)).status, 404);
    assert.equal((await call(`/api/managed-media/${privateAsset.id}`, media.cookie)).status, 404);
    assert.equal((await call(`/api/managed-media/${privateAsset.id}`, agro.cookie)).status, 200);
    const secretAsset = await upload(second.id, ownerCookie);
    assert.equal((await call(`/api/managed-media/${secretAsset.id}`, agro.cookie)).status, 404);
    await post("client-records", { action: "note", clientId: first.id, kind: "verification", detail: "Supporting document checked", reference: "DOC-ONE" }, agro.cookie);
    const token = await h.json(await call(`/api/admin/clients/${first.id}/token`, agro.cookie, { action: "issue" })); assert.ok(token.token);
    const clientActivation = await h.request("/api/client/register", { method: "POST", body: { token: token.token, email: "client@example.test", password: "client-password-strong" } }); await h.json(clientActivation, 201); const clientCookie = h.cookie(clientActivation);
    await post("client-records", { action: "access", clientId: first.id, status: "suspended", confirm: true, reason: "Temporary access review" }, agro.cookie);
    assert.equal((await call("/api/client/session", clientCookie)).status, 401);
    const allUsers = await post("users", { ...media.user, status: "suspended", confirm: true, reason: "Department suspension test" }); assert.equal(allUsers.user.status, "suspended");
    assert.equal((await call("/api/admin/news", media.cookie)).status, 401);
    const revoked = await invite("revoked", ["media_admin"]);
    await post("users", { id: revoked.user.id, action: "revoke-sessions", confirm: true, reason: "Revoke active sessions test" });
    assert.equal((await call("/api/admin/news", revoked.cookie)).status, 401);
    const signout = await invite("signout", ["media_admin"]);
    await h.json(await call("/api/admin/session", signout.cookie, undefined, "DELETE"));
    assert.equal((await call("/api/admin/news", signout.cookie)).status, 401);
    const audit = await h.json(await call("/api/admin/governance/audit")); assert.ok(audit.total > 10);
    const disk = await readFile(path.join(h.directory, "audit.json"), "utf8");
    assert.doesNotMatch(disk, /0012345678|"passwordHash":"[a-f0-9]|"inviteHash":"[a-f0-9]/); assert.ok(!disk.includes(token.token));
    const allEvents = JSON.parse(disk).items; assert.equal(allEvents.filter((event) => event.action === "finance.balance.execute").length, 1);
    assert.ok(allEvents.some((event) => event.action === "access.denied"));
    assert.equal((await call("/api/admin/governance/audit", programme.cookie)).status, 403);
    const state = JSON.parse(await readFile(path.join(h.directory, "administration.json"), "utf8"));
    state.items[0].sessions.find((session) => session.adminId === allEvents.find((event) => event.action === "admin.bootstrap").actorId).authenticatedAt = Date.now() - 11 * 60000;
    await writeFile(path.join(h.directory, "administration.json"), JSON.stringify(state));
    assert.equal((await call("/api/admin/governance/settings", ownerCookie, { requireSecondApproval: false, reason: "Expired reauthentication rejected", confirm: true })).status, 403);
    await post("reauthenticate", { password: h.owner.password });
    assert.equal((await h.request("/api/admin/governance/settings", { cookie: ownerCookie, method: "POST", headers: { Origin: "https://wrong.test" }, body: { requireSecondApproval: true, reason: "CSRF attempt", confirm: true } })).status, 403);
    await h.restart(); assert.equal((await call("/api/admin/products", sales.cookie)).status, 200); assert.equal((await call("/api/admin/news", revoked.cookie)).status, 401);    const passwordChange = await call("/api/admin/governance/password", ownerCookie, { password: h.owner.password, newPassword: "rotated-owner-password-strong" }); await h.json(passwordChange); const rotatedCookie = h.cookie(passwordChange);
    assert.equal((await call("/api/admin/products", ownerCookie)).status, 401);
    assert.equal((await call("/api/admin/products", rotatedCookie)).status, 200);
    assert.equal((await h.request("/api/admin/session", { method: "POST", body: h.owner })).status, 401);
    assert.ok(await h.adminSession({ email: h.owner.email, password: "rotated-owner-password-strong" }));

  } finally { await h.close(); }
});
