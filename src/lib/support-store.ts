import { randomBytes, randomUUID } from "node:crypto";
import { appendAudit } from "@/lib/admin-audit";
import { inScope, type AdminPrincipal } from "@/lib/admin-permissions";
import { getSupportClientSummaries } from "@/lib/client-store";
import { getAdminDisplayNames } from "@/lib/admin-store";
import { getSupportPartnerSummaries } from "@/lib/partner-store";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { ContentError } from "@/lib/content-api";

export const supportRoles = ["client", "partner"] as const;
export type SupportRole = (typeof supportRoles)[number];
export const supportCategories = ["account", "investment", "savings", "partner_programme", "payment", "technical", "other"] as const;
export type SupportCategory = (typeof supportCategories)[number];
export const supportStatuses = ["open", "in_progress", "awaiting_customer", "resolved"] as const;
export type SupportStatus = (typeof supportStatuses)[number];

export type SupportMessage = { id: string; authorType: "customer" | "staff"; authorId: string; body: string; createdAt: string };
export type SupportNote = { id: string; authorId: string; body: string; createdAt: string };
export type SupportTicket = {
  id: string;
  reference: string;
  ownerRole: SupportRole;
  ownerId: string;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: SupportMessage[];
  notes: SupportNote[];
};

export type SupportRequester = { role: SupportRole; name: string; email: string };
export type CustomerTicketSummary = Pick<SupportTicket, "id" | "reference" | "subject" | "category" | "status" | "createdAt" | "updatedAt"> & {
  lastMessage: { authorType: SupportMessage["authorType"]; preview: string; createdAt: string };
};
export type CustomerTicketDetail = CustomerTicketSummary & {
  messages: { id: string; authorType: SupportMessage["authorType"]; body: string; createdAt: string }[];
};
export type AdminTicketSummary = CustomerTicketSummary & {
  requester: SupportRequester;
  assignedToName: string | null;
  assignedToMe: boolean;
};
export type AdminTicketDetail = AdminTicketSummary & {
  messages: { id: string; authorType: SupportMessage["authorType"]; authorName: string; body: string; createdAt: string }[];
  notes: { id: string; authorName: string; body: string; createdAt: string }[];
};

const maximumTicketsPerAccount = 100;
const maximumMessagesPerTicket = 100;
const maximumTicketText = 200_000;
const readTickets = () => readCollection<SupportTicket>("support-tickets");

function boundedText(value: unknown, label: string, maximum: number, minimum = 1) {
  if (typeof value !== "string") throw new ContentError(`Enter a valid ${label}.`);
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (normalized.length < minimum || normalized.length > maximum) throw new ContentError(`${label} must be between ${minimum} and ${maximum} characters.`);
  return normalized;
}

function messageBody(value: unknown) {
  const body = boundedText(value, "message", 4000);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(body)) throw new ContentError("Remove unsupported control characters from the message.");
  return body;
}

function ticketSummary(ticket: SupportTicket): CustomerTicketSummary {
  const last = ticket.messages.at(-1)!;
  return {
    id: ticket.id,
    reference: ticket.reference,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastMessage: { authorType: last.authorType, preview: last.body.slice(0, 180), createdAt: last.createdAt }
  };
}

function ticketTextSize(ticket: SupportTicket) {
  return ticket.messages.reduce((total, message) => total + message.body.length, ticket.subject.length);
}

export function createSupportTicket(owner: { role: SupportRole; id: string }, input: Record<string, unknown>) {
  const subject = boundedText(input.subject, "subject", 120);
  const category = input.category;
  if (typeof category !== "string" || !supportCategories.includes(category as SupportCategory)) throw new ContentError("Choose a valid support category.");
  const body = messageBody(input.message);
  return updateCollection<SupportTicket, CustomerTicketDetail>("support-tickets", (tickets) => {
    if (tickets.filter((ticket) => ticket.ownerRole === owner.role && ticket.ownerId === owner.id).length >= maximumTicketsPerAccount) throw new ContentError("You have reached the support request limit. Contact the team by phone for further help.", 429);
    const now = new Date().toISOString();
    let reference = "";
    do { reference = `DJ-SUP-${randomBytes(6).toString("hex").toUpperCase()}`; } while (tickets.some((ticket) => ticket.reference === reference));
    const ticket: SupportTicket = {
      id: randomUUID(), reference, ownerRole: owner.role, ownerId: owner.id, subject,
      category: category as SupportCategory, status: "open", assignedToId: null,
      createdAt: now, updatedAt: now, resolvedAt: null,
      messages: [{ id: randomUUID(), authorType: "customer", authorId: owner.id, body, createdAt: now }], notes: []
    };
    return { items: [ticket, ...tickets], result: customerTicketDetail(ticket) };
  });
}

