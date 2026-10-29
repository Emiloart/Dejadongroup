const assert = require("node:assert/strict");
const fs = require("node:fs");
const { mkdtemp, rm, readFile } = require("node:fs/promises");
const os = require("node:os"); const path = require("node:path"); const Module = require("node:module");
const { test } = require("node:test"); const ts = require("typescript");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) { return resolve.call(this, name.startsWith("@/") ? path.join(process.cwd(), "src", name.slice(2)) : name, ...args); };
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
const store = require("../src/lib/partner-store.ts");
const payments = require("../src/lib/partner-payments.ts");
const services = require("../src/lib/partner-services.ts");

test("partner stages, tier entitlements, promo restrictions, concurrent payments, refunds and upgrades", { timeout: 120000 }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dejadon-partner-unit-"));
  const previous = { ...process.env }; const originalFetch = global.fetch;
  Object.assign(process.env, { DEJADON_DATA_DIR: directory, RESEND_API_KEY: "re_unit-secret-never-live", RESEND_FROM: "test@example.test", PAYSTACK_SECRET_KEY: "sk_test_unit-only-never-live", APP_BASE_URL: "https://example.test" });
  const inbox = new Map(); const transactions = new Map(); const refunds = new Map(); let nextId = 1; let refundPosts = 0; let failRefundAfterCommit = false;
  const json = (data) => new Response(JSON.stringify({ status: true, data }), { headers: { "Content-Type": "application/json" } });
  global.fetch = async (url, options = {}) => {
    const target = new URL(String(url)); const body = options.body ? JSON.parse(options.body) : null;
    if (target.hostname === "api.resend.com") { assert.equal(target.pathname, "/emails"); assert.match(options.headers["Idempotency-Key"], /^partner-verification\//); inbox.set(body.to[0], body.text.match(/\b\d{6}\b/)[0]); return json({ id: "email-test" }); }
    assert.equal(target.hostname, "api.paystack.co"); assert.match(options.headers.Authorization, /^Bearer sk_test_/);
    if (target.pathname === "/test-large-id") return new Response('{"status":true,"data":{"id":18446744073709551615}}');
    if (target.pathname === "/transaction/initialize") {
      assert.equal(body.currency, "NGN"); assert.equal(body.callback_url, "https://example.test/partner-programme/payment");
      transactions.set(body.reference, { id: nextId++, reference: body.reference, amount: body.amount, currency: "NGN", domain: "test", status: "pending", customer: { email: body.email }, paid_at: new Date().toISOString() });
      return json({ authorization_url: `https://checkout.paystack.com/${body.reference}`, reference: body.reference });
    }
    if (target.pathname.startsWith("/transaction/verify/")) return json(transactions.get(decodeURIComponent(target.pathname.split("/").pop())));
    if (target.pathname === "/refund" && !body) return json([...refunds.values()].filter((item) => String(item.transaction) === target.searchParams.get("transaction")));
    if (target.pathname === "/refund" && body) {
      refundPosts++; const refund = { id: nextId++, transaction: body.transaction, amount: body.amount, currency: "NGN", status: "pending", merchant_note: body.merchant_note };
      refunds.set(String(refund.id), refund);
      if (failRefundAfterCommit) { failRefundAfterCommit = false; throw new Error("Response lost after refund was created"); }
      return json(refund);
    }
    if (target.pathname.startsWith("/refund/")) return json(refunds.get(target.pathname.split("/").pop()));
    throw new Error(`Unexpected request ${url}`);
  };
  const password = "test-password-at-least-ten";
  const details = { phone: "08012345678", accountNumber: "0012345678", location: "Awka", dob: "1995-05-15", occupation: "Farmer", nationality: "Nigerian" };
  async function register(email, ref) { return store.registerPartner({ email, fullName: "Test Partner", password, ref }); }
  async function ready(email, ref) { const result = await register(email, ref); await store.verifyPartnerOtp(result.token, { code: inbox.get(email) }); await store.savePartnerProfile(result.token, details); return result; }
  const promoInput = (tierId, overrides = {}) => ({ code: "WELCOME", type: "percent", value: "100", tierIds: [tierId], active: true, maxUses: 10, perPartnerLimit: 1, eligibleEmails: [], ...overrides });
  async function checkout(token, tierId, promoCode = "", extras = {}) { const quote = await store.getPartnerQuote(token, { tierId, promoCode }); return payments.createPartnerCheckout(token, { tierId, promoCode, fingerprint: quote.fingerprint, refundableFeeAccepted: true, ...extras }); }
  function paid(payment, overrides = {}) { Object.assign(transactions.get(payment.reference), { status: "success", ...overrides }); }
  function noSecrets(value) { assert.doesNotMatch(JSON.stringify(value), /passwordHash|passwordSalt|otpHash|"sessions"|aliases/); }
  try {
    const starter = await store.savePartnerTier({ name: "Starter", rank: 1, fee: "1000", active: true, benefits: [{ id: "starter-benefit", title: "Starter guide", summary: "Public starter summary", content: "STARTER PRIVATE CONTENT" }] });
    let higher = await store.savePartnerTier({ name: "Premium", rank: 2, fee: "2500", active: true, benefits: [{ id: "premium-benefit", title: "Premium guide", summary: "Public premium summary", content: "PREMIUM PRIVATE CONTENT" }] });
    assert.doesNotMatch(JSON.stringify(await store.getPublicPartnerTiers()), /PRIVATE CONTENT|"content"/);
    const account = await register("partner-one@gmail.com"); assert.equal(account.verificationSent, true); noSecrets(account.partner);
    assert.equal((await store.getPartnerView(account.token)).active, false);
    await assert.rejects(store.savePartnerProfile(account.token, details), /Verify your email/);
    await assert.rejects(store.getPartnerQuote(account.token, { tierId: starter.id }), /Verify your email/);
    await assert.rejects(store.getPartnerBenefit(account.token, "starter-benefit"), /Complete registration/);
    const actualOtp = inbox.get(account.partner.email); const wrong = actualOtp === "000000" ? "111111" : "000000";
    for (let n = 0; n < 5; n++) await assert.rejects(store.verifyPartnerOtp(account.token, { code: wrong }), /incorrect/);
    await assert.rejects(store.verifyPartnerOtp(account.token, { code: actualOtp }), /attempt limit/);
    await assert.rejects(store.resendPartnerOtp(account.token), /60 seconds/);
    await store.mutateProgramme((state) => { state.partners[0].otpSentAt -= 61000; });
    await store.resendPartnerOtp(account.token); await store.verifyPartnerOtp(account.token, { code: inbox.get(account.partner.email) });
    await assert.rejects(store.getPartnerQuote(account.token, { tierId: starter.id }), /personal details/);
    await assert.rejects(store.savePartnerProfile(account.token, { ...details, dob: "2030-01-01" }), /date of birth/);
    await store.savePartnerProfile(account.token, { ...details, currentTierId: higher.id, registeredAt: new Date().toISOString() });
    assert.equal((await store.getPartnerView(account.token)).partner.currentTierId, null);
    const promo = await store.savePartnerPromo(promoInput(starter.id));
    await assert.rejects(store.getPartnerQuote(account.token, { tierId: higher.id, promoCode: "WELCOME" }), /not eligible/);
    const quote = await store.getPartnerQuote(account.token, { tierId: starter.id, promoCode: "welcome" });
    assert.equal(quote.baseKobo, 100000); assert.equal(quote.discountKobo, 100000); assert.equal(quote.amountKobo, 10000); assert.equal(quote.verificationFeeKobo, 10000);
    await assert.rejects(payments.createPartnerCheckout(account.token, { tierId: starter.id, promoCode: "WELCOME", fingerprint: quote.fingerprint }), /Acknowledge/);
    await assert.rejects(payments.createPartnerCheckout(account.token, { tierId: starter.id, fingerprint: "forged" }), /updated quote/);
    const payment = await checkout(account.token, starter.id, "WELCOME");
    await assert.rejects(checkout(account.token, starter.id), /current checkout/);
    assert.equal((await payments.confirmPartnerPayment(payment.reference)).status, "pending");
    assert.equal((await store.getPartnerView(account.token)).active, false);
    paid(payment);
    const confirmed = await Promise.all([1, 2, 3].map(() => payments.confirmPartnerPayment(payment.reference)));
    assert.ok(confirmed.every((item) => item.status === "paid")); assert.equal(refundPosts, 1);
    let view = await store.getPartnerView(account.token); noSecrets(view); assert.equal(view.currentTier.id, starter.id); assert.equal(view.active, true);
    assert.equal((await store.getPartnerBenefit(account.token, "starter-benefit")).content, "STARTER PRIVATE CONTENT");
    await assert.rejects(store.getPartnerBenefit(account.token, "premium-benefit"), /not included/);
    assert.equal((await store.getAdminPartnerProgramme()).promos[0].uses, 1);
    assert.equal(view.payments[0].refundStatus, "pending");
    [...refunds.values()][0].status = "processed"; await payments.processPartnerRefund(payment.reference);
    assert.equal((await store.getPartnerView(account.token)).payments[0].refundStatus, "processed"); assert.equal(refundPosts, 1);
    await assert.rejects(store.getPartnerQuote(account.token, { tierId: higher.id, promoCode: "WELCOME" }), /initial registration only/);
    let upgradeQuote = await store.getPartnerQuote(account.token, { tierId: higher.id }); assert.equal(upgradeQuote.amountKobo, 150000);
    higher = await store.savePartnerTier({ id: higher.id, name: "Premium", rank: 2, fee: "3000", active: true, benefits: higher.benefits }, higher.id);
    await assert.rejects(payments.createPartnerCheckout(account.token, { tierId: higher.id, fingerprint: upgradeQuote.fingerprint }), /updated quote/);
    const upgrade = await checkout(account.token, higher.id); assert.equal(upgrade.amountKobo, 200000);
    assert.equal((await store.getPartnerView(account.token)).currentTier.id, starter.id, "current tier remains until payment confirmation");
    await assert.rejects(store.getPartnerBenefit(account.token, "premium-benefit"), /not included/);
    paid(upgrade); await payments.confirmPartnerPayment(upgrade.reference);
    assert.equal((await store.getPartnerView(account.token)).currentTier.id, higher.id);
    assert.equal((await store.getPartnerBenefit(account.token, "premium-benefit")).content, "PREMIUM PRIVATE CONTENT");
    process.env.PAYSTACK_SECRET_KEY = "sk_live_mode-isolation-test";
    assert.equal((await store.getPartnerView(account.token)).active, false, "test payments never activate live memberships");
    process.env.PAYSTACK_SECRET_KEY = "sk_test_unit-only-never-live";
    await assert.rejects(store.getPartnerQuote(account.token, { tierId: starter.id }), /higher tier/);
    const referral = (await store.getPartnerView(account.token)).partner.username;
    const second = await ready("second@gmail.com", referral);
    assert.equal((await store.getPartnerView(account.token)).network.introduced, 1);
    await assert.rejects(payments.verifyOwnPartnerPayment(second.token, payment.reference), /not found/);
    const restricted = await store.savePartnerPromo(promoInput(starter.id, { code: "RESTRICT", maxUses: 1, eligibleEmails: ["specific@gmail.com"] }));
    await assert.rejects(store.getPartnerQuote(second.token, { tierId: starter.id, promoCode: restricted.code }), /not available/);
    const limited = await store.savePartnerPromo(promoInput(starter.id, { code: "LIMITONE", maxUses: 1 }));
    const third = await ready("third@gmail.com");
    const quotes = await Promise.all([second, third].map((item) => store.getPartnerQuote(item.token, { tierId: starter.id, promoCode: limited.code })));
    const reservations = await Promise.allSettled([second, third].map((item, index) => payments.createPartnerCheckout(item.token, { tierId: starter.id, promoCode: limited.code, fingerprint: quotes[index].fingerprint, refundableFeeAccepted: true })));
    assert.equal(reservations.filter((item) => item.status === "fulfilled").length, 1, "last promo use can only be reserved once");
    const held = reservations.find((item) => item.status === "fulfilled").value;
    const holder = held.partnerId === second.partner.id ? second : third;
    await payments.cancelPartnerCheckout(holder.token, held.reference);
    paid(held); await payments.confirmPartnerPayment(held.reference);
    assert.equal((await store.getPartnerView(holder.token)).active, false, "cancelled checkout never grants a tier");
    assert.equal((await store.getPartnerView(holder.token)).payments[0].refundKobo, 10000);
    const tampered = await checkout(holder.token, starter.id); paid(tampered, { amount: 1 });
    await payments.confirmPartnerPayment(tampered.reference); assert.equal((await store.getPartnerView(holder.token)).active, false);
    assert.equal((await store.getPartnerView(holder.token)).payments[0].status, "rejected");
    const timeoutPayment = await checkout(holder.token, starter.id, "WELCOME"); paid(timeoutPayment); failRefundAfterCommit = true;
    await payments.confirmPartnerPayment(timeoutPayment.reference); const beforeRetry = refundPosts;
    assert.equal((await store.getPartnerView(holder.token)).payments[0].refundStatus, "uncertain");
    await payments.processPartnerRefund(timeoutPayment.reference, true); assert.equal(refundPosts, beforeRetry, "lost refund response is reconciled without another refund");
    assert.equal((await store.getPartnerView(holder.token)).payments[0].refundStatus, "pending");
    const pendingRefund = [...refunds.values()].find((item) => String(item.transaction) === (transactions.get(timeoutPayment.reference).id).toString());
    pendingRefund.status = "failed"; await payments.processPartnerRefund(timeoutPayment.reference);
    assert.equal((await store.getPartnerView(holder.token)).payments[0].refundStatus, "failed");
    await payments.processPartnerRefund(timeoutPayment.reference, true); assert.equal(refundPosts, beforeRetry + 1, "a confirmed failed refund can be safely retried");
    const fixed = await store.savePartnerPromo(promoInput(starter.id, { code: "FIXED", type: "fixed", value: "250.25" }));
    const unused = holder === second ? third : second;
    assert.equal((await store.getPartnerQuote(unused.token, { tierId: starter.id, promoCode: fixed.code })).amountKobo, 74975);
    await store.savePartnerPromo({ ...promoInput(starter.id, { code: "FIXED", type: "fixed", value: "250.25", active: false }) }, fixed.id);
    await assert.rejects(store.getPartnerQuote(unused.token, { tierId: starter.id, promoCode: fixed.code }), /inactive/);
    const expired = await store.savePartnerPromo(promoInput(starter.id, { code: "EXPIRED", endsAt: "2000-01-01T00:00:00Z" }));
    await assert.rejects(store.getPartnerQuote(unused.token, { tierId: starter.id, promoCode: expired.code }), /expired/);
    const otherSession = await store.signInPartner({ email: account.partner.email, password });
    await assert.rejects(store.savePartnerProfile(account.token, { ...details, newPassword: "new-test-password" }), /current password/);
    const changed = await store.savePartnerProfile(account.token, { ...details, username: "new_partner_name", currentPassword: password, newPassword: "new-test-password" });
    assert.ok(changed.token); assert.equal(await store.getPartnerView(account.token), null); assert.equal(await store.getPartnerView(otherSession.token), null);
    assert.ok(await store.getPartnerView(changed.token)); await store.signOutPartner(changed.token); assert.equal(await store.getPartnerView(changed.token), null);
    const disk = await readFile(path.join(directory, "partner-programme.json"), "utf8");
    assert.ok(!disk.includes(password) && !disk.includes(account.token)); assert.ok(!disk.includes('"otpHash": "'+actualOtp+'"'));
    assert.equal(services.validPaystackSignature(Buffer.from("{}"), "forged"), false);
    assert.equal((await services.paystack("/test-large-id")).id, "18446744073709551615");
  } finally {
    global.fetch = originalFetch;
    for (const key of ["DEJADON_DATA_DIR", "RESEND_API_KEY", "RESEND_FROM", "PAYSTACK_SECRET_KEY", "APP_BASE_URL"]) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
    await rm(directory, { recursive: true, force: true });
  }
});
