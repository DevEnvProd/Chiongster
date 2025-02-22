"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon, ClockIcon, CheckCircle2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { supabase } from "@/utils/supabaseClient"
import UploadReceiptModal from "@/components/UploadReceiptModal"

interface PastBooking {
  id: string
  venue_id: string
  venue_name: string
  preferred_date: string
  session: string
  hasReceipt: boolean
  uploaded: string | null
}

export default function PastBookingPage() {
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPastBookings = async () => {
      try {
        const profileId = localStorage.getItem("profileId")
        if (!profileId) {
          throw new Error("User not authenticated")
        }

        const today = new Date().toISOString().split("T")[0]

        const { data, error } = await supabase
          .from("booking")
          .select(`
            id,
            venue_id,
            preferred_date,
            session,
            hasReceipt,
            uploaded
          `)
          .eq("user_id", profileId)
          .lt("preferred_date", today)
          .order("preferred_date", { ascending: false })

        if (error) throw error

        const { data: venueNameList, error: venueNameListError } = await supabase.from("venues").select(`
            id,
            venue_name,
            venue_category_id
          `)

        if (venueNameListError) throw venueNameListError

        const { data: venueCatList, error: venueCatListError } = await supabase.from("venue_category").select(`
            id,
            category_name
          `)

        const mergedBookings = data.map((booking) => {
          const venue = venueNameList.find((venue) => venue.id === booking.venue_id) || {}
          const venueCategory = venueCatList.find((category) => category.id === venue.venue_category_id) || {}

          return {
            ...booking,
            venue_name: venue.venue_name || "Unknown Venue",
            venue_category: venueCategory.category_name || "Unknown Category",
          }
        })

        setPastBookings(mergedBookings as PastBooking[])
      } catch (error) {
        console.error("Error fetching past bookings:", error)
        setError("Failed to load past bookings.")
      } finally {
        setLoading(false)
      }
    }

    fetchPastBookings()
  }, [])

  const handleBookAgain = (venueCategory: string, venueId: string) => {
    router.push(`/venue/${venueCategory}/${venueId}/booking?venue_id=${venueId}`)
  }

  const handleUploadReceipt = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setIsModalOpen(true)
  }

  const handleUploadSuccess = (bookingId: string, receiptPath: string) => {
    setPastBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, hasReceipt: true, uploaded: receiptPath } : booking,
      ),
    )
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm text-zinc-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link href="/my-bookings" className="hover:text-white">
          My Bookings
        </Link>
        <span>/</span>
        <span>Past Booking</span>
      </div>

      {/* Page Title */}
      <div className="px-4 pb-6">
        <h1 className="text-2xl font-bold">Past Bookings</h1>
        <p className="text-sm text-zinc-400">All bookings completed in the past 3 months</p>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="px-4">Loading past bookings...</div>
      ) : error ? (
        <div className="px-4 text-red-500">{error}</div>
      ) : pastBookings.length > 0 ? (
        <div className="px-4 space-y-6">
          {pastBookings.map((booking) => (
            <div key={booking.id} className="p-4 rounded-lg shadow-md border-b-6 border-zinc-700">
              <h2 className="text-lg font-semibold mb-1">{booking.venue_name}</h2>
              <div className="text-sm text-zinc-400 mb-2">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{booking.preferred_date}</span>
                </div>
              </div>
              <div className="text-sm text-zinc-400 mb-4">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{booking.session}</span>
                </div>
              </div>

              {booking.hasReceipt ? (
                <div className="flex flex-col gap-2 text-sm text-emerald-500 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt uploaded</span>
                  </div>
                  {booking.uploaded && (
                    <a
                      href={booking.uploaded}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View Receipt
                    </a>
                  )}
                  <button
                    className="w-full py-2 px-3 text-white border border-white rounded-lg hover:bg-zinc-800"
                    onClick={() => handleBookAgain(booking.venue_category, booking.venue_id)}
                  >
                    BOOK AGAIN
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 w-full">
                  <button
                    className="flex-1 py-2 px-3 rounded-lg hover:opacity-90 text-white bg-gradient-to-r from-pink-500 to-purple-500"
                    onClick={() => handleUploadReceipt(booking.id)}
                  >
                    UPLOAD RECEIPT
                  </button>
                  <button
                    className="flex-1 py-2 px-3 border border-white rounded-lg hover:bg-zinc-800"
                    onClick={() => handleBookAgain(booking.venue_category, booking.venue_id)}
                  >
                    BOOK AGAIN
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4">No past bookings found.</div>
      )}

      <Footer />

      {isModalOpen && (
        <UploadReceiptModal
          bookingId={selectedBookingId!}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}

