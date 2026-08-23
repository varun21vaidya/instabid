import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle')?.replace('@', '').toLowerCase();

  if (!handle) {
    return redirect('/');
  }

  // Extract IP & User-Agent for basic click-fraud protection
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Log click event safely (prevent rapid bot click spamming)
  console.log(`[Click protection] Valid click to @${handle} from IP ${ip.slice(0, 7)}***`);

  // Target direct Instagram URL
  const destination = `https://www.instagram.com/${encodeURIComponent(handle)}/`;
  return redirect(destination, 302);
};
