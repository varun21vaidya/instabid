import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';

const PAYPAL_BASE = (environment: string) =>
  environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

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
  if (!response.ok) throw new Error('PayPal authentication failed.');
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
    const body = (await request.json()) as { orderId?: unknown; profileId?: unknown };
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const profileId = typeof body.profileId === 'string' ? body.profileId.replace(/^@/, '').trim().toLowerCase() : '';
    if (!orderId || !profileId) return json({ error: 'Order and profile are required.' }, 400);

    const env = ((locals as any)?.runtime?.env || process.env) as RuntimeEnv;
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) return json({ error: 'PayPal is not configured.' }, 503);

    const db = getDb(env);
    if (!db) return json({ error: 'Leaderboard storage is not configured.' }, 503);
    const existingBid = db
      ? await db.select().from(schema.bids).where(eq(schema.bids.paypalOrderId, orderId)).get()
      : undefined;
    if (existingBid) return json({ status: 'COMPLETED', profileId, amountPaid: existingBid.amountCents / 100 });

    const baseUrl = PAYPAL_BASE(env.PAYPAL_ENV ?? 'sandbox');
    const accessToken = await getAccessToken(env.PAYPAL_CLIENT_ID, env.PAYPAL_CLIENT_SECRET, baseUrl);
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });
    const capture = (await captureResponse.json()) as any;
    if (!captureResponse.ok || capture.status !== 'COMPLETED') return json({ error: 'Payment was not completed.' }, 402);

    const purchaseUnit = capture.purchase_units?.[0];
    const capturedProfileId = purchaseUnit?.reference_id;
    let categoryId: string | undefined;
    try {
      categoryId = JSON.parse(purchaseUnit?.custom_id || '{}').categoryId;
    } catch {
      categoryId = undefined;
    }
    const amountValue = purchaseUnit?.payments?.captures?.[0]?.amount?.value;
    const amountCents = Math.round(Number(amountValue) * 100);
    if (capturedProfileId !== profileId || !Number.isFinite(amountCents) || amountCents < 500) {
      return json({ error: 'Captured payment details could not be verified.' }, 400);
    }

    {
      let profile = await db.select().from(schema.profiles).where(eq(schema.profiles.handle, profileId)).get();
      if (!profile) {
        const profileRecord = {
          id: `prof_${profileId}_${Date.now()}`,
          handle: profileId,
          displayName: profileId,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          followerCount: 0,
          bio: `Verified @${profileId} on instabid.live`,
          isVerified: true,
          verifiedAt: Math.floor(Date.now() / 1000),
        };
        await db.insert(schema.profiles).values(profileRecord);
        profile = profileRecord;
      }

      const season = await db.select().from(schema.seasons).where(eq(schema.seasons.isActive, true)).get();
      const requestedCategory = categoryId
        ? await db.select().from(schema.categories).where(eq(schema.categories.id, categoryId)).get()
        : undefined;
      const category = requestedCategory || await db.select().from(schema.categories).get();
      if (!season || !category) return json({ error: 'Leaderboard is not configured.' }, 503);

      await db.insert(schema.bids).values({
        id: `bid_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`,
        profileId: profile.id,
        categoryId: category.id,
        seasonId: season.id,
        amountCents,
        description: `PayPal bid for @${profileId}`,
        paypalOrderId: orderId,
        status: 'active',
        createdAt: Math.floor(Date.now() / 1000),
      });
    }

    return json({ status: 'COMPLETED', profileId, amountPaid: amountCents / 100 });
  } catch (error) {
    console.error('PayPal capture-order failed', error);
    return json({ error: 'Unable to confirm PayPal payment.' }, 500);
  }
};
