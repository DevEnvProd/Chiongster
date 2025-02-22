'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VenueCategory {
  id: number
  category_name: string
}

export function Hero() {
  const router = useRouter()
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenueCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("venue_category")
          .select("id, category_name")

        if (error) throw error

        setVenueCategories(data)
      } catch (error) {
        console.error("Error fetching venue categories:", error)
        setError("Failed to load venue categories.")
      } finally {
        setLoading(false)
      }
    }

    fetchVenueCategories()
  }, [])

  const handleShowNearby = () => {
    const category = selectedCategory || 'all' 
    router.push(`/category/${category}`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-1.5xl font-bold text-white font-futura mb-4">
        Discover Drinking Spots Near You
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      <Select onValueChange={(value) => setSelectedCategory(value)} disabled={loading}>
        <SelectTrigger className="w-full bg-zinc-700 text-white border-none shadow-none">
          <SelectValue placeholder={loading ? "Loading..." : "All Categories"} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 text-white border-none shadow-none">
          <SelectItem 
            value="all" 
            className="data-[state=checked]:bg-[#ff66a5]/20 data-[state=checked]:text-[#ffb3d9]
                 data-[highlighted]:bg-[#ff80b3]/30 data-[highlighted]:text-[#ffd1e6]"
          >
            All Categories
          </SelectItem>
          {venueCategories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="data-[state=checked]:bg-[#ff66a5]/20 data-[state=checked]:text-[#ffb3d9]
                 data-[highlighted]:bg-[#ff80b3]/30 data-[highlighted]:text-[#ffd1e6]"
            >
              {category.category_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className="w-full bg-gradient-to-r from-[#8E2DE2] to-[#F000FF] hover:from-[#7B27C1] hover:to-[#C000E0] text-white font-futura mt-4"
        onClick={handleShowNearby}
      >
        Show Nearby
      </Button>
    </div>
  )
}

