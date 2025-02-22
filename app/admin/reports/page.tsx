"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

export default function ReportsPage() {
  const [month, setMonth] = useState("October")
  const [year, setYear] = useState("2024")

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold mb-1">Report</h1>
      <p className="text-gray-400 text-sm mb-6">Reports from all bookings completed in the current month</p>

      <div className="flex gap-4 mb-6">
        <Select defaultValue={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={year} onValueChange={setYear}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {["2024", "2025"].map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-4">
        <h2 className="text-gray-400 mb-2">Total Alcohol Revenue</h2>
        <p className="text-3xl font-bold mb-6">$999.50</p>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-4">Top Spenders</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                <span>Abhay Andhariya</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500">$235.23</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                <span>Customer Name 2</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500">$121.23</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                <span>Customer Name 3</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500">$105.23</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>

        <button className="text-fuchsia-500 text-sm">READ MORE</button>
      </Card>

      {/* Bookings Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-4">
        <h2 className="text-gray-400 mb-2">Total Bookings</h2>
        <p className="text-3xl font-bold mb-6">123</p>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-4">Top Customers</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                <span>Abhay Andhariya</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500">32</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                <span>Customer Name 2</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500">28</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                <span>Customer Name 3</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500">27</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>

        <button className="text-fuchsia-500 text-sm">READ MORE</button>
      </Card>

      {/* Payout Card */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h2 className="text-gray-400 mb-2">Total Payout</h2>
        <p className="text-3xl font-bold mb-6">$1,234.50</p>

        <button className="text-fuchsia-500 text-sm">READ MORE</button>
      </Card>
    </div>
  )
}

