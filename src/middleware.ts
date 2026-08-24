import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(({ redirect, url }, next) => {
  const host = url.hostname.toLowerCase();

  if (host.startsWith('www.')) {
    const target = new URL(url);
    target.hostname = 'instabid.live';
    target.protocol = 'https:';
    return redirect(target.toString(), 308);
  }

  return next();
});
