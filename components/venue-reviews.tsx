"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface VenueReview {
  id: string
  title: string
  comment: string
  atmosphere_rating: number
  personel_rating: number
  price_tags_rating: number
  total_rating: number
  user_id: string
  created_at: string
}

interface VenueReviewsProps {
  venueId: string
}

export function VenueReviews({ venueId }: VenueReviewsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [venueReviews, setVenueReviews] = useState<VenueReview[]>([])
  const [newReview, setNewReview] = useState({
    title: "",
    comment: "",
    atmosphere_rating: 0,
    personel_rating: 0,
    price_tags_rating: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const profileId = localStorage.getItem("profileId")
    setIsLoggedIn(!!profileId && profileId !== "null")
    setUserId(profileId)
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    console.log(venueId)
    try {
      const { data, error } = await supabase
        .from("venue_review")
        .select("*")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setVenueReviews(data)
    } catch (error) {
      console.error("Error fetching reviews:", error.message)
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewReview((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (name: string, rating: number) => {
    setNewReview((prev) => ({ ...prev, [name]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      })
      return
    }

    const total_rating = (newReview.atmosphere_rating + newReview.personel_rating + newReview.price_tags_rating) / 3

    try {
      const { data, error } = await supabase
        .from("venue_review")
        .insert([
          {
            venue_id: venueId,
            user_id: userId,
            title: newReview.title,
            comment: newReview.comment,
            atmosphere_rating: newReview.atmosphere_rating,
            personel_rating: newReview.personel_rating,
            price_tags_rating: newReview.price_tags_rating,
            total_rating: total_rating,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Your review has been submitted.",
      })

      // Reset the form and refresh reviews
      setNewReview({
        title: "",
        comment: "",
        atmosphere_rating: 0,
        personel_rating: 0,
        price_tags_rating: 0,
      })
      fetchReviews()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const StarRating = ({
    name,
    value,
    onChange,
  }: { name: string; value: number; onChange: (name: string, rating: number) => void }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${star <= value ? "text-amber-500 fill-amber-500" : "text-zinc-400"}`}
            onClick={() => onChange(name, star)}
          />
        ))}
      </div>
    )
  }

  // Calculate overall rating and total reviews
  const totalReviews = venueReviews.length
  const overallRating =
    totalReviews > 0 ? venueReviews.reduce((sum, review) => sum + review.total_rating, 0) / totalReviews : 0

  const headOverallRating =
    totalReviews > 0 
        ? Math.round((venueReviews.reduce((sum, review) => sum + review.total_rating, 0) / totalReviews) * 100) / 100
        : 0

  const ratings = [
    {
      label: "Atmosphere",
      value:
        totalReviews > 0 ? venueReviews.reduce((sum, review) => sum + review.atmosphere_rating, 0) / totalReviews : 0,
    },
    {
      label: "Personnel",
      value:
        totalReviews > 0 ? venueReviews.reduce((sum, review) => sum + review.personel_rating, 0) / totalReviews : 0,
    },
    {
      label: "Price Tags",
      value:
        totalReviews > 0 ? venueReviews.reduce((sum, review) => sum + review.price_tags_rating, 0) / totalReviews : 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{headOverallRating.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <div className="flex">
              <span className="text-amber-500">{"★".repeat(Math.floor(overallRating))}</span>
              <span className="text-zinc-600">{"★".repeat(5 - Math.floor(overallRating))}</span>
            </div>
            <span className="text-sm text-zinc-400">Based on {totalReviews} reviews</span>
          </div>
        </div>

        <div className="space-y-2">
          {ratings.map((rating) => (
            <div key={rating.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{rating.label}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(rating.value / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {venueReviews.map((review) => (
          <div key={review.id} className="bg-zinc-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">👤</div>
              <div>
                <div className="font-medium">User {review.user_id}</div>
                <div className="text-xs text-zinc-300">{new Date(review.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <h4 className="font-semibold">{review.title}</h4>
            <div className="flex gap-2 text-base">
              <div className="flex">
                <span className="text-amber-500">{"★".repeat(Math.floor(review.total_rating))}</span>
                <span className="text-zinc-600">{"★".repeat(5 - Math.floor(review.total_rating))}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span>Atmosphere: {review.atmosphere_rating}</span>
                <span className="text-amber-500">★</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Personnel: {review.personel_rating}</span>
                <span className="text-amber-500">★</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Price tags: {review.price_tags_rating}</span>
                <span className="text-amber-500">★</span>
              </div>
            </div>
            <p className="text-sm">{review.comment}</p>
          </div>
        ))}
      </div>

      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Leave a Review</h3>
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              name="title"
              value={newReview.title}
              onChange={handleInputChange}
              placeholder="Give your review a title"
              className="w-full text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              value={newReview.comment}
              onChange={handleInputChange}
              placeholder="Share your experience..."
              className="w-full text-black"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="atmosphere_rating">Atmosphere</Label>
              <StarRating name="atmosphere_rating" value={newReview.atmosphere_rating} onChange={handleRatingChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personel_rating">Personnel</Label>
              <StarRating name="personel_rating" value={newReview.personel_rating} onChange={handleRatingChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_tags_rating">Price Tags</Label>
              <StarRating name="price_tags_rating" value={newReview.price_tags_rating} onChange={handleRatingChange} />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Submit Review
          </Button>
        </form>
      )}

      {!isLoggedIn && (
        <div className="text-center p-4 bg-zinc-900 rounded-lg">
          <p>
            Please{" "}
            <Link href="/login" className="text-amber-500 hover:underline">
              log in
            </Link>{" "}
            to leave a review.
          </p>
        </div>
      )}
    </div>
  )
}

