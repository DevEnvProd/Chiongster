"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Venue {
  id: number
  name: string
  type: string
  image: string
  rating: number
  reviews: number
  price: string
  min_spend: string
  location: string
  hours: string
  distance: string
  discount: string
  slug: string
  venue_name: string
  drink_min_spend: string
  category_id: number
  category_name?: string
}

const getPriceDisplay = (price: number) => {
  return "$".repeat(price)
}

export function TopPicks() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true);
        const profileId = localStorage.getItem("profileId");

        const { data: venuesData, error: venuesError } = await supabase
          .from("venues")
          .select("*")
          .order("venue_name", { ascending: false })
          .limit(5);

        if (venuesError) throw venuesError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("venue_category")
          .select("id, category_name");

        if (categoriesError) throw categoriesError;

        let favoriteVenueIds = new Set(); // Default to an empty Set

        if (profileId) {
          // Fetch favorites only if the user is logged in
          const { data: favoritesData, error: favoritesError } = await supabase
            .from("favourites")
            .select("venue_id")
            .eq("user_id", profileId);

          if (favoritesError) {
            console.error("Error fetching favorites:", favoritesError);
          } else {
            favoriteVenueIds = new Set((favoritesData || []).map((fav) => fav.venue_id));
          }
        }

        // Merge venues with their categories and favorites
        const mergedVenues = venuesData.map((venue) => ({
          ...venue,
          category_name: categoriesData.find((cat) => cat.id === venue.venue_category_id)?.category_name,
          categoryNameList: categoriesData
            .filter((cat) => venue.cat_id?.includes(cat.id)) // Ensure `cat_id` exists
            .map((cat) => cat.category_name),
          isFavorite: favoriteVenueIds.has(venue.id),
        }));

        setVenues(mergedVenues);
      } catch (error) {
        console.error("Error fetching venues:", error);
        setError("Failed to load venues");
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, []);


  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        setScrollPosition(scrollRef.current.scrollLeft)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  const handleFavorite = async (venueId: number) => {
    const profileId = localStorage.getItem("profileId")

    if (!profileId) {
      router.push("/login")
      return
    }

    try {
      const venueIndex = venues.findIndex((v) => v.id === venueId)
      const isFavorite = venues[venueIndex].isFavorite

      if (isFavorite) {
      console.log("here")
        // Remove from favorites
        await supabase.from("favourites").delete().eq("user_id", profileId).eq("venue_id", venueId)
      } else {
        // Add to favorites
        console.log("in here")
        await supabase.from("favourites").insert([{ venue_id: venueId, user_id: profileId }])
      }

      // Update local state
      setVenues((prevVenues) =>
        prevVenues.map((venue) => (venue.id === venueId ? { ...venue, isFavorite: !isFavorite } : venue)),
      )
    } catch (err) {
      console.error("Error updating favorites:", err)
    }
  }

  const handleShare = async (venueName, categoryName, venueId) => {
    const shareUrl = `${window.location.origin}/venue/${categoryName}/${venueId}`
    const shareTitle = `Check out ${venueName} on ChioNightOut!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error.message)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied!",
            description: "The venue link has been copied to your clipboard.",
          })
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
        })
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Loading top picks...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <section className="space-y-4 relative bg-[#121212] px-4 sm:px-6 py-8">
      <div className="space-y-1 text-center">
        <p className="text-[#FFD54A] text-sm font-medium uppercase">Trending Hotspots Right Now</p>
        <h2 className="text-3xl font-bold text-white font-futura">EXPLORE TOP PICKS</h2>
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
        {venues.map((venue) => (
          <div key={venue.id} className="flex-none w-[280px] sm:w-[320px] md:w-[350px] snap-start">
            <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
              <div className="relative">
                {venue.distance && (
                  <span className="absolute top-2 right-2 bg-white/90 text-black text-xs px-2 py-1 rounded-full">
                    {venue.distance}
                  </span>
                )}
                <Link href={`/venue/${venue.category_name}/${venue.id}`}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${venue.pic_path}`}
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                {venue.discount_percentage && (
                  <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-sm px-3 py-1 rounded-lg">
                    {venue.discount_percentage}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/venue/${venue.category_name}/${venue.id}`}>
                      <h3 className="text-lg font-bold text-white">{venue.venue_name}</h3>
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleFavorite(venue.id)} className="p-2 hover:bg-zinc-800 rounded-full">
                      <Heart className={`w-5 h-5 ${venue.isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </button>
                    <button onClick={() => handleShare(venue.venue_name, venue.category_name, venue.id)} className="p-2 hover:bg-zinc-800 rounded-full">
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                {venue.categoryNameList && venue.categoryNameList.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {venue.categoryNameList.map((category, index) => (
                          <p
                            key={index}
                            className="text-sm bg-[#953553] rounded-lg px-2 py-0.5 inline-block text-white"
                          >
                            {category}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-amber-500">Price: {getPriceDisplay(Number(venue.price))}</span> •{" "}
                    <span className="text-amber-500">Drinks Min Spend: {venue.drink_min_spend}</span>
                  </p>
                  <p className="text-sm text-zinc-400">
                    @ {venue.location} • {venue.opening_hours}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-300">
                      {typeof venue.rating === "number"
                        ? "★".repeat(Math.floor(venue.rating)) + "☆".repeat(5 - Math.floor(venue.rating))
                        : "☆".repeat(5)}
                    </span>
                    <span className="text-sm text-zinc-400 ml-1">
                      {typeof venue.rating === "number" ? venue.rating.toFixed(1) : "N/A"} ({venue.reviews || 0}{" "}
                      reviews)
                    </span>
                  </div>
                </div>
                <Link href={`/venue/${venue.category_name}/${venue.id}`}>
                  <Button className="w-full bg-gradient-to-r from-[#8E2DE2] to-[#F000FF] text-white font-medium py-2 rounded-lg">
                    MAKE A BOOKING
                  </Button>
                </Link>
                <div className="flex gap-4 text-sm">
                  <button className="text-[#DE3163] underline">SEE PROMOTION</button>
                  <button className="text-[#DE3163] underline">SEE EVENT</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <>
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
          style={{
            display: scrollPosition > 0 ? "block" : "none",
          }}
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
    </section>
  )
}

