import type { APIRoute } from 'astro';

const PAYPAL_BASE = (environment: string) =>
  environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const HANDLE_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;
const MIN_BID_CENTS = 500;
const MAX_BID_CENTS = 5_000_000;

type RuntimeEnv = Record<string, string | undefined>;

async function getAccessToken(clientId: string, clientSecret: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`PayPal authentication failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('PayPal authentication returned no access token.');
  return data.access_token;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as {
      profileId?: unknown;
      amountUsd?: unknown;
      categoryId?: unknown;
      description?: unknown;
    };
    const profileId = typeof body.profileId === 'string' ? body.profileId.replace(/^@/, '').trim().toLowerCase() : '';
    const amountUsd = typeof body.amountUsd === 'number' ? body.amountUsd : Number(body.amountUsd);
    const categoryId = typeof body.categoryId === 'string' && body.categoryId.trim() ? body.categoryId.trim() : 'all';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 80) : '';
    const amountCents = Math.round(amountUsd * 100);

    if (!HANDLE_PATTERN.test(profileId)) return json({ error: 'Invalid Instagram handle.' }, 400);
    if (!Number.isFinite(amountUsd) || amountCents < MIN_BID_CENTS || amountCents > MAX_BID_CENTS) {
      return json({ error: 'Bid must be between $5.00 and $50,000.00 USD.' }, 400);
    }

    const env = ((locals as any)?.runtime?.env || process.env) as RuntimeEnv;
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      return json({ error: 'PayPal is not configured.' }, 503);
    }

    const baseUrl = PAYPAL_BASE(env.PAYPAL_ENV ?? 'sandbox');
    const accessToken = await getAccessToken(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET, baseUrl);
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: profileId,
            custom_id: JSON.stringify({ profileId, categoryId, amountCents }),
            description: `InstaBid ranking bid for @${profileId}`,
            amount: { currency_code: 'USD', value: (amountCents / 100).toFixed(2) },
          },
        ],
        application_context: { user_action: 'PAY_NOW', shipping_preference: 'NO_SHIPPING' },
      }),
    });

    if (!orderResponse.ok) return json({ error: 'PayPal could not create the order.' }, 502);
    const order = (await orderResponse.json()) as { id?: string };
    if (!order.id) return json({ error: 'PayPal returned an invalid order.' }, 502);

    return json({ id: order.id, profileId, amountCents, description });
  } catch (error) {
    console.error('PayPal create-order failed', error);
    return json({ error: 'Unable to start PayPal checkout.' }, 500);
  }
};
