require('./admin-test-loader.cjs');
const assert = require('node:assert/strict'); const { test } = require('node:test');
const { mkdtemp, readFile, writeFile, rm } = require('node:fs/promises'); const path = require('node:path'); const os = require('node:os'); const { createHash } = require('node:crypto');
const storage = require('../src/lib/site-storage.ts'); const audit = require('../src/lib/admin-audit.ts'); const { migrateAdministration } = require('../src/lib/admin-migrations.ts');
const { effectivePermissions, inScope } = require('../src/lib/admin-permissions.ts');
test('coordinated JSON rollback, concurrent writes, journal recovery, append-only audit and additive migration', async () => {
 const directory = await mkdtemp(path.join(os.tmpdir(), 'dejadon-admin-storage-')); const previous = process.env.DEJADON_DATA_DIR; process.env.DEJADON_DATA_DIR = directory;
 try {
  await storage.updateCollection('migrations', () => ({ items: [{ counter: 0 }], result: undefined }));
  await assert.rejects(storage.storageTransaction(async () => { await storage.updateCollection('migrations', () => ({ items: [{ counter: 999 }], result: undefined })); await audit.appendAudit({ action: 'must.rollback', resource: 'test', resourceId: 'rollback' }); throw new Error('Abort'); }), /Abort/);
  assert.equal((await storage.readCollection('migrations'))[0].counter, 0); assert.deepEqual(await audit.auditHistory(), []);
  await Promise.all(Array.from({ length: 30 }, (_, i) => storage.storageTransaction(async () => { await storage.updateCollection('migrations', (items) => ({ items: [{ counter: items[0].counter + 1 }], result: undefined })); await audit.appendAudit({ actorId: 'synthetic-admin', action: 'counter.updated', resource: 'test', resourceId: String(i), before: { balance: 0, password: 'must-not-appear' }, after: { balance: 1, accountNumber: '0012345678', token: 'never-store-token' } }); })));
  assert.equal((await storage.readCollection('migrations'))[0].counter, 30);
  const events = await audit.auditHistory(); assert.equal(events.length, 30);
  for (let i = 0; i < events.length; i++) { const { hash, ...base } = events[i]; assert.equal(hash, createHash('sha256').update(JSON.stringify(base)).digest('hex')); assert.equal(base.previousHash, i ? events[i-1].hash : 'genesis'); }
  assert.doesNotMatch(await readFile(path.join(directory, 'audit.json'), 'utf8'), /must-not-appear|0012345678|never-store-token/);
  await audit.audited('record.created', 'test', 'new', async () => ({ id: 'stable-created-id' })); assert.equal((await audit.auditHistory()).at(-1).resourceId, 'stable-created-id');
  await writeFile(path.join(directory, '.transaction.json'), JSON.stringify({ version: 1, documents: [['migrations.json', { version: 1, items: [{ counter: 31 }] }], ['finance.json', { version: 1, items: [{ synthetic: true }] }]] }));
  assert.equal((await storage.readCollection('migrations'))[0].counter, 31); assert.equal((await storage.readCollection('finance'))[0].synthetic, true);
  await writeFile(path.join(directory, '.transaction.json'), 'broken'); await assert.rejects(storage.readCollection('finance')); await rm(path.join(directory, '.transaction.json'));
  const first = await migrateAdministration(); assert.equal(first.applied, true); assert.ok(first.backup); assert.equal((await migrateAdministration()).applied, false);
  assert.equal(JSON.parse(await readFile(path.join(first.backup, 'migrations.json'), 'utf8')).items[0].counter, 31);
 } finally { if (previous === undefined) delete process.env.DEJADON_DATA_DIR; else process.env.DEJADON_DATA_DIR = previous; await rm(directory, { recursive: true, force: true }); }
});
test('reserved permissions, finance execution and resource scopes default to denied', () => {
 const partner = effectivePermissions(['partner_programme_admin'], ['partners.promocodes.manage', 'admin.roles.manage', 'finance.refunds.execute'], []);
 assert.ok(!partner.includes('partners.promocodes.manage') && !partner.includes('admin.roles.manage') && !partner.includes('finance.refunds.execute'));
 const finance = effectivePermissions(['finance_admin'], [], []); assert.ok(!finance.includes('finance.refunds.execute')); assert.ok(finance.includes('finance.refunds.review'));
 assert.ok(effectivePermissions(['finance_admin'], ['finance.refunds.execute'], []).includes('finance.refunds.execute'));
 assert.ok(!effectivePermissions(['media_admin'], [], ['content.publish']).includes('content.publish'));
 assert.equal(inScope({ scope: { clients: ['one'], partners: [] } }, 'clients', 'two'), false);
});
