import { migrateAdministration } from "@/lib/admin-migrations";
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { readCollection, storageTransaction, updateCollection } from "@/lib/site-storage";
import { appendAudit } from "@/lib/admin-audit";
import { effectivePermissions, permissions, rolePermissions, type AdminPrincipal, type DepartmentRole, type Permission, type ResourceScope } from "@/lib/admin-permissions";
export class AdminError extends Error { constructor(message: string, public status = 400) { super(message); } }
export type AdminUser = { id: string; name: string; email: string; roles: DepartmentRole[]; grants: Permission[]; denied: Permission[]; scope: ResourceScope; status: "invited" | "active" | "suspended" | "deactivated"; passwordHash: string | null; passwordSalt: string | null; inviteHash: string | null; inviteExpires: number; createdAt: string; updatedAt: string };
type Session = { id: string; adminId: string; hash: string; expiresAt: number; authenticatedAt: number };
type State = { version: 2; users: AdminUser[]; sessions: Session[]; requireSecondApproval: boolean; bootstrapped: boolean };
const empty = (): State => ({ version: 2, users: [], sessions: [], requireSecondApproval: true, bootstrapped: false });
export const adminSessionSeconds = 8 * 60 * 60;
export const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");
export const readAdministration = async () => (await readCollection<State>("administration"))[0] || empty();
export const mutateAdministration = <T>(operation: (state: State) => T | Promise<T>) => updateCollection<State, T>("administration", async (items) => { const state = items[0] || empty(); const result = await operation(state); return { items: [state], result }; });
function derive(password: string, salt: string): Promise<string> { return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 65536, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key.toString("hex")))); }
const passwordValue = (value: unknown) => { if (typeof value !== "string" || value.length < 12 || value.length > 128) throw new AdminError("Use a password with 12–128 characters."); return value; };
export function bootstrapConfigured() { return Boolean((process.env.SUPER_ADMIN_EMAIL && (process.env.SUPER_ADMIN_PASSWORD?.length || 0) >= 12) || (!process.env.SUPER_ADMIN_EMAIL && !process.env.SUPER_ADMIN_PASSWORD && process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD?.length || 0) >= 12)); }
export async function ensureAdminBootstrap() {
  if ((await readAdministration()).bootstrapped || !bootstrapConfigured()) return;
  const explicit = Boolean(process.env.SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_PASSWORD);
  const email = (explicit ? process.env.SUPER_ADMIN_EMAIL! : process.env.ADMIN_EMAIL!).trim().toLowerCase();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = await derive(passwordValue(explicit ? process.env.SUPER_ADMIN_PASSWORD : process.env.ADMIN_PASSWORD), salt);
  const staffEmail = explicit ? process.env.ADMIN_EMAIL?.trim().toLowerCase() : null;
  const staffSalt = randomBytes(16).toString("hex");
  const staffHash = staffEmail && staffEmail !== email && (process.env.ADMIN_PASSWORD?.length || 0) >= 12 ? await derive(passwordValue(process.env.ADMIN_PASSWORD), staffSalt) : null;
  await storageTransaction(async () => {
    await mutateAdministration(async (state) => {
      if (state.bootstrapped) return;
      const now = new Date().toISOString();
      const make = (address: string, name: string, roles: DepartmentRole[], salt: string, hash: string): AdminUser => ({ id: randomUUID(), email: address, name, roles, grants: [], denied: [], scope: { clients: "all", partners: "all" }, status: "active", passwordSalt: salt, passwordHash: hash, inviteHash: null, inviteExpires: 0, createdAt: now, updatedAt: now });
      const owner = make(email, "Platform owner", ["super_admin"], salt, passwordHash);
      state.users.push(owner);
      if (staffHash && staffEmail) state.users.push(make(staffEmail, "Publishing administrator", ["media_admin", "marketplace_admin"], staffSalt, staffHash));
      state.bootstrapped = true;
      await appendAudit({ actorId: owner.id, action: "admin.bootstrap", resource: "admin", resourceId: owner.id, after: { roles: owner.roles }, reason: "One-time environment-controlled bootstrap" });
    });
  });
}
export async function authenticateAdmin(email: string, password: string) {
  await migrateAdministration();
  await ensureAdminBootstrap();
  const state = await readAdministration(); const found = state.users.find((user) => user.email === email.trim().toLowerCase());
  const candidate = await derive(password.slice(0, 128), found?.passwordSalt || "dejadon-admin-signin");
  const valid = Boolean(found?.passwordHash && timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(found.passwordHash, "hex")) && found.status === "active");
  if (!found || !valid) { await appendAudit({ actorId: found?.id || "anonymous", action: "admin.signin", resource: "admin", resourceId: found?.id || "unknown", outcome: "denied" }); throw new AdminError("The email or password is incorrect.", 401); }
  return mutateAdministration(async (current) => {
    const user = current.users.find((user) => user.id === found.id);
    if (!user || user.status !== "active" || user.passwordHash !== found.passwordHash) throw new AdminError("Sign in again.", 401);
    const token = randomBytes(32).toString("base64url"); const now = Date.now();
    current.sessions = current.sessions.filter((session) => session.expiresAt > now);
    current.sessions.push({ id: randomUUID(), adminId: user.id, hash: tokenHash(token), expiresAt: now + adminSessionSeconds * 1000, authenticatedAt: now });
    await appendAudit({ actorId: user.id, action: "admin.signin", resource: "admin", resourceId: user.id });
    return token;
  });
}
export async function resolveAdmin(token: string | undefined): Promise<AdminPrincipal | null> {
  if (!token || token.length > 100) return null;
  const state = await readAdministration(); const session = state.sessions.find((session) => session.hash === tokenHash(token) && session.expiresAt > Date.now());
  const user = session && state.users.find((user) => user.id === session.adminId && user.status === "active");
  return user && session ? { id: user.id, email: user.email, name: user.name, roles: user.roles, permissions: effectivePermissions(user.roles, user.grants, user.denied), scope: user.scope, sessionId: session.id, authenticatedAt: session.authenticatedAt } : null;
}
/** Recheck persisted identity inside an external operation's durable claim transaction. */
export async function refreshActiveAdmin(admin: AdminPrincipal): Promise<AdminPrincipal> {
  const state = await readAdministration();
  const session = state.sessions.find((session) => session.id === admin.sessionId && session.adminId === admin.id && session.expiresAt > Date.now());
  const user = session && state.users.find((user) => user.id === admin.id && user.status === "active");
  if (!user || !session) throw new AdminError("Your access changed. Sign in again.", 403);
  return { id: user.id, email: user.email, name: user.name, roles: user.roles, permissions: effectivePermissions(user.roles, user.grants, user.denied), scope: user.scope, sessionId: session.id, authenticatedAt: session.authenticatedAt };
}
export async function revokeAdminSession(token: string | undefined) { if (token) await mutateAdministration(async (state) => { const session = state.sessions.find((session) => session.hash === tokenHash(token)); state.sessions = state.sessions.filter((session) => session.hash !== tokenHash(token)); if (session) await appendAudit({ actorId: session.adminId, action: "admin.signout", resource: "admin", resourceId: session.adminId }); }); }
export async function reauthenticateAdmin(admin: AdminPrincipal, password: unknown) {
  const state = await readAdministration(); const user = state.users.find((user) => user.id === admin.id);
  const candidate = await derive(typeof password === "string" ? password.slice(0, 128) : "", user?.passwordSalt || "invalid");
  if (!user?.passwordHash || !timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(user.passwordHash, "hex"))) throw new AdminError("Enter your current administrator password.", 403);
  await mutateAdministration((state) => { const session = state.sessions.find((session) => session.id === admin.sessionId); if (!session) throw new AdminError("Sign in again.", 401); session.authenticatedAt = Date.now(); });
}
export const safeAdminUser = (user: AdminUser) => { const { passwordHash: _passwordHash, passwordSalt: _salt, inviteHash: _invite, inviteExpires: _expires, ...safe } = user; return safe; };
export async function manageAdmin(actor: AdminPrincipal, input: Record<string, unknown>) {
  if (!actor.roles.includes("super_admin")) throw new AdminError("Super Admin access is required.", 403);
  if (input.confirm !== true || typeof input.reason !== "string" || input.reason.trim().length < 5) throw new AdminError("Confirm this change and enter a reason.");
  const id = typeof input.id === "string" ? input.id : undefined;
  return mutateAdministration(async (state) => {
    const current = id ? state.users.find((user) => user.id === id) : undefined;
    if (id && !current) throw new AdminError("Administrator not found.", 404);
    if (input.action === "revoke-sessions") { state.sessions = state.sessions.filter((session) => session.adminId !== id); await appendAudit({ action: "admin.sessions.revoked", resource: "admin", resourceId: id!, reason: input.reason as string }); return { user: safeAdminUser(current!) }; }
    const email = String(input.email || current?.email || "").trim().toLowerCase(); const name = String(input.name || current?.name || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !name || name.length > 120) throw new AdminError("Enter a valid name and email.");
    if (state.users.some((user) => user.email === email && user.id !== id)) throw new AdminError("This email already belongs to an administrator.", 409);
    const roles = input.roles as DepartmentRole[]; const grants = (input.grants || []) as Permission[]; const denied = (input.denied || []) as Permission[];
    if (!Array.isArray(roles) || !roles.length || roles.some((role) => !Object.prototype.hasOwnProperty.call(rolePermissions, role)) || !Array.isArray(grants) || !Array.isArray(denied) || [...grants, ...denied].some((permission) => !permissions.includes(permission))) throw new AdminError("Choose valid roles and permissions.");
    if (!roles.includes("super_admin") && grants.some((permission) => ["admin.roles.manage", "partners.promocodes.manage"].includes(permission))) throw new AdminError("These permissions are reserved for Super Admin.");
    if (!roles.some((role) => role === "finance_admin" || role === "super_admin") && grants.some((permission) => permission.startsWith("finance.") && permission.endsWith(".execute"))) throw new AdminError("Financial execution requires a Finance assignment.");
    const scope = input.scope as ResourceScope;
    for (const kind of ["clients", "partners"] as const) if (!scope || !(scope[kind] === "all" || Array.isArray(scope[kind]) && scope[kind].length <= 1000 && scope[kind].every((id) => typeof id === "string" && id.length <= 100))) throw new AdminError("Choose all records or a list of assigned record IDs.");
    const status = input.status || current?.status || "invited";
    if (!["invited", "active", "suspended", "deactivated"].includes(String(status)) || status === "active" && !current?.passwordHash) throw new AdminError("New administrators must activate an invitation first.");
    if (id === actor.id) throw new AdminError("Another Super Admin must change your own access.", 403);
    if (current?.roles.includes("super_admin") && current.status === "active" && (status !== "active" || !roles.includes("super_admin")) && !state.users.some((user) => user.id !== id && user.status === "active" && user.roles.includes("super_admin"))) throw new AdminError("Keep at least one active Super Admin.", 409);
    const now = new Date().toISOString();
    const user: AdminUser = { ...(current || { id: randomUUID(), passwordSalt: null, passwordHash: null, inviteHash: null, inviteExpires: 0, createdAt: now }), name, email, roles: [...new Set(roles)], grants: [...new Set(grants)], denied: [...new Set(denied)], scope, status: status as AdminUser["status"], updatedAt: now };
    let invitation: string | undefined;
    if (!current || input.action === "invite") { if (user.passwordHash) throw new AdminError("This account has already activated."); invitation = randomBytes(32).toString("base64url"); user.inviteHash = tokenHash(invitation); user.inviteExpires = Date.now() + 24 * 60 * 60 * 1000; user.status = "invited"; }
    state.users = current ? state.users.map((item) => item.id === id ? user : item) : [...state.users, user];
    state.sessions = state.sessions.filter((session) => session.adminId !== user.id);
    await appendAudit({ action: current ? "admin.access.updated" : "admin.invited", resource: "admin", resourceId: user.id, reason: input.reason as string, before: current && safeAdminUser(current), after: safeAdminUser(user) });
    return { user: safeAdminUser(user), invitation };
  });
}
export async function activateAdmin(input: Record<string, unknown>) {
  const token = typeof input.token === "string" ? input.token : ""; if (token.length > 100 || !token) throw new AdminError("Invalid invitation.");
  const salt = randomBytes(16).toString("hex"); const passwordHash = await derive(passwordValue(input.password), salt);
  await mutateAdministration(async (state) => {
    const user = state.users.find((user) => user.status === "invited" && user.email === String(input.email || "").trim().toLowerCase() && user.inviteHash === tokenHash(token) && user.inviteExpires > Date.now());
    if (!user) throw new AdminError("This invitation is invalid, expired or already used.");
    user.passwordSalt = salt; user.passwordHash = passwordHash; user.inviteHash = null; user.inviteExpires = 0; user.status = "active"; user.updatedAt = new Date().toISOString();
    await appendAudit({ actorId: user.id, action: "admin.activated", resource: "admin", resourceId: user.id });
  });
}

export async function changeAdminPassword(admin: AdminPrincipal, currentPassword: unknown, newPassword: unknown) {
  await reauthenticateAdmin(admin, currentPassword);
  const salt = randomBytes(16).toString("hex"); const passwordHash = await derive(passwordValue(newPassword), salt);
  return mutateAdministration(async (state) => {
    const user = state.users.find((user) => user.id === admin.id && user.status === "active");
    if (!user || !state.sessions.some((session) => session.id === admin.sessionId && session.adminId === user.id && session.expiresAt > Date.now())) throw new AdminError("Sign in again.", 401);
    user.passwordSalt = salt; user.passwordHash = passwordHash; user.updatedAt = new Date().toISOString();
    state.sessions = state.sessions.filter((session) => session.adminId !== user.id);
    const token = randomBytes(32).toString("base64url"); const now = Date.now();
    state.sessions.push({ id: randomUUID(), adminId: user.id, hash: tokenHash(token), expiresAt: now + adminSessionSeconds * 1000, authenticatedAt: now });
    await appendAudit({ actorId: admin.id, action: "admin.password.changed", resource: "admin", resourceId: admin.id });
    return token;
  });
}
