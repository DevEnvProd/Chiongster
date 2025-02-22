"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

interface Venue {
  id: number
  name: string
  category: string
  price_level: string
  min_spend: number
  location: string
  operating_hours: string
  rating: number
  review_count: number
  image_url: string
  discount?: number
}

export default function MyFavouritesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [favourites, setFavourites] = useState<Venue[]>([])

  useEffect(() => {
    const fetchFavourites = async () => {
      const profileId = localStorage.getItem("profileId");
      if (!profileId) return;

      try {
        // Fetch favourite venues
        const { data: favouritesData, error: favouritesError } = await supabase
          .from("favourites")
          .select("venue_id")
          .eq("user_id", profileId);

        if (favouritesError) throw favouritesError;

        if (favouritesData.length > 0) {
          const venueIds = favouritesData.map(item => item.venue_id);

          // Fetch venue details
          const { data: venueList, error: venueError } = await supabase
            .from("venues")
            .select("*, venue_category_id") // Get category_id from venues
            .in("id", venueIds);

          if (venueError) throw venueError;

          const categoryIds = [...new Set(venueList.map(v => v.venue_category_id))]; // Unique category IDs

          // Fetch category names
          const { data: categories, error: categoryError } = await supabase
            .from("venue_category")
            .select("id, category_name")
            .in("id", categoryIds);

          if (categoryError) throw categoryError;

          // Create a mapping of category_id to category_name
          const categoryMap = categories.reduce((acc, category) => {
            acc[category.id] = category.category_name;
            return acc;
          }, {});

          // Merge category name into venue list
          const mergedFavourites = venueList.map(venue => ({
            ...venue,
            category_name: categoryMap[venue.venue_category_id] || "Unknown",
          }));

          setFavourites(mergedFavourites);
          console.log("Favourite Venues with Categories:", mergedFavourites);
        } else {
          console.log("No favourites found.");
        }
      } catch (error) {
        console.error("Error fetching favourites:", error);
      }
    };

    fetchFavourites();
  }, []);


  const handleFavorite = async (venueId: number) => {
    const profileId = localStorage.getItem("profileId")

    try {
      console.log(venueId)

      await supabase.from("favourites").delete().eq("user_id", profileId).eq("venue_id", venueId)

      // Update local state
      setFavourites((prevVenues) =>
        prevVenues.filter((venue) => venue.id !== venueId)
      );
    } catch (err) {
      console.error("Error updating favorites:", err)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-6 text-sm text-zinc-400">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">My Favourites</span>
      </div>

      {/* Page Title */}
      <h1 className="px-4 text-2xl font-bold mb-6">MY FAVOURITES</h1>

      {/* Venues List */}
      <div className="space-y-4">
        {favourites.map((venue) => (
          <div key={venue.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="relative">
              <span className="absolute top-2 right-2 bg-white/90 text-black text-xs px-2 py-1 rounded-full">
                {venue.distance}
              </span>
              <Link href={`/venue/${venue.category_name}/${venue.slug}/${venue.id}`}>
                <img
                  src={
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL || "/placeholder.svg"}/storage/v1/object/public/${venue.pic_path}` ||
                    "/placeholder.svg?height=400&width=600&text=Venue+Image"
                  }
                  alt={venue.venue_name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              {venue.discount && (
                <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-sm px-3 py-1 rounded-lg">
                  {venue.discount}
                </div>
              )}
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/venue/${venue.category_name}/${venue.slug}/${venue.id}`}>
                    <h3 className="text-lg font-bold">{venue.venue_name}</h3>
                  </Link>
                  {venue.category_name && (
                    <p className="text-sm bg-[#953553] rounded-lg px-2 py-0.5 inline-block mt-1 text-white">
                      {venue.category_name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleFavorite(venue.id)} className="p-2 hover:bg-zinc-800 rounded-full">
                    <Heart className={`w-5 h-5 fill-red-500 text-red-500`} />
                  </button>
                  <button className="p-2 hover:bg-zinc-800 rounded-full">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-[#FFD54A]">Price: {"$".repeat(venue.price)}</span> •{" "}
                  <span className="text-[#FFD54A]">Drinks Min Spend: {venue.drink_min_spend}</span>
                </p>
                <p className="text-sm text-zinc-400">
                  @ {venue.location} • {venue.opening_hours}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-300">
                    {"★".repeat(Math.floor(venue.rating))}
                    {"☆".repeat(5 - Math.floor(venue.rating))}
                  </span>
                  <span className="text-sm text-zinc-400 ml-1">
                    {venue.rating} ({venue.reviews} reviews)
                  </span>
                </div>
              </div>
              <Link href={`/venue/${venue.category_name}/${venue.slug}/${venue.id}/booking?id=${venue.id}`}>
                <Button className="w-full bg-gradient-to-r from-[#8E2DE2] to-[#F000FF] text-white">
                  MAKE A BOOKING
                </Button>
              </Link>
              <div className="flex gap-4 text-sm">
                <button className="text-[#DE3163] underline">SEE PROMOTION</button>
                <button className="text-[#DE3163] underline">SEE EVENT</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="p-2 rounded-md bg-zinc-900 text-zinc-400 hover:bg-zinc-800">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="w-8 h-8 rounded-md border border-pink-500 bg-zinc-900 text-white">1</button>
        <button className="p-2 rounded-md bg-zinc-900 text-zinc-400 hover:bg-zinc-800">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <Footer />
    </div>
  )
}

