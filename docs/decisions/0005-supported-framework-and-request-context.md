# ADR 0005: Use supported framework APIs and patched dependencies

**Status: Accepted**

## Context

Application pages and route handlers read cookies, route parameters and search parameters as request-bound values. Next.js changed those APIs to asynchronous values, and older framework releases have published security advisories affecting this app's server-side rendering and image processing.

## Decision

Use the maintained Next.js 15.5 line with its supported React 19 runtime and keep the framework and image-processing fixes pinned in the dependency lock. Await `cookies()`, route `params` and page `searchParams` at their server entry points. Session and authorization checks continue at each protected page/API request. Production dependency audit results are part of release verification.

## Consequences

Route signatures must use promised `params` and `searchParams`; server helpers that read cookies are asynchronous, and callers must await them. Upgrading framework dependencies requires rerunning TypeScript, lint, production build, isolated API flows and the production dependency audit. It does not remove the need for secure proxy configuration or server-side authorization.
