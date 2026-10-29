// Run after npm run build. All accounts and records use an isolated temporary disk.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

test("verified token activation, private client records, profile security and withdrawal tracking", { timeout: 120000 }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dejadon-clients-test-"));
  const adminEmail = "client-admin@example.test";
  const adminPassword = randomBytes(24).toString("hex");
  const password = randomBytes(18).toString("hex");
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  let server, adminCookie;
  let output = "";
  let address = 0;
  async function start() {
    output = "";
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
      env: { ...process.env, ADMIN_EMAIL: adminEmail, ADMIN_PASSWORD: adminPassword, DEJADON_DATA_DIR: directory },
      stdio: ["ignore", "pipe", "pipe"]
    });
    server.stdout.on("data", (data) => { output += data; });
    server.stderr.on("data", (data) => { output += data; });
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
      try { if ((await fetch(`${origin}/api/client/session`)).status === 401) return; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Server did not start: ${output}`);
  }
  async function stop() {
    if (!server || server.exitCode !== null) return;
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill(); await stopped;
  }
  function request(url, { cookie, body, headers, ...options } = {}) {
    return fetch(`${origin}${url}`, {
      ...options, redirect: "manual",
      headers: { Origin: origin, "X-Forwarded-For": `192.0.2.${++address}`, ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  }
  async function json(response, status = 200) {
    const result = await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result;
  }
  function sessionCookie(response) {
    const value = response.headers.get("set-cookie");
    assert.match(value, /HttpOnly/i); assert.match(value, /Secure/i); assert.match(value, /SameSite=Lax/i);
    return value.split(";")[0];
  }
  const admin = (url, options = {}) => request(url, { ...options, cookie: adminCookie });
  const activate = (token, email = "client-one@gmail.com", extra = {}) => request("/api/client/register", { method: "POST", body: { token, email, password }, ...extra });
  const issue = async (id, action = "issue") => json(await admin(`/api/admin/clients/${id}/token`, { method: "POST", body: { action } }));
  const create = async (overrides = {}) => (await json(await admin("/api/admin/clients", { method: "POST", body: { fullName: "Verified Client One", email: "client-one@gmail.com", verified: true, ...overrides } }), 201)).client;
  const update = async (record, overrides) => (await json(await admin(`/api/admin/clients/${record.id}`, { method: "PUT", body: { ...record, ...overrides } }))).client;
  const signin = (email, suppliedPassword = password) => request("/api/client/session", { method: "POST", body: { email, password: suppliedPassword } });
  const profile = (cookie, body, headers) => request("/api/client/profile", { method: "PUT", cookie, body, headers });
  function noSecrets(value) {
    assert.doesNotMatch(JSON.stringify(value), /passwordHash|passwordSalt|tokenHash|"sessions"/);
  }
  try {
    await start();
    assert.equal((await request("/api/admin/clients")).status, 401);
    assert.equal((await request("/api/admin/clients", { method: "POST", body: { fullName: "Bypass" } })).status, 401);
    assert.match(await (await request("/admin/clients")).text(), /Welcome back/);
    assert.equal((await request("/dashboard/client")).status, 307);
    assert.match((await request("/dashboard/client/profile")).headers.get("location"), /login\?role=client/);
    assert.equal((await request("/api/client/session", { cookie: "dejadon-client=forged" })).status, 401);
    const adminSession = await request("/api/admin/session", { method: "POST", body: { email: adminEmail, password: adminPassword } });
    await json(adminSession); adminCookie = sessionCookie(adminSession);
    assert.equal((await admin("/api/admin/clients", { method: "POST", body: { fullName: "Bad origin" }, headers: { Origin: "https://another-site.test" } })).status, 403);
    assert.equal((await admin("/api/admin/clients", { method: "POST", body: { fullName: "Bad data", actualDate: "2026-02-30" } })).status, 400);
    assert.equal((await admin("/api/admin/clients", { method: "POST", body: { fullName: "Bad data", investmentProgress: 101 } })).status, 400);
    assert.equal((await admin("/api/admin/clients", { method: "POST", body: { fullName: "Bad data", balance: -1 } })).status, 400);
    let first = await create({ verified: false });
    const adminOverview = await (await admin("/admin")).text();
    assert.match(adminOverview, /Manage clients/); assert.match(adminOverview, /Saved client records/);
    assert.equal((await admin(`/api/admin/clients/${first.id}/token`, { method: "POST", body: { action: "issue" } })).status, 400);
    first = await update(first, {
      verified: true, propertyName: "Palm Grove", propertyLocation: "Achalla, Anambra, Nigeria", propertyReference: "DJ-PLOT-42",
      investmentName: "Managed Palm Plan", investmentDetails: "Cultivation and maintenance details.", investmentProgress: 35,
      actualDateLabel: "Allocation confirmed", actualDate: "2026-10-25", balance: "125000.50",
      processes: [{ title: "Land allocation", detail: "Your plot has been assigned.", status: "completed" }, { title: "Survey", detail: "Survey is underway.", status: "processing" }],
      withdrawals: ["pending", "processing", "successful"].map((status, index) => ({ amount: 1000 + index, date: "2026-10-26", status, reference: `REQ-${index}`, note: `${status} request` }))
    });
    assert.equal(first.balance, 125000.5); noSecrets(first);
    const oldToken = (await issue(first.id)).token;
    const issued = await issue(first.id);
    assert.match(issued.token, /^DJ-[A-F0-9]{48}$/);
    assert.equal(issued.client.tokenStatus, "issued");
    assert.ok(Date.parse(issued.client.tokenExpiresAt) - Date.now() > 6.99 * 86400000);
    assert.equal((await activate(oldToken)).status, 400, "replacement invalidates the previous token");
    assert.equal((await activate(issued.token, "different@gmail.com")).status, 400, "token bound to verified email");
    assert.equal((await activate(issued.token, undefined, { headers: { Origin: "https://another-site.test" } })).status, 403);
    assert.equal((await request("/api/client/register", { method: "POST", body: { email: "client-one@gmail.com", password } })).status, 400);
    const activation = await activate(` ${issued.token.toLowerCase()} `);
    const clientCookie = sessionCookie(activation);
    const active = (await json(activation, 201)).client;
    noSecrets(active); assert.equal(active.fullName, first.fullName);
    assert.equal((await activate(issued.token)).status, 400, "token is single-use");
    assert.equal((await admin(`/api/admin/clients/${first.id}/token`, { method: "POST", body: { action: "issue" } })).status, 400);
    const saved = await readFile(path.join(directory, "clients.json"), "utf8");
    assert.ok(!saved.includes(password) && !saved.includes(issued.token) && !saved.includes(clientCookie.split("=")[1]));
    assert.match(saved, /passwordHash/);
    const adminList = await json(await admin("/api/admin/clients")); noSecrets(adminList);
    assert.ok(!JSON.stringify(adminList).includes(issued.token));
    assert.match(await (await admin("/admin/clients")).text(), /Palm Grove/);
    assert.equal((await request("/api/admin/clients", { cookie: clientCookie })).status, 401);
    const dashboard = await (await request("/dashboard/client", { cookie: clientCookie })).text();
    for (const text of ["Palm Grove", "Achalla", "Managed Palm Plan", "35", "Allocation confirmed", "25 Oct 2026", "125,000.50", "Pending", "Processing", "Successful"]) assert.ok(dashboard.includes(text), text);
    assert.doesNotMatch(dashboard, /Referral tools|referral-link|Copy link/);
    const profilePage = await (await request("/dashboard/client/profile", { cookie: clientCookie })).text();
    assert.doesNotMatch(profilePage, /Referral tools|referral-link|Copy link/);
    assert.equal((await profile(clientCookie, { email: first.email, phone: "123" }, { Origin: "https://another-site.test" })).status, 403);
    assert.equal((await profile(clientCookie, { email: "changed@gmail.com", phone: "123" })).status, 400);
    assert.equal((await profile(clientCookie, { email: first.email, phone: "123", newPassword: "new-valid-password" })).status, 400);
    const edited = (await json(await profile(clientCookie, { email: first.email, phone: "08012345678", fullName: "Spoofed", balance: 999, verified: false, propertyLocation: "Spoofed", withdrawals: [] }))).client;
    assert.equal(edited.phone, "08012345678"); assert.equal(edited.balance, first.balance); assert.equal(edited.fullName, first.fullName);
    assert.equal(edited.propertyLocation, first.propertyLocation); assert.equal(edited.withdrawals.length, 3); assert.equal(edited.verified, true);
    assert.equal((await signin(first.email, "wrong-password")).status, 401);
    const secondSession = await signin(first.email); await json(secondSession); const otherCookie = sessionCookie(secondSession);
    const passwordChange = await profile(clientCookie, { email: "changed@gmail.com", phone: edited.phone, currentPassword: password, newPassword: "new-valid-password" });
    await json(passwordChange); const updatedCookie = sessionCookie(passwordChange);
    assert.notEqual(updatedCookie, clientCookie);
    assert.equal((await request("/api/client/session", { cookie: clientCookie })).status, 401);
    assert.equal((await request("/api/client/session", { cookie: otherCookie })).status, 401);
    assert.equal((await signin(first.email)).status, 401);
    assert.equal((await signin("changed@gmail.com", password)).status, 401);
    await json(await signin("changed@gmail.com", "new-valid-password"));
    const second = await create({ fullName: "Private Client Two", email: "", propertyLocation: "Private second location", balance: 88 });
    const secondToken = (await issue(second.id)).token;
    const races = await Promise.all([1, 2].map(() => activate(secondToken, "client-two@gmail.com")));
    assert.deepEqual(races.map((response) => response.status).sort(), [201, 400], "only one simultaneous token use succeeds");
    const secondCookie = sessionCookie(races.find((response) => response.status === 201));
    const own = (await json(await request(`/api/client/session?id=${first.id}`, { cookie: secondCookie }))).client;
    assert.equal(own.id, second.id); assert.equal(own.balance, 88); noSecrets(own);
    const ownHtml = await (await request("/dashboard/client", { cookie: secondCookie })).text();
    assert.doesNotMatch(ownHtml, /Palm Grove|125,000.50|Allocation confirmed|changed@gmail.com/);
    first = (await json(await admin("/api/admin/clients"))).clients.find((item) => item.id === first.id);
    first = await update(first, { investmentProgress: 80, withdrawals: first.withdrawals.map((item) => ({ ...item, status: "successful" })) });
    const refreshed = (await json(await request("/api/client/session", { cookie: updatedCookie }))).client;
    assert.equal(refreshed.investmentProgress, 80); assert.ok(refreshed.withdrawals.every((item) => item.status === "successful"));
    assert.equal((await admin(`/api/admin/clients/${first.id}`, { method: "PUT", body: { ...first, email: "admin-change@gmail.com" } })).status, 400);
    const third = await create({ fullName: "Client Three", email: "third@gmail.com" });
    const revoked = (await issue(third.id)).token; await issue(third.id, "revoke");
    assert.equal((await activate(revoked, third.email)).status, 400);
    const expired = (await issue(third.id)).token;
    const disk = JSON.parse(await readFile(path.join(directory, "clients.json"), "utf8"));
    disk.items.find((item) => item.id === third.id).tokenExpiresAt = new Date(Date.now() - 1000).toISOString();
    await writeFile(path.join(directory, "clients.json"), JSON.stringify(disk));
    assert.equal((await activate(expired, third.email)).status, 400);
    assert.equal((await json(await admin("/api/admin/clients"))).clients.find((item) => item.id === third.id).tokenStatus, "expired");
    await stop(); await start();
    assert.equal((await request("/api/client/session", { cookie: updatedCookie })).status, 200, "account and session survive server restart");
    first = await update(first, { verified: false });
    assert.equal((await request("/api/client/session", { cookie: updatedCookie })).status, 401, "removing verification revokes sessions");
    assert.equal((await signin("changed@gmail.com", "new-valid-password")).status, 401);
    await update(first, { verified: true });
    const restored = await signin("changed@gmail.com", "new-valid-password"); await json(restored); const restoredCookie = sessionCookie(restored);
    assert.equal((await request("/api/client/session", { method: "DELETE", cookie: restoredCookie, headers: { Origin: "https://another-site.test" } })).status, 403);
    const logout = await request("/api/client/session", { method: "DELETE", cookie: restoredCookie }); await json(logout);
    assert.match(logout.headers.get("set-cookie"), /Max-Age=0/i);
    assert.equal((await request("/api/client/session", { cookie: restoredCookie })).status, 401);
    for (let index = 0; index < 15; index++) assert.equal((await activate("invalid-token", undefined, { headers: { "X-Forwarded-For": "198.51.100.1" } })).status, 400);
    assert.equal((await activate("invalid-token", undefined, { headers: { "X-Forwarded-For": "198.51.100.1" } })).status, 429);
  } finally {
    await stop(); await rm(directory, { recursive: true, force: true });
  }
});
