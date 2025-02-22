"use client"

import Link from "next/link"
import { Pen } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("profileId")
    console.log(userId)
    const fetchProfileData = async () => {
      try {
        if (userId) {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
          if (error) {
            throw error
          }
          setProfileData(data)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
        setError("Failed to load profile data.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">See Profile</span>
      </div>

      {/* Profile Content */}
      <div className="px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">See Profile</h1>
          <button onClick={() => router.push("/profile/edit?userId=${userId}")} className="p-2">
            <Pen className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div>Loading profile data...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : profileData ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Username</label>
              <p className="text-white">{profileData.username}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-zinc-400">First Name</label>
                <p className="text-white">{profileData.first_name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-zinc-400">Last Name</label>
                <p className="text-white">{profileData.last_name || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Email Address</label>
              <p className="text-white">{profileData.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Phone Number</label>
              <p className="text-white">
                {profileData.phone_number ? `(+${profileData.country_code})${profileData.phone_number}` : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div>No profile data found.</div>
        )}
      </div>
    </div>
  )
}

