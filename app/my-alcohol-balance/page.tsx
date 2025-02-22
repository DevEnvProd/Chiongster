"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, MapPin } from "lucide-react"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface AlcoholItem {
  id: string
  name: string
  quantity: number
  expiry_date: string
  venue_id: string
  image: string
  reminder: number
  location?: string
  venue_name?: string
}

export default function AlcoholBalancePage() {
  const [alcoholItems, setAlcoholItems] = useState<AlcoholItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
      const storedUserId = localStorage.getItem("profileId")
      setUserId(storedUserId)
      
    const fetchAlcoholBalance = async () => {
      try {
        setLoading(true)

        if (!storedUserId) {
          throw new Error("User not authenticated")
        }

        const { data: balancesData, error: balancesDataError } = await supabase
          .from("alcohol_balance")
          .select(`*`)
          .eq("user_id", userId)

        if (balancesDataError) {
          throw balancesDataError
        }

        const { data: venuesData, error: venuesDataError } = await supabase
          .from("venues")
          .select(`id, venue_name`)

          const mergedData = balancesData.map(balance => {
            const venue = venuesData.find(v => v.id === balance.venue_id);
            return {
              ...balance,
              venue_name: venue ? venue.venue_name : "Unknown Venue", // Fallback if no match
            };
          });

        setAlcoholItems(mergedData)
      } catch (error: any) {
        console.error("Error fetching alcohol balance:", error)
        setError(error.message || "Failed to load alcohol balance.")
      } finally {
        setLoading(false)
      }
    }

    fetchAlcoholBalance()
  }, [userId])

  const getExpiryStatus = (item: AlcoholItem) => {
    const today = new Date()
    const expiryDate = new Date(item.expiry_date)
    const timeLeft = expiryDate.getTime() - today.getTime()
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

    if (daysLeft <= 0) {
      return "Expired"
    } else if (daysLeft <= item.reminder) {
      return `Expiring in ${daysLeft} days`
    }

    return null
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
        <span className="text-zinc-400">My Alcohol Balance</span>
      </div>

      {/* Header */}
      <div className="px-4 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-furuta font-bold">My Alcohol Balance</h1>
        <Link href="/my-alcohol-balance/add">
          <Button size="sm" className="text-pink-600 underline bg-transparent border-none hover:no-underline">
            <Plus className="w-4 h-4 mr-2" />
            ADD NEW
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="px-4 mb-6">
        <div className="flex justify-end items-center gap-2">
          <span className="text-sm font-furuta">Showing</span>
          <Select defaultValue="upcoming">
            <SelectTrigger className="w-[160px] bg-zinc-900/90 border-zinc-800 font-furuta">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alcohol Items List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div>Loading alcohol balance...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : alcoholItems.length > 0 ? (
          alcoholItems.map((item) => (
            <div key={item.id} className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/alcoholbalance/${item.image_paths}`}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="text-base font-medium">{item.alcohol_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Expiry: {item.expiry_date}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-zinc-400 mt-1">
                    <MapPin className="w-4 h-4" />
                    <Link href={`/venue/${item.venue_id}`}>
                      <span className="underline cursor-pointer">{item.venue_name}</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-medium">x{item.quantity}</span>
                {getExpiryStatus(item) && (
                  <span
                    className={`text-xs ${getExpiryStatus(item) === "Expired" ? "text-red-500" : "text-amber-500"}`}
                  >
                    {getExpiryStatus(item)}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>No alcohol balance found.</div>
        )}
      </div>
      <Footer />
    </div>
  )
}

