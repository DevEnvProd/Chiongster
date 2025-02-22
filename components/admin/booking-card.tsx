"use client"

import { useState } from "react"
import { Calendar, Clock, Users, Home } from "lucide-react"
import { QRScanner } from "./qr-scanner"
import { Button } from "@/components/ui/button"

interface BookingCardProps {
  booking: {
    id: string
    user_name: string
    booking_date: string
    booking_time: string
    pax: number
    room_size: string
    status: "pending" | "accepted" | "rejected"
    user_type: "REGULAR" | "CHIONGSTER" | "NEW" | "REFERRED"
    booked_at: string
    reservation_name: string
    isArrived?: string
    booking_unique_code: string
    hours_countdown?: string
  }
  onStatusChange: (bookingId: string, status: "accepted" | "rejected") => void
  onArrivalUpdate?: () => void
}

export function BookingCard({ booking, onStatusChange, onArrivalUpdate }: BookingCardProps) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)

  const userTypeBadgeStyles = {
    REGULAR: "bg-purple-500",
    CHIONGSTER: "bg-pink-600",
    NEW: "bg-yellow-500",
    REFERRED: "bg-green-500",
  }

  const handleArrivalSuccess = () => {
    if (onArrivalUpdate) {
      onArrivalUpdate()
    }
  }

  const renderActionButton = () => {
    switch (booking.status) {
      case "pending":
        return (
          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              onClick={() => onStatusChange(booking.id, "accepted")}
            >
              APPROVE
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 hover:bg-zinc-800 text-white font-medium"
              onClick={() => onStatusChange(booking.id, "rejected")}
            >
              REJECT
            </Button>
          </div>
        )
      case "accepted":
        return booking.isArrived === "yes" ? (
          <button disabled className="w-full py-3 bg-zinc-800 text-zinc-400 text-center font-medium">
            CUSTOMER ARRIVED
          </button>
        ) : (
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-center font-medium"
          >
            SCAN QR CODE
          </button>
        )
      case "rejected":
        return null
    }
  }

  return (
    <div className="relative bg-zinc-900 rounded-lg overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium">{booking.reservation_name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${userTypeBadgeStyles[booking.user_type]}`}>
            {booking.user_type}
          </span>
        </div>

        <div className="space-y-2 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{booking.booking_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Timing: {booking.booking_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{booking.pax} pax</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Room size {booking.room_size}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-500">
              {booking.status === "accepted"
                ? "Booking Confirmed"
                : booking.status === "rejected"
                  ? "Booking Rejected"
                  : "Pending Confirmation"}
            </span>
          </div>
          {booking.hours_countdown && (
            <span className="text-yellow-500">{booking.hours_countdown} hours unconfirmed</span>
          )}
        </div>
      </div>

      {renderActionButton()}

      {booking.status === "accepted" && (
        <QRScanner
          bookingId={booking.id}
          bookingCode={booking.booking_unique_code}
          onSuccess={handleArrivalSuccess}
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
        />
      )}
    </div>
  )
}

