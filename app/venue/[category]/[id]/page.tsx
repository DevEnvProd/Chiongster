"use client"

import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Heart, Share2, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VenueInfo } from "@/components/venue-info"
import { VenueMenu } from "@/components/VenueMenu"
import { VenuePhotos } from "@/components/venue-photos"
import { VenueReviews } from "@/components/venue-reviews"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Venue } from "@/types/venue"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import type { Notis } from "@/types/notis"
import type { SimilarPlace } from "@/types/similarPlace" 

type Tab = "damage" | "menu" | "photos" | "review"

interface VenueDetailsPageProps {
  params: {
    category: string
    slug: string
    id: string
  }
}

interface ImageGallery {
  id: string
  image_path: string
}

interface RedeemItem {
  id: string
  item_name: string
  item_description: string
  amount: string
  pic_path: string
}

export default function VenueDetailsPage({ params }: VenueDetailsPageProps) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [favourite, setFavourite] = useState("")
  const [redeemItems, setRedeemItems] = useState<RedeemItem[]>([])
  const [imagePromotion, setImagePromotion] = useState<ImageGallery[]>([])
  const [imageGallery, setImageGallery] = useState<ImageGallery[]>([])
  const [imageRandomGallery, setImageRandomGallery] = useState<ImageGallery[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [recommendedTags, setRecommendedTags] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [reviewsNumber, setReviewsNumber] = useState("")
  const [ratingsNumber, setRatingsNumber] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("damage")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [termsAndConditions, setTermsAndConditions] = useState<Notis | null>(null) // Initialize termsAndConditions
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [similarPlaces, setSimilarPlaces] = useState<SimilarPlace[]>([]) // Initialize similarPlaces
  const [loadingSimilarPlaces, setLoadingSimilarPlaces] = useState(true)
  const [errorSimilarPlaces, setErrorSimilarPlaces] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState([])

  const buttonStyle = {
    background: "linear-gradient(to right, #6A0572, #D4145A)", // Adjust colors based on your image
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "inline-block",
    textAlign: "center",
  };

  useEffect(() => {
    async function fetchVenueData() {
      try {
        setLoading(true)
        setError(null)
        setLoadingSimilarPlaces(true)
        setErrorSimilarPlaces(null)

        const userId = localStorage.getItem("profileId")
        // Fetch venue data
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("*")
          .eq("id", params.id)
          .single()

        if (venueError) throw venueError

        if (!venueData) {
          throw new Error("Venue not found")
        }

        setVenue(venueData)

        const { data: favouriteData, error: favouriteDataError } = await supabase
          .from("favourites")
          .select("id")
          .eq("venue_id", params.id)
          .eq("user_id", userId)

        if (favouriteData) {
          setFavourite(favouriteData[0])
        }

        if (venueData.latitude && venueData.longitude) {
          fetchNearbyVenues(venueData.latitude, venueData.longitude);
        }

        // Fetch similar places
        if (venueData.similar_place_id) {
          const similarPlaceIds = Array.isArray(venueData.similar_place_id) ? venueData.similar_place_id : JSON.parse(venueData.similar_place_id)

          const { data: similarPlacesData, error: similarPlacesError } = await supabase
              .from("venues")
              .select("id, venue_name")
              .in("id", similarPlaceIds)

          if (similarPlacesError){
            throw similarPlacesError
          } 

          setLoadingSimilarPlaces(false)

          setSimilarPlaces(similarPlacesData)
        }

        //Fetch Category Name
        if (venueData.cat_id) {
          const catIds = Array.isArray(venueData.cat_id) ? venueData.cat_id : JSON.parse(venueData.cat_id)

          const { data: venueCategoryData, error: venueCategoryError } = await supabase
            .from("venue_category")
            .select("category_name")
            .in("id", catIds)

          if (venueCategoryError) {
            throw venueCategoryError
          }

          setCategoryName(venueCategoryData.map((item) => item.category_name))
        }

        // Fetch recommended tags
        if (venueData.recommended) {
          const recommendedIds = Array.isArray(venueData.recommended)
            ? venueData.recommended
            : JSON.parse(venueData.recommended)

          const { data: tagsData, error: tagsError } = await supabase
            .from("recommended_tags")
            .select("tag_name")
            .in("id", recommendedIds)

          if (tagsError) throw tagsError
          setRecommendedTags(tagsData.map((tag) => tag.tag_name))
        }

        // Fetch languages
        if (venueData.language) {
          const languageIds = Array.isArray(venueData.language) ? venueData.language : JSON.parse(venueData.language)

          const { data: languagesData, error: languagesError } = await supabase
            .from("languages")
            .select("language_name")
            .in("id", languageIds)

          if (languagesError) throw languagesError
          setLanguages(languagesData.map((lang) => lang.language_name))
        }

        // Fetch redeem items data
        const { data: venueRedeemItemsData, error: venueRedeemItemsError } = await supabase
          .from("venue_redeemitem")
          .select("id, amount, item_id") // Ensure `item_id` matches
          .eq("venue_id", params.id)

        if (venueRedeemItemsError) throw venueRedeemItemsError

        if (venueRedeemItemsData.length > 0) {
          const redeemItemIds = venueRedeemItemsData.map((item) => item.item_id) // Use `item_id`

          const { data: redeemItemsData, error: redeemItemsError } = await supabase
            .from("redeem_items")
            .select("id, item_name, item_description, pic_path")
            .in("id", redeemItemIds) // Query for matching `id` in `redeem_items`

          if (redeemItemsError) throw redeemItemsError

          // Map redeem items by their ID
          const redeemItemsMap = new Map(redeemItemsData.map((item) => [item.id, item]))

          // Merge venue redeem items with redeem items
          const mergedRedeemItems = venueRedeemItemsData.map((venueItem) => {
            const redeemItem = redeemItemsMap.get(venueItem.item_id) // Use `item_id` to get the data
            return {
              id: venueItem.id,
              item_name: redeemItem?.item_name || "N/A", // Add a fallback if `undefined`
              item_description: redeemItem?.item_description || "No description",
              amount: venueItem.amount,
              pic_path: redeemItem?.pic_path || "", // Add a fallback for `pic_path`
            }
          })

          setRedeemItems(mergedRedeemItems) // Update state with the merged data
        }

        // Fetch image data from the new table
        const { data: imageGalleryData, error: imageGalleryError } = await supabase
          .from("images_path")
          .select("id, image_path")
          .eq("venue_id", params.id)
          .eq("type", "Gallery")
    
        if (imageGalleryError) throw imageGalleryError
        setImageGallery(imageGalleryData)

        // Fetch image data from the new table
        const { data: imageRandomGalleryData, error: imageRandomGalleryError } = await supabase
          .from("images_path")
          .select("id, image_path")
          .eq("venue_id", params.id)
          .eq("type", "RandomGallery")
    
        if (imageRandomGalleryError) throw imageRandomGalleryError

        setImageRandomGallery(imageRandomGalleryData)

        // Fetch venue review data
        const { data: reviewData, error: reviewError } = await supabase
          .from("venue_review")
          .select("*")
          .eq("venue_id", params.id)

        if (reviewError) throw reviewError

        // Calculate overall rating and total reviews
        const totalReviews = reviewData.length
        const overallRating =
          totalReviews > 0
            ? reviewData.reduce((sum, review) => sum + (Number.parseFloat(review.total_rating) || 0), 0) / totalReviews
            : 0

        setReviewsNumber(totalReviews)
        setRatingsNumber(overallRating)

        const { data: notisData, error: notisError } = await supabase
          .from("notis")
          .select("notis_name, notis_description")
          .eq("notis_name", "Terms & Conditions")
          .single()

        if (notisError) {
          console.error("Error fetching terms and conditions:", notisError)
        } else {
          setTermsAndConditions(notisData)
        }
      } catch (err) {
        console.error("Error fetching venue data:", err.message)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchVenueData()
  }, [params.id])

  const fetchNearbyVenues = async (latitude: number, longitude: number) => {
    const { data, error } = await supabase
      .rpc("find_nearby_venues", { lat_param: latitude, lng_param: longitude, current_venue_id: params.id })

    if (error) {
      console.error("Error fetching nearby venues:", error)
      return;
    } else {
      if (Array.isArray(data)) {
        setNearbyPlaces(data);
      } else {
        setNearbyPlaces([data]); // Convert object to array
      }
    }
  };

  const handleFavorite = async (venueId: number) => {
    const profileId = localStorage.getItem("profileId")

    if (!profileId) {
      router.push("/login")
      return
    }

    try {
      if (favourite) {
        // Remove from favorites
        await supabase.from("favourites").delete().eq("user_id", profileId).eq("venue_id", venueId)

        setFavourite("")
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from("favourites")
          .insert([{ venue_id: venueId, user_id: profileId }])
          .select("id")

        setFavourite(data[0])
      }
    } catch (err) {
      console.error("Error updating favorites:", err)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = `Check out ${venue?.venue_name} on ChioNightOut!`

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

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Venue not found</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black pb-20">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-sm text-zinc-400">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${params.category}`}>Category</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${params.category}`}>{venue.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{venue.name}</span>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[16/9] w-full">
        {venue.discount_percentage && (
        <div className="absolute bottom-2 right-2 bg-[#6A36A5] text-white text-base font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10">
          {venue.discount_percentage}%
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
            alt="Dollar Coin"
            className="w-8 h-8 ml-1"
           />
        </div> )}
        <Image
          src={
            venue.pic_path
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${venue.pic_path}`
              : "/placeholder.svg?height=400&width=600&text=Venue+Image"
          }
          alt={venue.image_url || "Venue Image"}
          fill
          className="object-cover"
        />
      </div>

      {/* Venue Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{venue?.venue_name || "Venue Name"}</h1>
            <div className="flex flex-wrap gap-2">
              {categoryName.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-[#630330] text-white rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleFavorite(venue.id)} className="p-2 hover:bg-zinc-800 rounded-full">
              <Heart className={`w-5 h-5 ${favourite ? "fill-red-500 text-red-500" : "text-white"}`} />
            </button>
            <button onClick={handleShare} className="p-2 hover:bg-zinc-800 rounded-full">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-yellow-300">{"★".repeat(ratingsNumber)}</span>
            <span className="text-zinc-400">{"☆".repeat(6 - ratingsNumber)}</span>
          </div>
          <span className="text-sm text-zinc-400">
            {ratingsNumber} ({reviewsNumber} reviews)
          </span>
          <span className="text-sm text-zinc-400">• {venue?.location || "N/A"}</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-[#FFA500]">Price: {venue?.price ? "$".repeat(venue.price) : "N/A"}</span>
          </div>
          <div>
            <span className="text-[#FFA500]">Drinks Min Spend: {venue?.drink_min_spend || "N/A"}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="link" className="text-pink-500 p-0 h-auto" onClick={() => setShowPromotionDialog(true)}>
            SEE PROMOTION
          </Button>
          <Button variant="link" className="text-pink-500 p-0 h-auto" onClick={() => setShowEventDialog(true)}>
            SEE EVENT
          </Button>
        </div>

        <div className="space-y-3 py-2">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="text-sm">{venue?.address || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-zinc-400 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="text-xs text-gray-400">Opening Hours</p>
              <p>
                <span className="font-bold">Happy Hours:</span> {venue?.happy_hours || "N/A"}
              </p>
              <p>
                <span className="font-bold">Night Hour:</span> {venue?.night_hours || "N/A"}
              </p>
              <p>
                <span className="font-bold">Morning Hour:</span> {venue?.morning_hours || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/* Recommended For */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">★</span>
            <span className="font-medium">Recommended For</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedTags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-[#630330] text-white rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* About Us */}
      <div className="p-4 space-y-4 bg-zinc-900">
        <h2 className="text-xl font-bold pt-4">About Us</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 w-24 text-xs">Language</span>
            <span>:</span>
            <div className="flex flex-wrap gap-2">
              {languages.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-[#630330] text-white rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 w-24 text-xs">Playability</span>
            <span>:</span>
            <span className="text-xs">{venue?.playability || "N/A"}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-zinc-400 w-24 text-xs">Minimum Tips</span>
            <span className="text-xs">:</span>
            <span className="flex flex-col text-xs">
              {venue?.minimum_tips ? (
                venue.minimum_tips.split("\n").map((tip: string, index: number) => <div key={index}>{tip}</div>)
              ) : (
                <p>No tips available.</p>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold pt-4">Details</h2>
        <div className="flex">
          {[
            { id: "damage" as const, label: "Damage" },
            { id: "menu" as const, label: "Menu" },
            { id: "photos" as const, label: "Photos" },
            { id: "review" as const, label: "Review" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === tab.id ? "text-pink-500" : "text-zinc-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "damage" && <VenueInfo venueId={params.id} />}
        {activeTab === "menu" && <VenueMenu venueId={params.id} />}
        {activeTab === "photos" && <VenuePhotos imageGallery={imageGallery} imageRandomGallery = {imageRandomGallery} />}
        {activeTab === "review" && <VenueReviews venueId={params.id} />}
      </div>

      {/* Opening Hours */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Opening Hours
        </h2>
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Monday</span>
              <span className="col-span-2">: {venue.mondayOH}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Tuesday</span>
              <span className="col-span-2">: {venue.tuesdayOH}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Wednesday</span>
              <span className="col-span-2">: {venue.wednesdayOH}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Thursday</span>
              <span className="col-span-2">: {venue.thursdayOH}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Friday</span>
              <span className="col-span-2">: {venue.fridayOH}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Saturday</span>
              <span className="col-span-2">: {venue.saturdayOH}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-zinc-400">Sunday</span>
              <span className="col-span-2">: {venue.sundayOH}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Redeemable Items Section */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Redeemable Items</h2>
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            {redeemItems.map((item) => (
              <div key={item.id} className="flex-none w-[200px] snap-start">
                <div className="bg-zinc-900 rounded-lg p-4 space-y-3">
                  <div className="aspect-square relative">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.pic_path}`}
                      alt={item.item_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="font-medium">{item.item_name}</h3>
                    <p className="text-sm text-zinc-400">{item.item_description}</p>
                    <p className="text-amber-500 font-bold flex items-center justify-center gap-1">
                      {item.amount}
                      <span className="text-lg">💰</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        </div>
        <p className="text-xs text-zinc-500">
          * Min spend is required for booking and redeeming of item. See{" "}
          <Link
            to="/"
            className="text-pink-500 hover:underline"
            onClick={(e) => {
              e.preventDefault() // Prevent navigation
              setShowTermsDialog(true)
            }}
          >
            terms and conditions
          </Link>
        </p>
      </div>

      {/* Similar Places */}
      <div className="space-y-4 p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="similar-places" className="border-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <h2 className="text-base">Similar Places</h2>
            </AccordionTrigger>
            <AccordionContent>
              {loadingSimilarPlaces ? (
                <p>Loading similar places...</p>
              ) : errorSimilarPlaces ? (
                <p className="text-red-500">{errorSimilarPlaces}</p>
              ) : similarPlaces.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {similarPlaces.map((place) => (
                    <Link
                      key={place.id}
                      href={`/venue/${place.category_name}/${place.id}`}
                      className="block w-full text-[#DE3163] text-sm hover:text-[#DE3163]/90"
                    >
                      {place.venue_name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p>No similar places found.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Nearby */}
      <div className="space-y-4 p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="nearby-places" className="border-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <h2 className="text-base">Nearby Places</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 mt-4">
                {nearbyPlaces.map((place) => (
                  <Link key={place.id} href={`/venue/${place.category_name}/${place.id}`} className="block w-full text-[#DE3163] text-sm hover:text-[#DE3163]/90">
                    {place.venue_name} -  {place.distance ? place.distance.toFixed(2) + " km" : "N/A"}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Footer />

      {/* Promotion Dialog */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promotion</DialogTitle>
          </DialogHeader>
          {venue?.promotion_pic_path && (
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${venue.promotion_pic_path}`}
              alt="Promotion"
              width={500}
              height={500}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event</DialogTitle>
          </DialogHeader>
          {venue?.event_pic_path && (
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${venue.event_pic_path}`}
              alt="Event"
              width={500}
              height={500}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Term & Conditions */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{termsAndConditions?.notis_name || "Terms and Conditions"}</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] overflow-y-auto pr-2">
            {" "}
            {/* Added scrolling */}
            {termsAndConditions?.notis_description || "No data available."}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Booking Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-800">
        <Button
          className="w-full bg-gradient-to-r from-[#6A0572] to-[#D4145A]"
          onClick={() =>
            router.push(`/venue/${params.category}/${params.id}/booking?venue_id=${params.id}`)
          }
        >
          MAKE A BOOKING
        </Button>
      </div>
    </main>
  )
}

