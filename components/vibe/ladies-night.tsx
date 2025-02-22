"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface VenueCategory {
  id: string
  category_name: string
  image_url?: string
}

const LadiesNight = () => {
  const [categories, setCategories] = useState<VenueCategory[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("venue_category").select("id, category_name, Image_Path")

      if (error) {
        console.error("Error fetching categories:", error)
        return
      }

      setCategories(data || [])
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Ladies Night</span>
      </div>

      {/* Hero Banner */}
      <div className="relative h-48 w-full">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7xY6myHwxKF2iFLvTlxaLzVeQCEAkN.png"
          alt="Ladies Night"
          fill
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">LADIES NIGHT</h1>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Select Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}?filter=LN`}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/venue_main/${category.Image_Path}`}
                alt={category.category_name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-medium">{category.category_name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

export default LadiesNight

