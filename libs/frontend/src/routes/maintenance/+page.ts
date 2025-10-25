// Prerender this page to static HTML so it can be used by the Cloudflare Worker
export const prerender = true;

// Don't try to fetch any data
export const ssr = true;

// Don't use client-side routing for this page
export const csr = false;
