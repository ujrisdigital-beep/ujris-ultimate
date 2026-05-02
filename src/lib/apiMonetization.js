// UJRIS API Monetization (G4 - 8hrs)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function trackAPIUsage(userId, endpoint, tokensUsed) {
  const pricing = {
    '/api/analyze': 0.01, // £0.01 per call
    '/api/forensic': 0.02, // £0.02 per forensic analysis
    '/api/timeline': 0.005, // £0.005 per timeline generation
  };

  const cost = pricing[endpoint] * tokensUsed || 0.01;

  await stripe.usageRecords.create({
    customer: userId,
    quantity: Math.round(cost * 100), // Convert to pence
    timestamp: Math.floor(Date.now() / 1000),
  });

  // Also log to Supabase for analytics
  await supabase.from('api_usage').insert({
    user_id: userId,
    endpoint,
    tokens_used: tokensUsed,
    cost_gbp: cost,
    timestamp: new Date()
  });
}

// Add to all API routes:
// await trackAPIUsage(req.user.id, req.url, response.usage);
