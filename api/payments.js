export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const PLANS = {
  individual: { price: 2900, name: 'UJRIS Individual', description: 'Full access — 1 user' },
  professional: { price: 7900, name: 'UJRIS Professional', description: 'Full access — up to 5 users, priority support' },
  firm: { price: 29900, name: 'UJRIS Firm', description: 'Full access — unlimited users, white-label, API access' },
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 503, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const { action, plan, email, successUrl, cancelUrl } = body;

  if (action === 'plans') {
    return new Response(JSON.stringify({ plans: PLANS }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (action === 'checkout') {
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const formData = new URLSearchParams({
      'mode': 'subscription',
      'success_url': successUrl || 'https://ujris.org/success',
      'cancel_url': cancelUrl || 'https://ujris.org/pricing',
      'customer_email': email || '',
      'line_items[0][price_data][currency]': 'gbp',
      'line_items[0][price_data][product_data][name]': selectedPlan.name,
      'line_items[0][price_data][product_data][description]': selectedPlan.description,
      'line_items[0][price_data][unit_amount]': String(selectedPlan.price),
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][quantity]': '1',
    });

    try {
      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!stripeRes.ok) {
        const err = await stripeRes.json();
        return new Response(JSON.stringify({ error: err.error?.message || 'Stripe error' }), {
          status: stripeRes.status, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }

      const session = await stripeRes.json();
      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Payment gateway error' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), {
    status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
