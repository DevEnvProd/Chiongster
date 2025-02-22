import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const { packageId, priceId } = await req.json()

    // Get the user's ID from Supabase auth
    /*const {
      data: { user },
    } = await supabase.auth.getUser()*/

    const user = localStorage.getItem("profileId")

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUid: user,
        },
      })
      customerId = customer.id

      // Save Stripe customer ID to profile
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user)
    }

    // Get the origin from the request
    const origin = "https://dpxqa5gppt7vac2f8.lite.vusercontent.net/"

    //const origin = req.headers.get("origin") || "http://localhost:3000"

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe/select-plan`,
      metadata: {
        packageId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.error("Error creating checkout session:", err)
    return NextResponse.json({ error: err.message || "Error creating checkout session" }, { status: 500 })
  }
}