export function listCustomerSupportTickets(owner: { role: SupportRole; id: string }) {
  return readTickets().then((tickets) => tickets
    .filter((ticket) => ticket.ownerRole === owner.role && ticket.ownerId === owner.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 100)
    .map(ticketSummary));
}

function customerTicketDetail(ticket: SupportTicket): CustomerTicketDetail {
  return { ...ticketSummary(ticket), messages: ticket.messages.map(({ id, authorType, body, createdAt }) => ({ id, authorType, body, createdAt })) };
}

export async function getCustomerSupportTicket(owner: { role: SupportRole; id: string }, id: string) {
  const ticket = (await readTickets()).find((item) => item.id === id && item.ownerRole === owner.role && item.ownerId === owner.id);
  if (!ticket) throw new ContentError("Support request not found.", 404);
  return customerTicketDetail(ticket);
}

export function replyToSupportTicket(owner: { role: SupportRole; id: string }, id: string, value: unknown) {
  const body = messageBody(value);
  return updateCollection<SupportTicket, void>("support-tickets", (tickets) => {
    const ticket = tickets.find((item) => item.id === id && item.ownerRole === owner.role && item.ownerId === owner.id);
    if (!ticket) throw new ContentError("Support request not found.", 404);
    if (ticket.messages.length >= maximumMessagesPerTicket || ticketTextSize(ticket) + body.length > maximumTicketText) throw new ContentError("This conversation has reached its message limit. Start a new support request.", 409);
    const now = new Date().toISOString();
    ticket.messages.push({ id: randomUUID(), authorType: "customer", authorId: owner.id, body, createdAt: now });
    ticket.status = "open";
    ticket.resolvedAt = null;
    ticket.updatedAt = now;
    return { items: tickets, result: undefined };
  });
}

function canReadTicket(admin: AdminPrincipal, ticket: SupportTicket) {
  return inScope(admin, ticket.ownerRole === "client" ? "clients" : "partners", ticket.ownerId);
}

async function requesterLookup(tickets: SupportTicket[]) {
  const clientIds = new Set(tickets.filter((ticket) => ticket.ownerRole === "client").map((ticket) => ticket.ownerId));
  const partnerIds = new Set(tickets.filter((ticket) => ticket.ownerRole === "partner").map((ticket) => ticket.ownerId));
  const staffIds = new Set(tickets.flatMap((ticket) => [
    ...(ticket.assignedToId ? [ticket.assignedToId] : []),
    ...ticket.messages.filter((message) => message.authorType === "staff").map((message) => message.authorId),
    ...ticket.notes.map((note) => note.authorId)
  ]));
  const [clients, partners, staff] = await Promise.all([
    getSupportClientSummaries([...clientIds]), getSupportPartnerSummaries([...partnerIds]), getAdminDisplayNames([...staffIds])
  ]);
  const requesters = new Map<string, SupportRequester>();
  for (const client of clients) if (clientIds.has(client.id)) requesters.set(`client:${client.id}`, { role: "client", name: client.fullName, email: client.email || "" });
  for (const partner of partners) if (partnerIds.has(partner.id)) requesters.set(`partner:${partner.id}`, { role: "partner", name: partner.fullName, email: partner.email });
  const admins = new Map(staff.map((user) => [user.id, user.name]));
  return { requesters, admins };
}

