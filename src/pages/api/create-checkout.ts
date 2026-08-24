import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any)?.runtime?.env || process.env;
    const body = await request.json();
    const { handle, categoryId, amountUSD, description } = body || {};

    if (!handle || typeof handle !== 'string') {
      return new Response(
        JSON.stringify({ error: 'A valid Instagram handle is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanHandle = handle.replace('@', '').trim().toLowerCase();
    const handleRegex = /^[a-zA-Z0-9._]{1,30}$/;
    if (!handleRegex.test(cleanHandle)) {
      return new Response(
        JSON.stringify({ error: 'Instagram handle must be 1-30 characters (letters, numbers, periods, underscores).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsedAmount = parseFloat(amountUSD);
    if (isNaN(parsedAmount) || parsedAmount < 5) {
      return new Response(
        JSON.stringify({ error: 'Minimum bid amount is $5.00 USD.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (parsedAmount > 50000) {
      return new Response(
        JSON.stringify({ error: 'Maximum bid limit exceeded ($50,000 USD).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanCategory = typeof categoryId === 'string' && categoryId.trim() ? categoryId.trim() : 'all';
    const cleanDescription = typeof description === 'string' ? description.trim().slice(0, 80) : '';
    const amountCents = Math.round(parsedAmount * 100);

    const stripeKey = env.STRIPE_SECRET_KEY;
    const siteUrl = env.PUBLIC_SITE_URL || new URL(request.url).origin || 'https://instabid.live';

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Live Stripe checkout is not configured. Add STRIPE_SECRET_KEY to enable production payments.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (stripeKey) {
      // Production Stripe Checkout Session
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2024-12-18.acacia' as any,
        httpClient: Stripe.createFetchHttpClient(),
      });

      // Generate distinct idempotency key based on handle, amount, and 5-minute bucket
      const timeBucket = Math.floor(Date.now() / (5 * 60 * 1000));
      const idempotencyKey = `chk_${cleanHandle}_${cleanCategory}_${amountCents}_${timeBucket}`;

      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `instabid.live Placement - @${cleanHandle}`,
                  description: `Leaderboard ad placement bid in ${cleanCategory} category.`,
                },
                unit_amount: amountCents,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${siteUrl}/?bid_success=true&handle=${cleanHandle}&amount=${parsedAmount.toFixed(2)}&cat=${cleanCategory}`,
          cancel_url: `${siteUrl}/?bid_canceled=true`,
          metadata: {
            handle: cleanHandle,
            categoryId: cleanCategory,
            amountCents: amountCents.toString(),
            description: cleanDescription,
          },
        },
        {
          idempotencyKey,
        }
      );

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Live payment provider is not configured for this environment.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Payment initialization failed.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
