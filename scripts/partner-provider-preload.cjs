// Test-process preload only. Application code has no mock-provider mode or bypass.
const originalFetch = global.fetch;
const origin = process.env.DEJADON_TEST_PROVIDER_ORIGIN;
if (!origin || !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw new Error("A local partner test provider is required");
global.fetch = function (input, options) {
  const url = new URL(typeof input === "string" || input instanceof URL ? String(input) : input.url);
  const provider = url.hostname === "api.paystack.co" ? "paystack" : url.hostname === "api.resend.com" ? "resend" : null;
  if (!provider) return originalFetch(input, options);
  const target = `${origin}/${provider}${url.pathname}${url.search}`;
  return originalFetch(typeof input === "string" || input instanceof URL ? target : new Request(target, input), options);
};
