import assert from 'node:assert/strict';
import { test } from 'node:test';
import support from './partner-test-support.cjs';

const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=', 'base64');

test('partner resources connect admin uploads to protected tier-aware downloads without public leaks', { timeout: 180000 }, async () => {
  const h = await support.startPartnerHarness();
  try {
    const owner = await h.adminSession();
    const adminPost = async (resource, body, status = 200) => h.json(await h.request(`/api/admin/governance/${resource}`, { cookie: owner, method: 'POST', body }), status);
    const tier = async (name, rank) => (await h.json(await h.request('/api/admin/partner-programme/tiers', { cookie: owner, method: 'POST', body: { name, description: 'Configured partner membership', rank, fee: '0', active: true, benefits: [{ id: `guide-${rank}`, title: 'Approved guidance', summary: '', content: 'Membership content' }] } }))).tier;
    const basic = await tier('Resource basic', 1); const advanced = await tier('Resource advanced', 2);
    async function member(email, tierId, complete = true) {
      const signup = await h.request('/api/partner/register', { method: 'POST', body: { email, fullName: 'Resource member', password: 'resource-member-password-strong' } }); await h.json(signup, 201); const cookie = h.cookie(signup);
      if (complete) {
        await h.json(await h.request('/api/partner/verify', { method: 'POST', cookie, body: { code: h.inbox.get(email) } }));
        await h.json(await h.request('/api/partner/profile', { method: 'PUT', cookie, body: { phone: '08012345678', accountNumber: '0012345678', location: 'Awka', dob: '1990-01-01', occupation: 'Farmer', nationality: 'Nigerian' } }));
        const { quote } = await h.json(await h.request('/api/partner/quote', { method: 'POST', cookie, body: { tierId } }));
        await h.json(await h.request('/api/partner/checkout', { method: 'POST', cookie, body: { tierId, fingerprint: quote.fingerprint } }), 201);
      }
      return cookie;
    }
    const basicMember = await member('resource-basic@example.test', basic.id);
    const advancedMember = await member('resource-advanced@example.test', advanced.id);
    const unverified = await member('resource-pending@example.test', basic.id, false);
    async function upload(title, bytes, mime, audience = 'partners', cookie = owner, expected = 200, origin = h.origin) {
      const form = new FormData(); form.set('title', title); form.set('audience', audience); form.set('file', new Blob([bytes], { type: mime }), mime === 'application/pdf' ? 'guide.pdf' : 'campaign.png');
      return h.json(await fetch(`${h.origin}/api/admin/governance/upload`, { method: 'POST', headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}) }, body: form }), expected);
    }
    assert.equal((await h.request('/api/partner/resources')).status, 401);
    assert.equal((await h.request('/api/partner/resources', { cookie: unverified })).status, 403);
    await upload('Unauthorized member upload', pdf, 'application/pdf', 'partners', basicMember, 401);
    await upload('Cross origin upload', pdf, 'application/pdf', 'partners', owner, 403, 'https://wrong.test');
    await upload('Mismatched file type', png, 'application/pdf', 'partners', owner, 400);
    const guide = await upload('Protected marketing guide', pdf, 'application/pdf');
    const campaign = await upload('Protected campaign image', png, 'image/png');
    const publicImage = await upload('Public image', png, 'image/png', 'public');
    const entry = { kind: 'resource', title: 'Private campaign guide unique marker', body: 'Approved notes for introducing De Jadon Group to prospective partners.', summary: 'Download the current approved guide.', slug: 'protected-campaign-guide', audience: 'partners', tierIds: [basic.id], status: 'draft', href: '', assetId: guide.id };
    const draft = await adminPost('content', entry);
    const restricted = await adminPost('content', { id: draft.id, action: 'publish' });
    const imageResource = await adminPost('content', { ...entry, title: 'Private campaign image unique marker', slug: 'protected-campaign-image', tierIds: [], assetId: campaign.id, status: 'published' });
    await adminPost('content', { ...entry, slug: 'public-cannot-use-private', audience: 'public', tierIds: [], status: 'published' }, 400);
    await adminPost('content', { ...entry, slug: 'private-cannot-use-public', assetId: publicImage.id, status: 'published' }, 400);
    const list = await h.json(await h.request('/api/partner/resources', { cookie: basicMember }));
    assert.equal(list.resources.length, 2); assert.doesNotMatch(JSON.stringify(list), /assetId|filename|createdBy|managed-assets/);
    assert.deepEqual((await h.json(await h.request('/api/partner/resources', { cookie: advancedMember }))).resources.map((row) => row.id), [imageResource.id]);
    const home = await (await h.request('/')).text(); assert.doesNotMatch(home, /Private campaign guide unique marker|Private campaign image unique marker/); assert.doesNotMatch(home, new RegExp(guide.id));
    const dashboard = await (await h.request('/dashboard/partner', { cookie: basicMember })).text(); assert.match(dashboard, /Resources &amp; marketing materials/); assert.match(dashboard, /Private campaign guide unique marker/); assert.match(dashboard, new RegExp(`/api/partner/resources/${restricted.id}/file`));
    assert.equal((await h.request(`/api/managed-media/${guide.id}`)).status, 404);
    assert.equal((await h.request(`/api/managed-media/${guide.id}`, { cookie: basicMember })).status, 404);
    assert.equal((await h.request(`/api/managed-media/${guide.id}`, { cookie: owner })).status, 200);
    const route = `/api/partner/resources/${restricted.id}/file`;
    const denied = await h.request(route); assert.equal(denied.status, 401); assert.match(denied.headers.get('cache-control'), /no-store/);
    assert.equal((await h.request(route, { cookie: advancedMember })).status, 404);
    assert.equal((await h.request(route, { cookie: unverified })).status, 403);
    const file = await h.request(route, { cookie: basicMember }); assert.equal(file.status, 200); assert.equal(file.headers.get('content-type'), 'application/pdf'); assert.match(file.headers.get('content-disposition'), /^attachment/); assert.match(file.headers.get('cache-control'), /private, no-store/); assert.match(file.headers.get('vary'), /Cookie/i); assert.equal(file.headers.get('x-content-type-options'), 'nosniff'); assert.deepEqual(Buffer.from(await file.arrayBuffer()), pdf);
    assert.match((await h.request(`${route}?preview=1`, { cookie: basicMember })).headers.get('content-disposition'), /^attachment/);
    const preview = await h.request(`/api/partner/resources/${imageResource.id}/file?preview=1`, { cookie: advancedMember }); assert.equal(preview.status, 200); assert.match(preview.headers.get('content-disposition'), /^inline/);
    await adminPost('media', { id: guide.id }, 409);
    const replacement = await upload('Revised partner guide', pdf, 'application/pdf');
    await adminPost('content', { ...restricted, assetId: replacement.id }); await adminPost('media', { id: guide.id });
    assert.equal((await h.request(route, { cookie: basicMember })).status, 200);
    await adminPost('content', { id: restricted.id, action: 'unpublish' });
    assert.equal((await h.request(route, { cookie: basicMember })).status, 404);
    await adminPost('media', { id: replacement.id }); await adminPost('content', { id: restricted.id, action: 'publish' }, 400);
    const tierSpecific = await adminPost('content', { ...entry, title: 'Current tier campaign', slug: 'current-tier-campaign', assetId: campaign.id, status: 'published' });
    assert.equal((await h.request(`/api/partner/resources/${tierSpecific.id}/file`, { cookie: basicMember })).status, 200);
    const upgrade = (await h.json(await h.request('/api/partner/quote', { cookie: basicMember, method: 'POST', body: { tierId: advanced.id } }))).quote;
    await h.json(await h.request('/api/partner/checkout', { cookie: basicMember, method: 'POST', body: { tierId: advanced.id, fingerprint: upgrade.fingerprint } }), 201);
    assert.equal((await h.request(`/api/partner/resources/${tierSpecific.id}/file`, { cookie: basicMember })).status, 404, 'an existing session must use the member’s current tier after an upgrade');
    assert.ok(!(await h.json(await h.request('/api/partner/resources', { cookie: basicMember }))).resources.some((row) => row.id === tierSpecific.id));
    const active = await h.json(await h.request('/api/partner/session', { cookie: basicMember }));
    await h.json(await h.request('/api/admin/partner-programme/members', { method: 'POST', cookie: owner, body: { id: active.partner.id, action: 'suspend', confirm: true, reason: 'Resource access suspension test' } }));
    assert.equal((await h.request('/api/partner/resources', { cookie: basicMember })).status, 401);
    assert.equal((await h.request(`/api/partner/resources/${imageResource.id}/file`, { cookie: basicMember })).status, 401);
    const contentView = await h.json(await h.request('/api/admin/governance/content', { cookie: owner })); assert.ok(contentView.tiers.some((row) => row.id === basic.id)); assert.ok(contentView.history.some((row) => row.action === 'content.publish'));
  } finally { await h.close(); }
});
