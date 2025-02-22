import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  if (req.method === "POST") {
    try {
      const { sessionId } = await req.json()

      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status === "paid") {
        // The payment was successful
        return NextResponse.json({
          success: true,
          packageId: session.metadata?.packageId,
        })
      } else {
        return NextResponse.json({
          success: false,
          error: "Payment not completed",
        })
      }
    } catch (err: any) {
      console.error("Error verifying subscription:", err)
      return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: { message: "Method Not Allowed" } }, { status: 405 })
  }
}

