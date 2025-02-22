"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { getPackages } from "@/app/actions/packages"
import { supabase } from "@/lib/supabase"
import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SelectPlanPage() {
  const router = useRouter()
  const [packages, setPackages] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchPackages = async () => {
      const { packages: pkgs, error } = await getPackages()
      if (error) {
        setError(error)
        return
      }
      setPackages(pkgs || [])
    }

    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }

    fetchPackages()
    checkAuth()
  }, [router])

  const handleSelectPlan = async (pkg) => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: pkg.id,
          priceId: pkg.stripe_price_id,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe failed to initialize")
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })

      if (stripeError) {
        throw stripeError
      }
    } catch (err) {
      console.error("Error processing subscription:", err)
      setError("Failed to process subscription. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price) => (price === 0 ? "Free" : `$${price}`)
  const getBillingLabel = (period, price) => {
    switch (period) {
      case "free":
        return ""
      case "daily":
        return "Billed daily"
      case "monthly":
        return "Billed monthly"
      case "yearly":
        return `Billed yearly $${(price * 12).toFixed(2)}/year`
      default:
        return ""
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="px-4 py-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <Link href="/subscribe" className="text-zinc-400 hover:text-white">
          Subscribe to Pro Chiongster
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">Select Membership Plan</span>
      </div>

      {/* Main Content */}
      <div className="px-4 max-w-md mx-auto pb-8">
        <h1 className="text-2xl font-bold mb-6">Select Your Membership Plan</h1>

        <div className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-zinc-900/50 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">{pkg.name}</h3>
                <div className="flex items-baseline mt-1">
                  <span className="text-2xl font-bold">{formatPrice(pkg.price)}</span>
                  {pkg.billing_period !== "free" && (
                    <span className="ml-1 text-sm text-zinc-400">
                      {pkg.billing_cycle === "monthly" ? "/month" : "/day"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1">{getBillingLabel(pkg.billing_cycle, pkg.price)}</p>
              </div>

              <Button
                onClick={() => handleSelectPlan(pkg)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#6D1DDB] to-[#B31DC6] hover:from-[#6D1DDB]/90 hover:to-[#B31DC6]/90"
              >
                {isLoading ? "Processing..." : "SELECT PLAN"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

