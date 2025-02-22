"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart, Share2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

interface Venue {
  id: number
  venue_name: string
  category_name?: string
  image_url: string
  rating: number
  reviews: number
  price: number
  drink_min_spend: string
  location: string
  opening_hours: string
  distance: string
  discount: string
  slug: string
  pic_path: string
  isFavorite: boolean
}

interface CategoryPageProps {
  params: {
    id: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const [currentPage, setCurrentPage] = useState(1)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const categoryId = Number.parseInt(params.id, 10)
  const router = useRouter()


  function haversineDistance(lat1, lon1, lat2, lon2) {
    if (!lat2 || !lon2) return "None";

    const toRad = (angle) => (angle * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(2); // Keep 2 decimal places
  }

  useEffect(() => {
    async function fetchVenues() {
      try {
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Fetch category name
            const { data: categoryData, error: categoryError } = await supabase
              .from("venue_category")
              .select("category_name")
              .eq("id", categoryId)
              .single();

            if (categoryError) throw categoryError;
            setCategoryName(categoryData.category_name);

            // Fetch venues with ratings
            let query = supabase
              .from("venues")
              .select(
                `*, 
                venue_review(total_rating)`
              )
              .textSearch("cat_id", `"${categoryId}"`);

            if (filter === "HP") {
              query = query.ilike("vibe", `%HP%`);
            } else if (filter === "LN") {
              query = query.ilike("vibe", "%LN%");
            } else if (filter === "EM") {
              query = query.ilike("vibe", "%EM%");
            } else if (filter === "CC") {
              query = query.ilike("vibe", "%CC%");
            } 

            const { data: venuesData, error: venuesError } = await query;

            if (venuesError) throw venuesError;

            const { data: catNameList, error: catNameListError } = await supabase
              .from("venue_category")
              .select("id, category_name");

            if (catNameListError) throw catNameListError;

            const categoryMap = catNameList.reduce((acc, cat) => {
              acc[cat.id] = cat.category_name;
              return acc;
            }, {});

            // Process venues data
            let processedVenues = venuesData.map((venue) => {
              const reviews = venue.venue_review || [];
              const totalRating = reviews.reduce((sum, review) => sum + (review.total_rating || 0), 0);
              const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

              const categoryIds = Array.isArray(venue.cat_id) ? venue.cat_id : JSON.parse(venue.cat_id || "[]");
              const categoryNames = categoryIds.map((id) => categoryMap[id] || "Unknown");

              const distance = haversineDistance(latitude, longitude, venue.latitude, venue.longitude);

              return {
                ...venue,
                rating: Number(averageRating.toFixed(1)),
                reviews: reviews.length,
                isFavorite: false,
                categoryNames,
                distance, // Store calculated distance
              };
            });

            // Sort venues: valid distances first, "None" last
            processedVenues.sort((a, b) => {
              if (a.distance === "None") return 1;
              if (b.distance === "None") return -1;
              return parseFloat(a.distance) - parseFloat(b.distance);
            });

            console.log(processedVenues);
            setVenues(processedVenues);

            // Fetch favorite status
            const profileId = localStorage.getItem("profileId");
            if (profileId) {
              const { data: favoritesData, error: favoritesError } = await supabase
                .from("favourites")
                .select("venue_id")
                .eq("user_id", profileId);

              if (favoritesError) throw favoritesError;

              const favoriteVenueIds = new Set(favoritesData.map((f) => f.venue_id));
              setVenues((prevVenues) =>
                prevVenues.map((venue) => ({
                  ...venue,
                  isFavorite: favoriteVenueIds.has(venue.id),
                }))
              );
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setError("Failed to get location");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load venues");
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, [categoryId]);


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
        // Remove from favorites
        await supabase.from("favourites").delete().eq("user_id", profileId).eq("venue_id", venueId)
      } else {
        // Add to favorites
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

  const handleShare = async (venueId) => {
    const shareUrl = `${window.location.origin}/venue/${categoryName}/${venueId}`
    const shareTitle = `Check out ${venueId} on ChioNightOut!`

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
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error}</div>
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <Header />
      {/* Breadcrumb */}
      <div className="text-sm text-zinc-400 mb-4">
        <span>Home</span>
        <span className="mx-2">/</span>
        <span>Category</span>
        <span className="mx-2">/</span>
        <span className="text-white">{categoryName}</span>
      </div>

      {/* Category Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 uppercase tracking-wider">{categoryName}</h1>
        <div className="flex items-center justify-end">
          <span className="text-sm font-semibold text-white tracking-wide pr-2">Sort by</span>
          <Select defaultValue="relevance">
            <SelectTrigger className="w-[200px] bg-zinc-900/90 border border-zinc-800 text-white shadow-lg rounded-md">
              <SelectValue placeholder="Relevance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Venues List */}
      <div className="space-y-4">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="relative">
              <span className="absolute top-2 right-2 flex items-center bg-white/90 text-black text-xs px-2 py-1 rounded-full">
                <MapPin className="w-2 h-2 text-gray-700 mr-1" /> {/* Location Icon */}
                {venue.distance === "None" ? "None" : `${venue.distance} KM`}
              </span>
              <Link href={`/venue/${categoryName}/${venue.id}`}>
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
                  <Link href={`/venue/${categoryName}/${venue.id}`}>
                    <h3 className="text-lg font-bold">{venue.venue_name}</h3>
                  </Link>
                  {venue.categoryNames && venue.categoryNames.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {venue.categoryNames.map((category, index) => (
                        <p key={index} className="text-sm bg-[#953553] rounded-lg px-2 py-0.5 text-white">
                          {category}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleFavorite(venue.id)} className="p-2 hover:bg-zinc-800 rounded-full">
                    <Heart className={`w-5 h-5 ${venue.isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                  </button>
                  <button onClick={() => handleShare(venue.id)} className="p-2 hover:bg-zinc-800 rounded-full">
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
                    {venue.rating.toFixed(1)} ({venue.reviews} reviews)
                  </span>
                </div>
              </div>
              <Link href={`/venue/${categoryName}/${venue.id}/booking?id=${venue.id}`}>
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

