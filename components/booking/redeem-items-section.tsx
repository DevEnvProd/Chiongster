"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, X } from "lucide-react"
import Image from "next/image"
import QRCode from "react-qr-code"

interface RedeemedItemsSectionProps {
  bookingCode: string
  itemsCount: number
  redemptionDate: string
  points: number
}

export function RedeemedItemsSection({ bookingCode, itemsCount, redemptionDate, points }: RedeemedItemsSectionProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="w-full space-y-4 mt-6">
      <h3 className="font-medium">Redeemed Items</h3>
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">#{bookingCode}</p>
            <p className="text-sm text-zinc-400">
              {itemsCount} items • {redemptionDate}
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <span className="font-medium">{points}</span>
            <Image src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`} alt="coins" width={16} height={16} className="rounded-full" />
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full text-left text-sm text-rose-500 mt-2 hover:text-rose-400 transition-colors"
        >
          SHOW REDEMPTION CODE
        </button>
      </div>
      <Button className="w-full bg-purple-600 hover:bg-purple-700">REDEEM MORE ITEMS</Button>

      {/* QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-zinc-900 rounded-lg p-6 shadow-lg w-80 text-center relative">
            {/* Close Button */}
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-white hover:text-red-400">
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-lg font-medium text-white mb-4">Scan to Redeem</h3>
            <div className="bg-white p-2 rounded">
              <QRCode value={`${bookingCode}`} size={200} style={{display: "inline"}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

