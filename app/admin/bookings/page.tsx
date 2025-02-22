"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { BookingCard } from "@/components/admin/booking-card"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type BookingStatus = "pending" | "accepted" | "rejected"
type ShowingFilter = "all" | "arrived" | "not-arrived"

interface Booking {
  id: string
  user_name: string
  booking_date: string
  booking_time: string
  pax: number
  room_size: string
  status: BookingStatus
  user_type: "REGULAR" | "CHIONGSTER" | "NEW" | "REFERRED"
  booked_at: string
  reservation_name: string
  isArrived: boolean
  booking_unique_code: string
  hours_countdown?: string
}

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus>("accepted")
  const [showingFilter, setShowingFilter] = useState<ShowingFilter>("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem("adminSession")
      if (!session) {
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const adminSession = JSON.parse(localStorage.getItem("adminSession") || "{}")
      const managerProfileId = adminSession.user?.managerProfileId

      console.log(managerProfileId)

      if (!managerProfileId) {
        throw new Error("Manager profile ID not found")
      }

      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("id")
        .textSearch("manager_id", `"${managerProfileId}"`);

      console.log(venueData)

      if (venueError) throw venueError

      if (!venueData || venueData.length === 0) {
        throw new Error("No venues found for this manager")
      }

      const venueIds = venueData.map((venue) => venue.id)

      let query = supabase
        .from("booking")
        .select(`
          id,
          venue_id,
          user_id,
          preferred_date,
          session,
          pax,
          room_no,
          status,
          reservation_name,
          created_at,
          isArrived,
          booking_unique_code
        `)
        .in("venue_id", venueIds)
        .eq("status", activeTab)
        .order("created_at", { ascending: false })

      if (showingFilter !== "all") {
        query = query.eq("isArrived", showingFilter === "arrived")
      }

      const { data, error } = await query

      if (error) throw error

      const formattedBookings = data.map((booking) => ({
        id: booking.id,
        user_name: "Unknown User",
        booking_date: new Date(booking.preferred_date).toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        booking_time: booking.session,
        pax: booking.pax,
        room_size: booking.room_no,
        status: booking.status,
        user_type: "REGULAR",
        booked_at: new Date(booking.created_at).toLocaleString(),
        reservation_name: booking.reservation_name,
        isArrived: booking.isArrived,
        booking_unique_code: booking.booking_unique_code,
        hours_countdown: "3 hours", // You might want to calculate this based on booking time
      }))

      setBookings(formattedBookings)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [activeTab, showingFilter]) //Fixed missing dependency

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const { error } = await supabase.from("booking").update({ status: newStatus }).eq("id", bookingId)

      if (error) throw error

      toast.success(`Booking ${newStatus} successfully`)
      fetchBookings()
    } catch (err) {
      console.error("Error updating booking status:", err)
      toast.error("Failed to update booking status")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Current Bookings</h1>
          <div className="flex border-b border-zinc-800">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "pending"
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "accepted"
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
              onClick={() => setActiveTab("accepted")}
            >
              Accepted
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "rejected"
                  ? "text-zinc-500 border-b-2 border-zinc-500"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
              onClick={() => setActiveTab("rejected")}
            >
              Rejected
            </button>
          </div>
        </div>

        {activeTab === "accepted" && (
          <div className="mb-4">
            <Select value={showingFilter} onValueChange={(value) => setShowingFilter(value as ShowingFilter)}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-0">
                <SelectValue placeholder="Showing All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="not-arrived">Not Arrived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">No {activeTab} bookings found</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                onArrivalUpdate={fetchBookings}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

