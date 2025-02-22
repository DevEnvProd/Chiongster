"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { updateUserSubscription } from "./packages"

export async function createCheckoutSession(packageId: string, stripePriceId: string, duration: number) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const user = localStorage.getItem("profileId")
    /*const {
      data: { user },
    } = await supabase.auth.getUser()*/

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Simulate successful payment
    const success = true

    if (success) {
      // Update user's subscription
      const { error: updateError } = await updateUserSubscription(user, packageId, duration)
      if (updateError) {
        throw new Error(updateError)
      }
    }

    return { success, error: null }
  } catch (error) {
    console.error("Error processing subscription:", error)
    return { success: false, error: "Failed to process subscription" }
  }
}

