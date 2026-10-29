require('./admin-test-loader.cjs');
require('../src/lib/admin-migrations.ts').migrateAdministration().then((result) => console.log(JSON.stringify(result))).catch(() => { console.error('Migration failed. Check storage permissions and the transaction journal; no success is recorded.'); process.exitCode = 1; });
