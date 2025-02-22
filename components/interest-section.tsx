"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Tag {
  id: number
  tag_name: string
  icon_url: string
  seq_in_homepage: number | null
}

export function InterestSection() {
  const [interests, setInterests] = useState<Tag[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from("recommended_tags")
        .select("id, tag_name, icon_url, seq_in_homepage")
        .eq("status", "enabled")
        .order("seq_in_homepage", { ascending: true, nullsLast: true })

      if (error) {
        console.error("Error fetching tags:", error)
      } else {
        setInterests(data || [])
      }
    }

    fetchTags()
  }, [supabase])

  return (
    <section className="space-y-4">
      <div className="space-y-1 text-center">
        <p className="text-[#FFD54A] text-base font-medium">Tailor Your Experience</p>
        <h2 className="text-3xl font-bold text-white font-futura">DISCOVER BY INTEREST</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {interests.map(({ id, tag_name, icon_url }) => (
          <button
            key={id}
            className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-lg space-y-2 hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 relative">
              <Image src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/${icon_url}`} alt={tag_name} layout="fill" objectFit="contain" />
            </div>
            <span className="text-base font-medium">{tag_name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

