import { NextRequest, NextResponse } from 'next/server';

// Extract just the origin from the API base URL so connect-src doesn't expose the path.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').origin;
  } catch {
    return 'http://localhost:5000';
  }
})();

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // 'strict-dynamic' lets Next.js's runtime load child scripts without listing
  // every hash/URL. 'unsafe-eval' is only needed in dev (React error overlays).
  // 'unsafe-inline' for styles is only needed in dev (HMR injects them).
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ''};
    img-src 'self' blob: data: https://images.unsplash.com;
    font-src 'self';
    connect-src 'self' ${apiOrigin};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Forward the nonce to Server Components via a request header.
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('x-nonce', nonce);
  reqHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: reqHeaders } });
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files.
    // Also skip prefetch requests so they don't each burn a nonce.
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
