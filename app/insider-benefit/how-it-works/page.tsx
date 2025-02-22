"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Share2, Coins, PartyPopper } from "lucide-react"
import Header from "@/components/header"
import { Footer } from "@/components/footer"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <Link href="/insider-benefit" className="text-zinc-400 hover:text-white">
          Insider Benefit
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">How It Works</span>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="space-y-4 bg-zinc-900 rounded-[25px] p-4">
          <h1 className="text-2xl font-bold">
            Earn <span className="text-[#FFD700]">unlimited Drink Dollars</span> while your friends drink!
          </h1>
          <p className="text-zinc-400 text-xs">Refer, Rack up rewards and keep the drinks coming</p>
          <p className="text-zinc-300">The more they drink, the more you both benefit – As easy as that!</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center bg-gradient-to-r from-black via-zinc-800 to-black rounded-[25px] p-6 shadow-lg w-full max-w-md">
            {/* First Column: SVG Icon */}
            <div className="w-1/4 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#pinkGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-14 h-14"
              >
                <defs>
                  <linearGradient id="pinkGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6A0572" />
                    <stop offset="100%" stopColor="#D4145A" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 9l10 13 10-13-10-7z"></path>
              </svg>
            </div>

            {/* Second Column: Text & Buttons */}
            <div className="w-3/4 flex flex-col gap-3">
              {/* Top Row: Text */}
              <h2 className="text-white font-semibold text-lg">
                Sign up to earn more dollars!
              </h2>

              {/* Bottom Row: Buttons */}
              <div className="flex gap-3">
                <Link href="/register">
                  <Button className="flex-1 bg-gradient-to-r from-[#6A0572] to-[#D4145A] text-white px-4 py-2 rounded-md">
                    SIGN UP
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="flex-1 border border-white text-white px-4 py-2 rounded-md hover:bg-zinc-800">
                    LOG IN
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        {/* How it Works Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">How it works</h2>

          <div className="space-y-8 bg-zinc-900 rounded-[25px] p-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Share the fun</h3>
                <p className="text-zinc-400">
                  Share your unique referral link and get your friends into the insider circle
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">They drink = unlimited Drink dollar</h3>
                <p className="text-zinc-400">When your friends drink, you both earn Drink Dollar- simple as that</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Good times multiply</h3>
                <p className="text-zinc-400">Use your Drink Dollar for more drinks and keep the fun flowing</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <hr className="border-t border-gray-600" />
              <h3 className="font-semibold text-lg">Benefits</h3>
              <p className="text-zinc-400">
                Every drink your friend has earns you Drink Dollars – more drinks for them mean more rewards for you. It is
                the easiest way to keep the good times going!
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

