import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@14"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
})

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
)

const PRICE_TIER_MAP: Record<string, string> = {
  [Deno.env.get("STRIPE_PLUS_PRICE_ID") ?? ""]: "plus",
  [Deno.env.get("STRIPE_PRO_PRICE_ID") ?? ""]: "pro",
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) return

  const priceId = subscription.items.data[0]?.price?.id ?? ""
  const tier = PRICE_TIER_MAP[priceId] ?? "plus"
  const status = subscription.status   // active, past_due, canceled, etc.
  const isActive = status === "active" || status === "trialing"

  // Upsert into subscriptions table
  await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status,
    tier: isActive ? tier : "free",
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" })

  // Update profiles table
  await supabase.from("profiles").update({
    subscription_tier: isActive ? tier : "free",
    subscription_status: status,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString(),
  }).eq("id", userId)
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const signature = req.headers.get("stripe-signature")
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = await stripe.webhooks.constructEventAsync(body, signature ?? "", webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed"
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          )
          // Ensure metadata flows from session to subscription
          if (session.metadata?.supabase_user_id && !subscription.metadata?.supabase_user_id) {
            await stripe.subscriptions.update(subscription.id, {
              metadata: { supabase_user_id: session.metadata.supabase_user_id },
            })
          }
          await syncSubscription(subscription)
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (userId) {
          await supabase.from("profiles").update({
            subscription_tier: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          }).eq("id", userId)

          await supabase.from("subscriptions").update({
            status: "canceled",
            tier: "free",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq("stripe_subscription_id", sub.id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
