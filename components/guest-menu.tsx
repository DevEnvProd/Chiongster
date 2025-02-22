"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Search, Coins, Diamond, Wine, HandHeart, MenuIcon, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hasDropdown?: boolean
  subItems?: Array<{
    label: string
    slug?: string
  }>
  slug?: string
  highlight?: boolean
}

interface VenueCategory {
  id: number
  category_name: string
  slug: string
}

interface Vibes {
  id: number
  vibe_name: string
  slug: string
}

export function GuestMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([])
  const [vibe, setVibe] = useState<Vibes[]>([])


  const menuItems: MenuItem[] = [
    {
      icon: () => <span className="text-pink-500">☰</span>,
      label: "Home Page",
      highlight: true,
    },
    {
      icon: () => <HandHeart />,
      label: "Choose Your Vibes",
      hasDropdown: true,
      subItems: [...vibe]
        .sort((a, b) => (a.seq_in_menu || 999) - (b.seq_in_menu || 999)) // Ensure proper ordering
        .map((vibe) => ({
          label: vibe.vibe_name,
          slug: `vibe/${vibe.id}`,
        })),
    },
    {
      icon: () => <Search />,
      label: "Pick Your Place",
      hasDropdown: true,
      subItems: [...venueCategories]
        .sort((a, b) => (a.seq_in_menu || 999) - (b.seq_in_menu || 999)) // Ensure proper ordering
        .map((category) => ({
          label: category.category_name,
          slug: `category/${category.id}`,
        })),
    },
    {
      icon: () => <Coins />,
      label: "My Drink Dollars",
      slug: "my-drink-dollars/how-it-works"
    },
    { icon: () => <Diamond />, 
      label: "Insider Benefits",
      slug: "insider-benefit/how-it-works"
     },
    { icon: () => <Wine />, label: "My Alcohol Balance" },
  ]

  useEffect(() => {
    const fetchVenueCategories = async () => {
      const { data, error } = await supabase
        .from("venue_category")
        .select("id, category_name, seq_in_menu")
        .eq("status", "enabled") // Ensure only enabled categories are fetched
        .order("seq_in_menu", { ascending: true, nullsFirst: false }) // Place null values at the bottom
        .order("category_name", { ascending: true }) // Optional: Keep names sorted if same seq_in_menu

      if (error) {
        console.error("Error fetching venue categories:", error);
      } else {
        console.log(data)
        setVenueCategories(data)
      }

      const { data: vibeData, vibeDataError } = await supabase
        .from("vibe")
        .select("id, vibe_name, seq_in_menu")
        .eq("status", "enabled") // Ensure only enabled categories are fetched
        .order("seq_in_menu", { ascending: true, nullsFirst: false }) // Place null values at the bottom
        .order("vibe_name", { ascending: true }) // Optional: Keep names sorted if same seq_in_menu

      if (vibeDataError) {
        console.error("Error fetching vibe:", error);
      } else {
        setVibe(vibeData)
      }
    };

    fetchVenueCategories()
  }, [])

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.hasDropdown) {
      toggleSubmenu(item.label)
    } else if (item.slug) {
      router.push(`/${item.slug}`)
      setOpen(false)
    } else {
      router.push("/login")
      setOpen(false)
    }
  }

  const handleSubItemClick = (subItem: { label: string; slug?: string }) => {
    if (subItem.slug) {
      router.push(`/${subItem.slug}`)
      setOpen(false)
    } else {
      router.push("/login")
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-1">
          <MenuIcon className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0 bg-[#121212] border-zinc-800">
        <div className="flex flex-col h-full">
          {/* Auth Buttons */}
          <div className="p-4 flex gap-4">
            <Link href="/register" className="flex-1">
              <Button className="w-full bg-[#8E2DE2] hover:bg-[#7B27C1] text-white">SIGN UP</Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full border-white text-white bg-zinc-800">
                LOG IN
              </Button>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                <button
                  className={`flex items-center justify-between w-full px-6 py-4 hover:bg-zinc-900/50 transition-colors ${
                    item.highlight ? "text-[#FF1493]" : "text-white"
                  }`}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-6 h-6" />
                    <span className="font-futura text-[15px]">{item.label}</span>
                  </div>
                  {item.hasDropdown && (
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        expandedItems.includes(item.label) ? "rotate-90" : ""
                      } text-zinc-500`}
                    />
                  )}
                </button>
                {item.hasDropdown && expandedItems.includes(item.label) && (
                  <div className="ml-14 py-1">
                    {item.subItems?.map((subItem) => (
                      <button
                        key={subItem.label}
                        className="flex items-center w-full px-6 py-3 text-white hover:bg-zinc-900/50 font-futura text-[15px]"
                        onClick={() => handleSubItemClick(subItem)}
                      >
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subscribe Banner */}
          <div className="px-4 py-3">
            <Link href="/subscribe">
              <div className="rounded-lg p-4 bg-gradient-to-br from-[#1E1E1E] to-[#121212] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Diamond className="w-10 h-10 text-[#FF1493]" />
                  <div>
                    <div className="font-medium text-white text-base">Subscribe to Pro Chiongster</div>
                    <div className="text-sm text-white/60">Earn more benefits</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

