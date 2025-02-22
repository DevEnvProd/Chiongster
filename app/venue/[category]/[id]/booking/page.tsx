"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { BookingDetails } from "@/components/booking/booking-details"
import { RedeemItems } from "@/components/booking/redeem-items"
import { BookingConfirmationView } from "@/components/booking/booking-confirmation"
import type { BookingFormData } from "@/types/booking"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

type BookingStep = "details" | "redeem" | "confirmation"

interface VenueDetails {
  id: string
  venue_name: string
  happy_hours: string
  night_hours: string
  morning_hours: string
  pic_path: string
  address: string
}

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const venueId = params.id as string
  const [currentStep, setCurrentStep] = useState<BookingStep>("details")
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null)
  const [venueDetails, setVenueDetails] = useState<VenueDetails | null>(null)
  const [venueDamage, setVenueDamage] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null)
  const [redeemedItems, setRedeemedItems] = useState<any>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchVenueDetails() {
      setLoading(true)
      setError(null)

      if (!venueId) {
        setError("Venue ID is missing")
        setLoading(false)
        return
      }

      try {
        const { data: venueData, error: venueError } = await supabase
          .from("venues")
          .select("id, venue_name, address, happy_hours, night_hours, morning_hours, pic_path")
          .eq("id", venueId)
          .single()

        if (venueError) throw venueError
        setVenueDetails(venueData)

        const { data: damageData, error: damageError } = await supabase
          .from("venue_damage")
          .select("*")
          .eq("venue_id", venueId)

        if (damageError) throw damageError
        setVenueDamage(damageData)
      } catch (error) {
        console.error("Error fetching venue details:", error)
        setError("Failed to load venue details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVenueDetails()
  }, [venueId])

  const handleBookingSubmit = (data: BookingFormData) => {
    setBookingData(data)
    setCurrentStep("redeem")
  }

  const handleRedeemComplete = async (bookingData: BookingFormData, redeemedItems: any[] | null = null) => {
    setError(null)
    if (!bookingData || !venueDetails) {
      setError("Booking data or venue details are missing. Please try again.")
      return
    }

    try {
      const userId = localStorage.getItem("profileId")
      if (!userId) {
        throw new Error("User is not authenticated")
      }

      const bookingCode = generateUniqueBookingCode()

      const { data, error: bookingError } = await supabase
        .from("booking")
        .insert([
          {
            venue_id: venueDetails.id,
            user_id: userId,
            preferred_date: bookingData.date,
            session: bookingData.session,
            pax: bookingData.numberOfPeople,
            room_no: bookingData.roomSize,
            manager: bookingData.preferredManager,
            reservation_name: bookingData.reservationName,
            notes: bookingData.notes,
            booking_unique_code: bookingCode,
            redemption_code: bookingCode + '001',
            //redeemed_items: redeemedItems ? JSON.stringify(redeemedItems) : null,
          },
        ])
        .select()
        .single()

      if (bookingError) {
        throw bookingError
      }

      if (!data) {
        throw new Error("No data returned from booking insertion")
      }

      console.log("Main - RedeemedItems:", JSON.stringify(redeemedItems, null, 2));


      // Insert redemption records if there are any
      if (redeemedItems && redeemedItems.length > 0) {
        // Calculate total amount to deduct from drink_dollars
        const totalAmount = redeemedItems.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          console.log(`Item: ${item.id}, Price: ${item.price}, Quantity: ${item.quantity}, Item Total: ${itemTotal}`);
          return sum + itemTotal;
        }, 0);

        console.log(`Final Total Amount: ${totalAmount}`);

        console.log(totalAmount)

        // Insert redemption records
        const { data: redemptionData, error: redemptionError } = await supabase.from("redemption").insert(
          redeemedItems.map((item) => ({
            booking_id: data.id,
            item_name: item.id,
            quantity: item.quantity,
            amount: item.quantity * item.price,
          }))
        ).select()

        if (redemptionError) {
          throw redemptionError;
        }

        setRedeemedItems(redemptionData)

        // Fetch current drink_dollars balance
        const { data: drinkDollarData, error: drinkDollarError } = await supabase
          .from("drink_dollars")
          .select("coins")
          .eq("user_id", userId)
          .single();

        if (drinkDollarError) {
          throw drinkDollarError;
        }

        const currentCoins = drinkDollarData?.coins || 0;
        const newBalance = currentCoins - totalAmount;

        // Update drink_dollars table
        const { error: updateError } = await supabase
          .from("drink_dollars")
          .update({ coins: newBalance })
          .eq("user_id", userId);

        if (updateError) {
          throw updateError;
        }

        // Insert transaction record into trans_drink_dollar
        const { error: transError } = await supabase.from("trans_drink_dollar").insert({
          user_id: userId,
          trans_title: "redeem",
          trans_description: "Redeem Beer"
          coins: totalAmount,
          created_at: new Date().toISOString(),
        });

        if (transError) {
          throw transError;
        }
      }

      setBookingConfirmation({ ...data, bookingCode })
      setCurrentStep("confirmation")
    } catch (error: any) {
      console.error("Error creating booking:", error)
      setError(`Failed to create booking: ${error.message || "Unknown error"}`)
    }
  }

  const generateUniqueBookingCode = (): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const codeLength = 8
    let result = ""
    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Progress Indicator */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{
              width: currentStep === "details" ? "33%" : currentStep === "redeem" ? "66%" : "100%",
            }}
          />
        </div>
        <div className="container px-4 py-4 flex justify-between text-sm">
          <span className={currentStep === "details" ? "text-amber-500" : "text-zinc-400"}>Booking Details</span>
          <span className={currentStep === "redeem" ? "text-amber-500" : "text-zinc-400"}>Redeem Item</span>
          <span className={currentStep === "confirmation" ? "text-amber-500" : "text-zinc-400"}>Confirmation</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="container px-4 py-6">
        {loading ? (
          <div className="text-center">Loading booking details...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            {currentStep === "details" && (
              <BookingDetails onSubmit={handleBookingSubmit} venueDetails={venueDetails} venueDamage={venueDamage} />
            )}
            {currentStep === "redeem" && bookingData && venueId && (
              <RedeemItems
                onComplete={handleRedeemComplete}
                onSkip={() => handleRedeemComplete(bookingData)}
                bookingData={bookingData}
                venueId={venueId}
              />
            )}
            {currentStep === "confirmation" && bookingConfirmation && (
              <BookingConfirmationView bookingConfirmation={bookingConfirmation} venueDetails={venueDetails} redemption={redeemedItems} />
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