export async function listAdminSupportTickets(admin: AdminPrincipal, options: { status?: string; query?: string } = {}) {
  const all = (await readTickets()).filter((ticket) => canReadTicket(admin, ticket));
  const counts = {
    total: all.length,
    open: all.filter((ticket) => ticket.status === "open").length,
    inProgress: all.filter((ticket) => ticket.status === "in_progress").length,
    awaitingCustomer: all.filter((ticket) => ticket.status === "awaiting_customer").length,
    resolved: all.filter((ticket) => ticket.status === "resolved").length
  };
  const { requesters, admins } = await requesterLookup(all);
  const query = options.query?.trim().toLowerCase().slice(0, 100) || "";
  const rows = all.filter((ticket) => (!options.status || options.status === "all" || ticket.status === options.status) && (!query || [
    ticket.reference, ticket.subject, ticket.category, ticket.messages.at(-1)?.body,
    requesters.get(`${ticket.ownerRole}:${ticket.ownerId}`)?.name,
    requesters.get(`${ticket.ownerRole}:${ticket.ownerId}`)?.email
  ].some((value) => value?.toLowerCase().includes(query)))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return {
    counts,
    total: rows.length,
    tickets: rows.slice(0, 100).map((ticket) => ({
      ...ticketSummary(ticket),
      requester: requesters.get(`${ticket.ownerRole}:${ticket.ownerId}`) || { role: ticket.ownerRole, name: "Account unavailable", email: "" },
      assignedToName: ticket.assignedToId ? admins.get(ticket.assignedToId) || "Former support agent" : null,
      assignedToMe: ticket.assignedToId === admin.id
    }))
  };
}

function adminTicketDetail(ticket: SupportTicket, requester: SupportRequester, admins: Map<string, string>, actorId: string, includeNotes: boolean): AdminTicketDetail {
  return {
    ...ticketSummary(ticket),
    requester,
    assignedToName: ticket.assignedToId ? admins.get(ticket.assignedToId) || "Former support agent" : null,
    assignedToMe: ticket.assignedToId === actorId,
    messages: ticket.messages.map((message) => ({
      id: message.id, authorType: message.authorType,
      authorName: message.authorType === "customer" ? requester.name : admins.get(message.authorId) || "De Jadon Support",
      body: message.body, createdAt: message.createdAt
    })),
    notes: includeNotes ? ticket.notes.map((note) => ({ id: note.id, authorName: admins.get(note.authorId) || "Former support agent", body: note.body, createdAt: note.createdAt })) : []
  };
}

export async function getAdminSupportTicket(admin: AdminPrincipal, id: string, includeNotes = false) {
  const ticket = (await readTickets()).find((item) => item.id === id && canReadTicket(admin, item));
  if (!ticket) throw new ContentError("Support request not found.", 404);
  const { requesters, admins } = await requesterLookup([ticket]);
  const requester = requesters.get(`${ticket.ownerRole}:${ticket.ownerId}`) || { role: ticket.ownerRole, name: "Account unavailable", email: "" };
  return adminTicketDetail(ticket, requester, admins, admin.id, includeNotes);
}

function adminCanWork(ticket: SupportTicket, actor: AdminPrincipal) {
  if (ticket.assignedToId && ticket.assignedToId !== actor.id && !actor.roles.includes("super_admin")) throw new ContentError("This request is assigned to another support agent.", 409);
}

export async function applyAdminSupportAction(actor: AdminPrincipal, id: string, action: unknown, value: unknown) {
  if (typeof action !== "string" || !["claim", "reply", "note", "resolve"].includes(action)) throw new ContentError("Choose a valid support action.");
  const body = action === "reply" || action === "note" ? messageBody(value) : "";
  return updateCollection<SupportTicket, { status: SupportStatus }>("support-tickets", async (tickets) => {
    const ticket = tickets.find((item) => item.id === id && canReadTicket(actor, item));
    if (!ticket) throw new ContentError("Support request not found.", 404);
    const now = new Date().toISOString();
    if (action === "claim") {
      if (ticket.status === "resolved") throw new ContentError("Resolved requests cannot be claimed.", 409);
      adminCanWork(ticket, actor);
      ticket.assignedToId = actor.id;
      ticket.status = "in_progress";
      ticket.updatedAt = now;
    } else if (action === "reply") {
      adminCanWork(ticket, actor);
      if (ticket.status === "resolved") throw new ContentError("Reopen this request before replying.", 409);
      if (ticket.assignedToId !== actor.id) throw new ContentError("Take ownership of this request before replying.", 409);
      if (ticket.messages.length >= maximumMessagesPerTicket || ticketTextSize(ticket) + body.length > maximumTicketText) throw new ContentError("This conversation has reached its message limit. Ask the customer to open a new request.", 409);
      ticket.messages.push({ id: randomUUID(), authorType: "staff", authorId: actor.id, body, createdAt: now });
      ticket.status = "awaiting_customer";
      ticket.updatedAt = now;
    } else if (action === "note") {
      adminCanWork(ticket, actor);
      if (ticket.notes.length >= 100) throw new ContentError("This request has reached its internal note limit.", 409);
      ticket.notes.push({ id: randomUUID(), authorId: actor.id, body, createdAt: now });
      ticket.updatedAt = now;
    } else {
      adminCanWork(ticket, actor);
      if (ticket.status === "resolved") throw new ContentError("This request is already resolved.", 409);
      if (ticket.assignedToId !== actor.id) throw new ContentError("Take ownership of this request before resolving it.", 409);
      ticket.status = "resolved";
      ticket.resolvedAt = now;
      ticket.updatedAt = now;
    }
    const auditAction = action === "claim" ? "support.ticket.claimed" : action === "reply" ? "support.ticket.replied" : action === "note" ? "support.ticket.note_added" : "support.ticket.resolved";
    await appendAudit({ action: auditAction, resource: "support-ticket", resourceId: ticket.reference, after: { status: ticket.status, messageCount: ticket.messages.length, noteCount: ticket.notes.length } });
    return { items: tickets, result: { status: ticket.status } };
  });
}

export async function supportCountsForAdmin(admin: AdminPrincipal) {
  const tickets = (await readTickets()).filter((ticket) => canReadTicket(admin, ticket));
  return {
    open: tickets.filter((ticket) => ticket.status === "open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
    awaitingCustomer: tickets.filter((ticket) => ticket.status === "awaiting_customer").length
  };
}
