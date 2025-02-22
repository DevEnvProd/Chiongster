"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"
import { supabase } from "@/lib/supabase"

interface BookingConfirmationViewProps {
  bookingConfirmation: any
  venueDetails: any
  redemptions: any
  isCurrentBooking?: boolean
}

export function BookingConfirmationView({
  bookingConfirmation,
  venueDetails,
  redemptions,
  isCurrentBooking = false,
}: BookingConfirmationViewProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [redeemedItems, setRedeemedItems] = useState<any>(null)
  const [showRedemptionModal, setShowRedemptionModal] = useState(false)
  const [redemptionQrCode, setRedemptionQrCode] = useState<string | null>(null)

  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        const { data: redemptionData, error: redemptionDataError } = await supabase
          .from("redemption")
          .select("*")
          .eq("booking_id", bookingConfirmation.id)

        if (redemptionDataError) throw redemptionDataError

        console.log("✅ Redemption Data:", redemptionData)
        setRedeemedItems(redemptionData)
      } catch (error) {
        console.error("❌ Error fetching redemptions:", error)
      }
    }

    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(bookingConfirmation.booking_unique_code)
        console.log("✅ QR Code URL:", url)
        setQrCode(url)
      } catch (err) {
        console.error("❌ Failed to generate QR code:", err)
      }
    }

    fetchRedemptions()
    generateQR()
  }, [bookingConfirmation.booking_unique_code, bookingConfirmation.id])

  const handleShowRedemptionCode = async () => {
    try {
      if (!bookingConfirmation.redemption_code) {
        console.error("❌ No redemption code found!")
        return
      }

      const qrCodeUrl = await QRCode.toDataURL(bookingConfirmation.redemption_code)
      setRedemptionQrCode(qrCodeUrl)
      setShowRedemptionModal(true)
    } catch (err) {
      console.error("❌ Failed to generate redemption QR code:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Booking Header */}
      {/* Booking Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          {venueDetails?.venue_name || "Venue Name"}
          <span className="text-amber-500">#{bookingConfirmation.id}</span>
        </h2>
        <p className="text-sm text-zinc-400">{venueDetails?.address || "Venue Address"}</p>
      </div>

      {/* Date and Time */}
      <div className="bg-zinc-900 rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-bold flex justify-between items-center w-full">
          <span>{venueDetails?.venue_name || "Venue Name"}</span>
          <span className="text-amber-500">#{bookingConfirmation.booking_unique_code}</span>
        </h2>
        <div className="flex gap-4 text-sm">
          <div className="flex-1">
            <p className="text-zinc-400">{venueDetails?.address || "Venue Address"}</p>
            <p className="text-zinc-400">
              Date :{" "}
              {new Date(bookingConfirmation.preferred_date).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-zinc-400">Timing: {bookingConfirmation.session}</p>
          </div>
        </div>
      </div>

      {/* Check-in Details */}
      <div className="bg-zinc-900 rounded-lg p-4 space-y-4">
        <h3 className="font-medium">Check in Details</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-zinc-400">No of Pax</span>
            <span>: {bookingConfirmation.pax}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-zinc-400">Room No</span>
            <span>: {bookingConfirmation.room_no || "[Room Number]"}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-zinc-400">Manager</span>
            <span>: {bookingConfirmation.manager || "N/A"}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="text-zinc-400">Notes</span>
            <span>: {bookingConfirmation.notes || "None"}</span>
          </div>
        </div>

        {qrCode && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-zinc-400">Upon arrival, please get this QR Code scanned</p>
            <Image
              src={qrCode || "/placeholder.svg"}
              alt="Check-in QR Code"
              width={200}
              height={200}
              className="bg-white p-2 rounded-lg"
            />
          </div>
        )}

        {isCurrentBooking ? (
          <Button className="w-full bg-green-600 hover:bg-green-700">Check In</Button>
        ) : (
          <Button variant="outline" className="w-full border-pink-600 text-pink-600 hover:bg-pink-600/10">
            CANCEL BOOKING
          </Button>
        )}
      </div>

      {/* Redemption Section */}
      {redeemedItems && redeemedItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Redeemed Items</h3>
          <div className="bg-zinc-900/90 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">#{bookingConfirmation.redemption_code}</p>
                <p className="text-sm text-zinc-400">
                  {redeemedItems.reduce((total, item) => total + (item.quantity || 0), 0)} items •{" "}
                  {new Date().toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span>
                  {redeemedItems.reduce((total, item) => total + (item.amount || 0), 0)}
                </span>

                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                  alt="coins"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <span className="text-zinc-400 ml-1">›</span>
              </div>
            </div>

            {/* Redemption Code Button */}
            <button
              className="w-full text-left text-sm text-rose-500 mt-2 hover:text-rose-400 transition-colors"
              onClick={handleShowRedemptionCode}
            >
              SHOW REDEMPTION CODE
            </button>
          </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">REDEEM MORE ITEMS</Button>
        </div>
      )}

      {/* Redemption Code Modal */}
      {showRedemptionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Redemption QR Code</h3>
            {redemptionQrCode ? (
              <Image
                src={redemptionQrCode}
                alt="Redemption QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
            ) : (
              <p className="text-gray-500">Generating QR code...</p>
            )}
            <button
              className="mt-4 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => setShowRedemptionModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

