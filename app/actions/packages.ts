"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Package } from "@/types/package"

export async function getPackages() {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data, error } = await supabase
      .from("packages")
      .select("*, stripe_price_id")
      .order("price", { ascending: true })

    if (error) throw error

    return { packages: data as Package[], error: null }
  } catch (error) {
    console.error("Error fetching packages:", error)
    return { packages: null, error: "Failed to fetch packages" }
  }
}

export async function updateUserSubscription(packageId: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const userId = localStorage.getItem("profileId")
    //const { data: userData } = await supabase.auth.getUser()
    if (!userId) throw new Error("User not authenticated")

    const { data: packageData, error: packageError } = await supabase
      .from("packages")
      .select("duration")
      .eq("id", packageId)
      .single()

    if (packageError) throw packageError

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + packageData.duration)

    const { error } = await supabase
      .from("profiles")
      .update({
        plan_id: packageId,
        plan_expired_date: expirationDate.toISOString(),
        tier_id: 2,
      })
      .eq("id", userId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Error updating user subscription:", error)
    return { error: "Failed to update user subscription" }
  }
}

