"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { VenueCard } from "./venue-card"
import { supabase } from "@/lib/supabase"

interface VenueCategory {
  id: number
  category_name: string
  image_path: string
}

export function VenueSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenueCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("venue_category")
          .select("id, category_name, Image_Path, seq_in_menu")

        if (error) {
          throw error
        }

        // Sorting logic
        const sortedData = data.sort((a, b) => {
          if (a.seq_in_menu === null && b.seq_in_menu !== null) return 1
          if (b.seq_in_menu === null && a.seq_in_menu !== null) return -1
          if (a.seq_in_menu !== b.seq_in_menu) return a.seq_in_menu - b.seq_in_menu
          return a.category_name.localeCompare(b.category_name)
        })

        setVenueCategories(sortedData)
      } catch (error) {
        console.error("Error fetching venue categories:", error)
        setError("Failed to load venue categories")
      } finally {
        setLoading(false)
      }
    }

    fetchVenueCategories()
  }, [])


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Loading venues...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <section className="space-y-4 relative">
      <div className="space-y-1 text-center">
        <p className="text-[#FFD54A] text-base font-medium">Find Your Venue</p>
        <h2 className="text-3xl font-bold text-white font-futura">PICK YOUR PLACE</h2>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {venueCategories.map((venue) => (
          <div key={venue.id} className="flex-none w-[250px] snap-start">
            <VenueCard
              title={venue.category_name}
              image={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/venue_main/${venue.Image_Path}`}
              id={venue.id}
            />
          </div>
        ))}
      </div>
      {
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
            style={{ display: scrollPosition > 0 ? "block" : "none" }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
            style={{
              display:
                scrollPosition < (scrollRef.current?.scrollWidth ?? 0) - (scrollRef.current?.clientWidth ?? 0)
                  ? "block"
                  : "none",
            }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      }
    </section>
  )
}

