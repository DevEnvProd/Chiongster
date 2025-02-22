"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import { supabase } from "@/lib/supabase"

interface ProfileFormData {
  username: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  countryCode: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("profileId")
    setUserId(userId)

    const fetchProfileData = async () => {
      try {
        if (userId) {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
          if (error) {
            throw error
          }
          setProfileData(data)
          setFormData({
            username: data.username || "",
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            phoneNumber: data.phone || "",
            countryCode: data.country_code || "",
          })
        } else {
          console.error("User ID not found in localStorage")
          setError("User not authenticated. Please log in again.")
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

  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "",
  })

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const userId = localStorage.getItem("profileId")
      if (!userId) {
        throw new Error("User not authenticated")
      }

      console.log(formData.firstName)

      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phoneNumber,
          //country_code: formData.countryCode,
        })
        .eq("id", userId)

      if (error) {
        throw error
      }

      alert("Profile updated successfully!")
      router.push("/profile")
    } catch (error: any) {
      setError(error.message || "Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">Edit Profile</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="px-4 space-y-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Username</label>
          <Input
            value={profileData?.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">First Name</label>
            <Input
              value={profileData?.first_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Last Name</label>
            <Input
              value={profileData?.last_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Email</label>
          <Input
            type="email"
            value={profileData?.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Phone Number</label>
          <div className="flex gap-2">
            <Select
              value={formData.countryCode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, countryCode: value }))}
            >
              <SelectTrigger className="w-[100px] bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+65">+65</SelectItem>
                <SelectItem value="+60">+60</SelectItem>
                <SelectItem value="+62">+62</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={profileData?.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="flex-1 bg-zinc-900 border-zinc-800"
            />
          </div>
        </div>

        <button
          type="button"
          className="text-[#FF2D92] text-sm font-medium"
          onClick={() => router.push("/profile/change-password")}
        >
          CHANGE PASSWORD
        </button>

        <Button
          type="submit"
          className="fixed rounded-lg bottom-10 left-5 right-5 h-16 bg-gradient-to-r from-[#6D1DDB] to-[#B31DC6] hover:from-[#6D1DDB]/90 hover:to-[#B31DC6]/90"
        >
          SAVE CHANGES
        </Button>
      </form>
    </div>
  )
}

