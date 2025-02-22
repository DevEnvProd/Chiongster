"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"
import type { VenueMenuItem, ImagePromotion } from "@/types/venue"


interface VenueMenuProps {
  venueId: string
}

export function VenueMenu({ venueId }: VenueMenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [venueMenu, setVenueMenu] = useState<VenueMenuItem[]>([])
  const [imagePromotion, setImagePromotion] = useState<ImagePromotion[]>([])


  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  useEffect(() => {
    const profileId = localStorage.getItem("profileId")
    setUserId(profileId)
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      // Fetch venue menu data
      const { data: menuData, error: menuError } = await supabase
        .from("venue_menu")
        .select("*")
        .eq("venue_id", venueId)

      if (menuError) throw menuError
      setVenueMenu(menuData || [])

      // Fetch promotion image data
      const { data: imagePromotionData, error: imagePromotionError } = await supabase
        .from("images_path")
        .select("id, image_path")
        .eq("venue_id", venueId)
        .eq("type", "Promotion")

      if (imagePromotionError) throw imagePromotionError
      setImagePromotion(imagePromotionData || [])
      console.log(imagePromotionData)

    } catch (error) {
      console.error("Error fetching menu items and promotion images:", error.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Must Try Section */}
      {venueMenu.length > 0 && (
        <div>
          <h2 className="text-white text-lg font-bold mb-4">MUST TRY</h2>
          <div className="space-y-2">
            {venueMenu.map((item) => (
              <div key={item.id} className="bg-[#1A1A1A] rounded-lg p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{item.item_name}</h3>
                  <p className="text-gray-400 text-sm">{item.item_description}</p>
                </div>
                <div className="text-[#FFD700]">${item.original_price ?? "N/A"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Promotion Section */}
      <div>
        <h2 className="text-white text-lg font-bold mb-4">ALL PROMOTION</h2>
        <div className="grid grid-cols-2 gap-4">
          {imagePromotion.length > 0 ? (
            imagePromotion.flatMap((item) => {
              // Parse `image_paths` if it's a stringified array
              let paths = [];
              try {
                paths = Array.isArray(item.image_path)
                  ? item.image_path
                  : JSON.parse(item.image_path); // Safely parse
              } catch {
                console.error("Invalid image_paths format", item.image_path);
                paths = []; // Fallback to an empty array
              }

              return paths.map((path, index) => (
                <div key={`${item.id}-${index}`} className="aspect-square relative">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/promotions/${path}`}
                    className="w-full h-full object-cover rounded-lg"
                    alt={`Promotion Image ${index + 1}`}
                  />
                </div>
              ));
            })
          ) : (
            <div className="col-span-full text-center text-gray-500">No images available</div>
          )}
        </div>
      </div>

    </div>
  )
}

