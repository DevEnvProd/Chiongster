import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer as string)

        // Update user's subscription in your database
        if (session.metadata?.packageId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              plan_id: session.metadata.packageId,
              stripe_customer_id: customer.id,
              subscription_status: "active",
              subscription_period_end: new Date(session.expires_at! * 1000).toISOString(),
            })
            .eq("id", session.client_reference_id)

          if (error) {
            console.error("Error updating subscription:", error)
            return NextResponse.json({ error: "Error updating subscription" }, { status: 500 })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status in your database
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: subscription.status,
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer)

        if (error) {
          console.error("Error updating subscription:", error)
          return NextResponse.json({ error: "Error updating subscription" }, { status: 500 })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status to cancelled
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            plan_id: null,
          })
          .eq("stripe_customer_id", subscription.customer)

        if (error) {
          console.error("Error cancelling subscription:", error)
          return NextResponse.json({ error: "Error cancelling subscription" }, { status: 500 })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

