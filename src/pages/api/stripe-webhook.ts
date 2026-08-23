import type { APIRoute } from 'astro';
import { getDb, schema } from '@/db';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env || process.env;
  const stripeKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return new Response(
      JSON.stringify({ message: 'Stripe webhook handler active (demo mode - keys not configured).' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature header.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = await request.text();
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-12-18.acacia' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const metadata = session.metadata || {};
      const handle = (metadata.handle || '').toLowerCase().trim();
      const categoryId = metadata.categoryId || 'all';
      const amountCents = parseInt(metadata.amountCents || '0', 10);
      const description = metadata.description || '';
      const stripePaymentId = session.payment_intent || session.id;

      if (handle && amountCents > 0) {
        const db = getDb(env);

        if (db) {
          // 1. Ensure profile exists or update it
          const existingProfile = await db
            .select()
            .from(schema.profiles)
            .where(eq(schema.profiles.handle, handle))
            .get();

          let profileId = existingProfile?.id;

          if (!existingProfile) {
            profileId = `prof_${handle}_${Date.now()}`;
            await db.insert(schema.profiles).values({
              id: profileId,
              handle: handle,
              displayName: handle,
              avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
              followerCount: 5000,
              bio: description || `Verified @${handle} on instabid.live`,
              isVerified: true,
              verifiedAt: Math.floor(Date.now() / 1000),
            });
          }

          // 2. Check for duplicate webhook processing (idempotency)
          const existingBid = await db
            .select()
            .from(schema.bids)
            .where(eq(schema.bids.stripePaymentId, stripePaymentId))
            .get();

          if (!existingBid && profileId) {
            // Find active season or create default
            const activeSeason = await db
              .select()
              .from(schema.seasons)
              .where(eq(schema.seasons.isActive, true))
              .get();

            const seasonId = activeSeason?.id || 'season-24';

            // Insert confirmed active bid
            await db.insert(schema.bids).values({
              id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              profileId: profileId,
              categoryId: categoryId,
              seasonId: seasonId,
              amountCents: amountCents,
              description: description,
              stripePaymentId: stripePaymentId,
              status: 'active',
              createdAt: Math.floor(Date.now() / 1000),
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Webhook error: ${err.message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
