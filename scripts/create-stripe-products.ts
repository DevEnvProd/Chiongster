import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

async function createStripeProducts() {
  try {
    // Fetch packages from your database
    const { data: packages, error } = await supabase.from("packages").select("*")

    if (error) throw error

    for (const pkg of packages) {
      // Create or update Stripe product
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description || undefined,
        metadata: {
          package_id: pkg.id,
        },
      })

      // Create price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price * 100, // Convert to cents
        currency: "usd",
        recurring: {
          interval: pkg.billing_period === "monthly" ? "month" : "year",
        },
      })

      // Update package with Stripe price ID
      const { error: updateError } = await supabase
        .from("packages")
        .update({
          stripe_price_id: price.id,
          stripe_product_id: product.id,
        })
        .eq("id", pkg.id)

      if (updateError) throw updateError

      console.log(`Created product and price for package ${pkg.name}:`)
      console.log(`- Product ID: ${product.id}`)
      console.log(`- Price ID: ${price.id}`)
    }

    console.log("All products and prices created successfully!")
  } catch (error) {
    console.error("Error creating products:", error)
  }
}

// Run the function
createStripeProducts()

