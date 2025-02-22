"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Beer } from "lucide-react"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

interface Transaction {
  id: string
  type: "bonus" | "benefit" | "drink" | "redeem"
  description: string
  amount: number
  created_at: string
}

const TransactionIcon = ({ type }: { type: Transaction["type"] }) => {
  switch (type) {
    case "bonus":
      return (
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-dd-insider-bonus.svg`}
            alt="Bonus Icon"
            className="w-10 h-10"
          />
        </div>
      )
    case "benefit":
      return (
        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-dd-insider-benefit.svg`}
            alt="Benefit Icon"
            className="w-10 h-10"
          />
        </div>
      )
    case "drink":
      return (
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-dd-drink-dollar.svg`}
            alt="Drink Dollar Icon"
            className="w-10 h-10"
          />
        </div>
      )
    case "redeem":
      return (
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Beer className="w-5 h-5 text-white" />
        </div>
      )
    default:
      return null
  }
}

export default function DrinkDollarsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalDrinkDollars, setTotalDrinkDollars] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      const profileId = localStorage.getItem("profileId")
      if (!profileId) {
        console.error("User not logged in")
        setIsLoading(false)
        return
      }

      try {
        const { data: ddData, error: ddDataError } = await supabase
          .from("drink_dollars")
          .select("coins")
          .eq("user_id", profileId)

        const { data, error } = await supabase
          .from("trans_drink_dollar")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })

        if (error) throw error

        const formattedTransactions: Transaction[] = data.map((item: any) => ({
          id: item.id,
          type: item.trans_title,
          description: item.trans_description,
          amount: item.coins,
          created_at: new Date(item.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }))

        setTransactions(formattedTransactions)
        setTotalDrinkDollars(ddData[0].coins)
        
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.created_at
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, Transaction[]>,
  )

  if (isLoading) {
    return <div className="min-h-screen bg-black text-zinc-300 flex justify-center items-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">My Drink Dollars</span>
      </div>

      {/* Total Drink Dollars Card */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="/path-to-beer-mug-icon.png" alt="Drink Mug Icon" className="w-full h-full" />
            </div>
            <div>
              <div className="text-sm text-white">Total Drink Dollars</div>
              <div className="text-4xl font-bold flex items-center gap-1">
                <span className="text-white">{totalDrinkDollars}</span>
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                  alt="Dollar Coin"
                  className="w-10 h-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS Link */}
        <button className="mt-2 text-pink-500 text-xs font-medium underline block text-center">HOW IT WORKS</button>
      </div>

      {/* Redeem Banner */}
      <div className="px-4 mb-6">
        <button className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍸</span>
            <div>
              <div className="font-semibold">Thirsty? Redeem Now!</div>
              <div className="text-sm text-zinc-400">And earn more benefits</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600" />
        </button>
      </div>

      {/* Transactions History */}
      <div className="px-4">
        <h2 className="text-xl font-bold font-furuta mb-1">My Transactions History</h2>
        <p className="text-sm text-zinc-400 mb-6">All transactions completed in the past 3 months</p>

        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <div key={date}>
              <h3 className="text-sm font-medium mb-3">{date}</h3>
              <div className="space-y-3">
                {dateTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-zinc-900 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TransactionIcon type={transaction.type} />
                      <span className="text-sm">{transaction.description}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold flex items-center ${
                        transaction.amount > 0 ? "text-[#FFA500]" : "text-white"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                        alt="Dollar Coin"
                        className="w-5 h-5 ml-1"
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

