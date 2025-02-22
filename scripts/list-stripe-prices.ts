import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

async function listStripePrices() {
  try {
    const prices = await stripe.prices.list({
      expand: ["data.product"],
    })

    console.log("Available Prices:")
    prices.data.forEach((price) => {
      const product = price.product as Stripe.Product
      console.log(`\nProduct: ${product.name}`)
      console.log(`Price ID: ${price.id}`)
      console.log(`Amount: ${(price.unit_amount! / 100).toFixed(2)} ${price.currency}`)
      console.log(`Billing: ${price.recurring?.interval}`)
    })
  } catch (error) {
    console.error("Error listing prices:", error)
  }
}

// Run the function
listStripePrices()

