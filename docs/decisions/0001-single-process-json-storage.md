# ADR 0001: Keep JSON storage single-process

**Status: Accepted**

## Context

The application already stores clients, partner accounts, payment records, products, uploads and administrative settings in files. Operations that affect several records depend on a shared in-process mutex and a redo journal. Adding a second writer or application replica would bypass that coordination.

## Decision

Keep the current repository adapter on one application process with a persistent writable data directory. Continue to put related changes inside the existing transaction helper and keep external provider requests outside the storage transaction. Do not run a cluster, serverless replicas or a concurrent maintenance writer against the same directory.

## Consequences

The journal supports recovery of coordinated writes, but it does not provide cross-process locks, database constraints, distributed transactions or multi-host failover. Backups must cover the complete data directory and uploads as one consistent set. Scaling beyond one writer requires replacing or adapting the repository boundary to a transactional shared store before adding replicas.
