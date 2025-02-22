"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { updateUserSubscription } from "@/app/actions/packages"

export default function SubscriptionSuccessClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (sessionId) {
      // Verify the session and update the user's subscription
      fetch("/api/verify-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then(({ success, packageId, error }) => {
          if (success && packageId) {
            return updateUserSubscription(packageId)
          } else {
            throw new Error(error || "Failed to verify subscription")
          }
        })
        .then(({ error }) => {
          if (error) {
            throw new Error(error)
          }
        })
        .catch((error) => {
          console.error("Error updating subscription:", error)
          setError(error.message || "Failed to update subscription")
        })
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Subscription Error</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/subscribe/select-plan")}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
        <p className="mb-4">Thank you for subscribing to Pro Chiongster.</p>
        <Button onClick={() => router.push("/")}>Go to Homepage</Button>
      </div>
    </div>
  )
}

