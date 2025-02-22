"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import type { RedeemableItem } from "@/types/booking"
import type { BookingFormData } from "@/types/booking"
import { supabase } from "@/lib/supabase"

interface RedeemItemsProps {
  onComplete: (bookingData: BookingFormData, redeemedItems: RedeemableItem[] | null) => void
  onSkip: () => void
  bookingData: BookingFormData
  venueId: string
}

export function RedeemItems({ onComplete, onSkip, bookingData, venueId }: RedeemItemsProps) {
  const getUserId = () => {
    const profileId = localStorage.getItem("profileId")
    const userId = localStorage.getItem("userId")
    return profileId || userId || null
  }

  const [redeemableItems, setRedeemableItems] = useState<RedeemableItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const userId = getUserId()
        if (!userId) {
          throw new Error("User is not authenticated")
        }

        // Fetch user's drink dollar balance
        const { data: balanceData, error: balanceError } = await supabase
          .from("drink_dollars")
          .select("coins")
          .eq("user_id", userId)
          .single()

        if (balanceError) {
          if (balanceError.message.includes("The result contains 0 rows")) {
            console.warn("No balance found for user. Setting default to 0.")
            setBalance(0)
          } else {
            throw balanceError
          }
        } else {
          setBalance(balanceData?.coins || 0)
        }

        // Fetch venue_redeemitem data
        const { data: venueRedeemItems, error: venueRedeemError } = await supabase
          .from("venue_redeemitem")
          .select("*")
          .eq("venue_id", venueId)

        console.log("Venue redeem items:", venueRedeemItems)

        if (venueRedeemError) throw venueRedeemError

        // Fetch all redeem_items
        const { data: allRedeemItems, error: redeemItemsError } = await supabase.from("redeem_items").select("*")

        console.log("All redeem items:", allRedeemItems)

        if (redeemItemsError) throw redeemItemsError

        // Link venue_redeemitem with redeem_items
        const linkedItems = venueRedeemItems.map((venueItem) => {
          const redeemItem = allRedeemItems.find((item) => item.id === venueItem.item_id)
          return {
            id: venueItem.id,
            name: redeemItem?.item_name || "Unknown Item",
            description: redeemItem?.item_description || "",
            price: venueItem?.amount || 0,
            image: redeemItem?.pic_path || "",
          }
        })

        console.log("Linked items:", linkedItems)
        setRedeemableItems(linkedItems)
      } catch (error) {
        console.error("Error fetching data:", error.message)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [venueId])

  const totalAmount = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, quantity]) => {
      const item = redeemableItems.find((item) => item.id.toString() === id) // Ensure id is compared as a string
      return sum + (item?.price ?? 0) * quantity
    }, 0)
  }, [selectedItems, redeemableItems]) // Ensure dependencies trigger recalculation


  const handleAddItem = (itemId: string) => {
    if (canAddItem(itemId)) {
      setSelectedItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }))
    } else {
      console.warn("Not enough balance to add this item")
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newCount = (prev[itemId] || 0) - 1
      if (newCount <= 0) {
        const { [itemId]: _, ...newItems } = prev
        return newItems
      }
      return { ...prev, [itemId]: newCount }
    })
  }


  const canAddItem = (itemId: string) => {
    console.log(`canAddItem called for itemId: ${itemId}`);

    const item = redeemableItems.find((item) => item.id === Number(itemId)); // Convert itemId to number
    if (!item) {
      console.log(`Item not found for itemId: ${itemId}`);
      return false;
    }

    const newTotal = parseFloat(totalAmount) + parseFloat(item.price);
    console.log(`Checking item ${itemId} | Price: ${item.price} | New Total: ${newTotal} | Balance: ${balance}`);

    return newTotal <= balance;
  };


  const handleSubmit = () => {

    const redeemedItems = Object.entries(selectedItems).map(([id, quantity]) => {
      const item = redeemableItems.find((item) => item.id === Number(id))
      return {
        id,
        name: item?.name || "",
        quantity,
        price: item?.price || 0,
      }
    })
    console.log(redeemedItems)
    onComplete(bookingData, redeemedItems.length > 0 ? redeemedItems : null)
  }

  if (loading) {
    return <div className="text-center">Loading redeemable items...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Balance Header */}
      <div className="bg-purple-900/50 p-4 rounded-lg flex justify-between items-center">
        <span>Your Drink $$</span>
        <span className="flex items-center gap-1">
          {balance !== null ? balance.toFixed(2) : "Loading..."}
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL || "/placeholder.svg"}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
            alt="coins"
            width={16}
            height={16}
            className="rounded-full"
          />
        </span>
      </div>

      {/* Redeemable Items */}
      <div className="space-y-4">
        {redeemableItems.map((item) => (
          <div key={item.id} className="bg-zinc-900 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL || "/placeholder.svg"}/storage/v1/object/public/${item.image}` ||
                  "/placeholder.svg"
                }
                alt={item.name}
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-zinc-400">{item.description}</p>
                <span className="flex items-center gap-1">
                  {item.price}
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL || "/placeholder.svg"}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                    alt="coins"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedItems[item.id] ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{selectedItems[item.id]}</span>
                  <button
                    onClick={() => handleAddItem(item.id)}
                    className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleAddItem(item.id)}
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {!canAddItem(item.id) && <p className="text-xs text-red-500 mt-1">Insufficient balance</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Total and Actions */}
      <div className="space-y-4">
        {Object.keys(selectedItems).length > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span>Total:</span>
            <span className="flex items-center gap-1">
              {totalAmount.toFixed(2)}
              <Image
                src="/placeholder.svg?height=16&width=16&text=$"
                alt="coins"
                width={16}
                height={16}
                className="rounded-full"
              />
              ({Object.values(selectedItems).reduce((sum, quantity) => sum + quantity, 0)} items)
            </span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {Object.keys(selectedItems).length > 0 ? "REDEEM & BOOK" : "CONTINUE WITHOUT REDEEMING"}
          </Button>
          {Object.keys(selectedItems).length === 0 && (
            <Button onClick={onSkip} variant="outline" className="w-full border-zinc-800 hover:bg-zinc-900">
              SKIP
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

