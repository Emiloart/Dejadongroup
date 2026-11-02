# ADR 0003: Keep partner resources private and tier-scoped

**Status: Accepted**

## Context

The Partner Programme needs a managed library for marketing and other materials. Those files can contain approved partner-only material and must not become public simply because they are published in the administrative workspace.

## Decision

Administrators upload a partner resource in Media & Content, select its audience and may choose the current partner tiers allowed to access it. An empty tier list means all registered tiers. A nonempty list is an explicit allowlist; higher rank does not imply access. Listing and each file preview/download recheck active verified membership and the partner's current entitled tier. Partner assets stay outside the public asset directory and are served through the resource authorization route. Generic public media and homepage content omit them. A referenced published asset cannot be archived until the resource is replaced or unpublished. Existing records without an audience field remain public for compatibility; an asset that was public must be uploaded again as partner-only before it is used for confidential material.

## Consequences

Staff who publish must hold the existing content publication permission; editors can prepare drafts and upload files where granted. File type/MIME and signatures are checked, but uploads are not malware-scanned. An external URL remains subject to the external host's own access controls. Tiers must be selected explicitly whenever resource eligibility differs from the all-registered-partners default.
