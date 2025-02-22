"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { BookingConfirmationView } from "@/components/booking/booking-confirmation"
import { RedeemedItemsSection } from "@/components/booking/redeem-items-section"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

interface CurrentBooking {
  id: string
  booking_unique_code: string
  preferred_date: string
  session: string
  pax: number
  room_no: string
  manager: string
  notes: string
  venue_id: string
  modified_at: string
}

interface VenueInfo {
  venue_name: string
  venue_address: string
}


interface RedemptionData {
  itemsCount: number
  totalPoints: number
}

export default function CurrentBookingPage() {
  const [currentBooking, setCurrentBooking] = useState<CurrentBooking | null>(null)
  const [redemptionData, setRedemptionData] = useState<RedemptionData | null>(null)
  const [venueData, setVenueData] = useState<VenueInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCurrentBookingAndRedemption = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const profileId = localStorage.getItem("profileId")
        if (!profileId) {
          throw new Error("User not authenticated")
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Fetch current booking
        const { data: bookingData, error: bookingError } = await supabase
          .from("booking")
          .select(`*`)
          .eq("user_id", profileId)
          .gte("preferred_date", today.toISOString())
          .order("preferred_date", { ascending: true })
          .limit(1)
          .single()

        if (bookingError && bookingError.code !== "PGRST116") throw bookingError // Ignore "no rows found" error

        if (!bookingData) {
          // No booking found, so set states to null/empty and return early
          setCurrentBooking(null)
          setVenueData(null)
          setRedemptionData({ itemsCount: 0, totalPoints: 0 })
          return
        }

        // Fetch venue details
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select(`*`)
          .eq("id", bookingData.venue_id)
          .limit(1)
          .single()

        if (venueError) throw venueError

        setCurrentBooking(bookingData)
        setVenueData(venueData)

        // Fetch redemption data
        const { data: redemptionData, error: redemptionError } = await supabase
          .from("redemption")
          .select("id, quantity, amount")
          .eq("booking_id", bookingData.id)

        if (redemptionError) throw redemptionError

        const itemsCount = redemptionData
          ? redemptionData.reduce((sum, item) => sum + (item.quantity || 0), 0)
          : 0
        const totalPoints = redemptionData
          ? redemptionData.reduce((sum, item) => sum + (item.amount || 0), 0)
          : 0

        setRedemptionData({ itemsCount, totalPoints })
        console.log(redemptionData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch booking data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentBookingAndRedemption()
  }, [])

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (!currentBooking) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">You don't have any upcoming bookings.</p>
        <Button onClick={() => router.push("/")}>Book Now</Button>
      </div>
    )
  }

  const formattedDate = new Date(currentBooking.modified_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Your Upcoming Booking</h1>
      <div className="space-y-6">
        <BookingConfirmationView
          bookingConfirmation={currentBooking}
          venueDetails={{
            venue_name: venueData.venue_name,
            address: venueData.venue_address,
          }}
        />
        {redemptionData?.length > 0 && (
          <RedeemedItemsSection
            bookingCode={currentBooking.redemption_code}
            itemsCount={redemptionData.length}
            redemptionDate={formattedDate}
            points={redemptionData.reduce((acc, item) => acc + item.points, 0)} // Example if totalPoints needs summing
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

