"use client"

import { useState, useEffect } from "react"
import { Martini, Users, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { VenueDamage } from "@/types/venue"

interface VenueInfoProps {
  venueId: string
}

export function VenueInfo({ venueId }: VenueInfoProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [venueDamage, setVenueDamage] = useState<VenueDamage[]>([])

  useEffect(() => {
    const profileId = localStorage.getItem("profileId")
    setUserId(profileId)
    fetchDamage()
  }, [])

  const fetchDamage = async () => {
    console.log(venueId)
    try {
      const { data, error } = await supabase
        .from("venue_damage")
        .select("*")
        .eq("venue_id", venueId)

      if (error) throw error

      setVenueDamage(data)
    } catch (error) {
      console.error("Error fetching damages:", error.message)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {venueDamage.map((room) => (
          <div key={room.id} className="bg-zinc-900 rounded-lg p-4 space-y-4">
            <h3 className="font-medium">{room.title}</h3>
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">
                  <Users />
                </span>
                <span className="font-bold">No. of Pax:</span> {room.pax}
              </div>
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">
                  <Martini />
                </span>
                <span className="font-bold">Min Spend:</span> {room.min_spend}
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <span className="text-zinc-400">Happy Hour</span>
                <span className="col-span-2">{room.happy_hours}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <span className="text-zinc-400">Night Hour</span>
                <span className="col-span-2">{room.night_hours}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <span className="text-zinc-400">Morning Hour</span>
                <span className="col-span-2">{room.morning_hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

