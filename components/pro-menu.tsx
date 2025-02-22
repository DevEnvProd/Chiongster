"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon, ChevronRight } from "lucide-react"
import { Menu, Search, Ticket, Heart, Coins, Diamond, Wine, LogOut, User, HandHeart } from "lucide-react"
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

interface ProfileData {
  id: string
  username: string
  tier_id: number
}

interface TierData {
  id: number
  name: string
  color_code: string
}

interface Vibes {
  id: number
  vibe_name: string
  slug: string
}

export function ProMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState("Home Page")
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([])
  const [vibe, setVibe] = useState<Vibes[]>([])
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [tierData, setTierData] = useState<TierData | null>(null)

  const menuItems: MenuItem[] = [
    { icon: Menu, label: "Home Page", highlight: true },
    {
      icon: () => <HandHeart />,
      label: "Choose Your Vibes",
      hasDropdown: true,
      subItems: [...vibe]
        .sort((a, b) => (a.seq_in_menu || 999) - (b.seq_in_menu || 999)) // Ensure proper ordering
        .map((vibe) => ({
          label: vibe.vibe_name,
          slug: `vibe/${vibe.name}`,
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
      icon: Ticket,
      label: "My Bookings",
      hasDropdown: true,
      subItems: [
        { label: "Current Booking", slug: "my-bookings/current-booking" },
        { label: "Past Bookings", slug: "my-bookings/past-booking" },
      ],
    },
    { icon: Heart, label: "My Favourites", slug: "my-favourites" },
    { icon: Coins, label: "My Drink Dollars", slug: "my-drink-dollars" },
    { icon: Diamond, label: "Insider Benefits", slug: "ins-benefits" },
    { icon: Wine, label: "My Alcohol Balance", slug: "my-alcohol-balance" },
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
        console.error("Error fetching venue categories:", error)
      } else {
        setVenueCategories(data)
      }

      const { data: vibeData, vibeDataError } = await supabase
        .from("vibe")
        .select("id, vibe_name, seq_in_menu")
        .eq("status", "enabled") // Ensure only enabled categories are fetched
        .order("seq_in_menu", { ascending: true, nullsFirst: false }) // Place null values at the bottom
        .order("vibe_name", { ascending: true }) // Optional: Keep names sorted if same seq_in_menu

      if (vibeDataError) {
        console.error("Error fetching vibe:", error)
      } else {
        setVibe(vibeData)
      }
    }

    const fetchProfileAndTierData = async () => {
      const profileId = localStorage.getItem("profileId")
      if (profileId) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, tier_id")
          .eq("id", profileId)
          .single()

        if (profileError) {
          console.error("Error fetching profile data:", profileError)
        } else if (profileData) {
          setProfileData(profileData)

          const { data: tierData, error: tierError } = await supabase
            .from("tiers")
            .select("id, name, color_code")
            .eq("id", profileData.tier_id)
            .single()

          if (tierError) {
            console.error("Error fetching tier data:", tierError)
          } else {
            setTierData(tierData)
          }
        }
      }
    }

    fetchVenueCategories()
    fetchProfileAndTierData()
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
      router.push("/")
      setOpen(false)
    }
  }

  const handleSubItemClick = (subItem: { label: string; slug?: string }) => {
    if (subItem.slug) {
      router.push(`/${subItem.slug}`)
      setOpen(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("session");
    router.replace("/login"); // Use replace() instead of push()
     // Small delay to ensure navigation completes
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-1">
          <MenuIcon className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0 bg-[#121212] border-zinc-800 flex flex-col">
        {/* Profile Section */}
        <div
          className="relative h-[120px] p-4 flex-shrink-0"
          style={{ backgroundColor: tierData ? tierData.color_code : "#1E1E1E" }}
        >
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white"></button>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
              <User className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg font-futura">{profileData?.username || "Name Here"}</h2>
              <Link href="/profile">
                <button className="text-sm text-white/90 flex items-center gap-1 font-futura">
                  SEE PROFILE
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            {tierData && (
              <div className="absolute top-2 right-2 bg-white/20 text-black px-2 py-1 rounded-full text-xs mt-8">
                {tierData.name}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-grow overflow-y-auto">
          <div className="py-2 p-4">
            {menuItems.map((item) => (
              <div key={item.label}>
                <button
                  className={`flex items-center justify-between w-full px-6 py-4 hover:bg-zinc-900/50 transition-colors ${
                    item.highlight ? "p-8 text-[#FF1493] bg-[#FF1493]/5" : "text-white"
                  }`}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-6 h-6 ${item.highlight ? "text-[#FF1493]" : "text-white"}`} />
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
        </div>

        {/* Fixed bottom section */}
        <div className="flex-shrink-0 bg-[#121212] pt-4">
          {/* Subscribe Banner */}

          {/* Log Out */}
          <div className="border-t border-zinc-800">
            <button
              className="flex items-center gap-4 w-full px-6 py-4 hover:bg-zinc-900/50 text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-6 h-6" />
              <span className="font-futura text-[15px]">Log Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

