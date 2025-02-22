'use client'

import Link from 'next/link'
import { Copy, Share2, Diamond, Gift } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Header from '@/components/header'
import { Footer } from '@/components/footer'
import { supabase } from "@/lib/supabase"

interface Referral {
  name: string
  date: string
  status: 'active' | 'inactive'
}

const referrals: Referral[] = [
  { name: "John Doe", date: "12 Jan 2024", status: 'active' },
  { name: "Jane Smith", date: "11 Jan 2024", status: 'active' },
  { name: "Mike Johnson", date: "10 Jan 2024", status: 'active' },
  { name: "Sarah Williams", date: "09 Jan 2024", status: 'active' }
]

const tiers = [
  { percentage: '10%', range: '1-4 referrals', min: 1, max: 4 },
  { percentage: '15%', range: '5-9 referrals', min: 5, max: 9 },
  { percentage: '20%', range: '>10 referrals', min: 10, max: Infinity }
]

export default function InsBenefitsPage() {
  const [inviteCode] = useState('RKAMDENANDEK')
  const [activeReferrals, setActiveReferrals] = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [referralList, setReferralList] = useState([])
  const totalRewards = 0

  const profileId = typeof window !== "undefined" ? localStorage.getItem("profileId") : null

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!profileId) return

      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact" }) // Count the matching rows
        .eq("referrer", profileId);

      if (error) {
        console.error("Error fetching referral count:", error);
      } else {
        console.log(`User ${profileId} has referred ${count} users.`);
        setActiveReferrals(count || 0)
      }

      const { data: code , error: codeError } = await supabase
        .from("profiles")
        .select("referral_code") // Count the matching rows
        .eq("id", profileId);

      setReferralCode(code[0].referral_code)

      const { data: referralList , error: referralListError } = await supabase
        .from("profiles")
        .select("id, username, created_at") // Count the matching rows
        .eq("referrer", profileId);

      setReferralList(referralList)
    }

    fetchReferrals()
  }, [profileId])

  const currentTier = tiers.find(
    tier => activeReferrals >= tier.min && activeReferrals <= tier.max
  )

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Chiongsters!',
        text: `Use my invite code: ${referralCode}`,
        url: 'https://'
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">Home</Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">Insider Benefit</span>
      </div>

      {/* Stats Cards */}
      <div className="px-4 space-y-4">
        <div className="bg-[#1E1E1E] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <Diamond className="w-8 h-8 text-[#FF1493]" />
          </div>
          <div>
            <div className="text-sm text-zinc-400">Active Referrals</div>
            <div className="text-3xl font-bold">{activeReferrals}</div>
          </div>
        </div>

        <div className="bg-[#1E1E1E] rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <Gift className="w-8 h-8 text-[#FF1493]" />
          </div>
          <div>
            <div className="text-sm text-zinc-400">Total Rewards</div>
            <div className="text-3xl font-bold flex items-center gap-1">
              {totalRewards}
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                alt="Dollar Coin"
                className="w-15 h-15 ml-1"
              />
            </div>
          </div>
        </div>

        <button className="text-[#FF1493] text-sm font-medium">
          HOW IT WORKS
        </button>
      </div>

      {/* Tiers Section */}
      <div className="px-4 mt-8">
        <div className="space-y-2 mb-4">
          <h2 className="text-xl font-bold">Your Tiers</h2>
          {activeReferrals > 0 ? (
            <p className="text-white text-sm">
              <span className="text-[#FFA500]"> {activeReferrals} more sign up</span> to reach the next tier!
            </p>
          ) : (
            <p className="text-white text-sm">No referrals yet. Start referring to earn tiers!</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier, index) => (
            <div
              key={tier.percentage}
              className={`p-3 rounded-xl text-center relative ${
                index === 0
                  ? 'border-2 border-[#FF1493] bg-[#FF1493]/10'
                  : 'bg-[#1E1E1E]'
              }`}
            >
              <div className="text-lg font-bold">{tier.percentage}</div>
              <div className="text-xs text-zinc-400">{tier.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Code Section */}
      <div className="px-4 mt-8 space-y-4">
        <h2 className="text-xl font-bold">Your Invite Code</h2>
        <div className="bg-[#1E1E1E] rounded-xl p-4 flex items-center justify-between">
          <div className="font-mono text-lg">{referralCode}</div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyCode}>
              <Copy className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Referrals Section */}
      <div className="px-4 mt-8">
        <Accordion type="single" collapsible className="w-full bg-[#1E1E1E] p-3 rounded-lg">
          <AccordionItem value="referrals">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">My Referrals</h2>
                <span className="text-sm text-zinc-400">({referralList?.length || 0})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 mt-4">
                {referralList?.length > 0 ? (
                  referralList.map((referral) => (
                    <div key={referral.id} className="bg-[#1E1E1E] rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{referral.username}</div>
                      </div>
                      <div
                        className={`text-sm ${referral.status === "active" ? "text-emerald-500" : "text-zinc-400"}`}
                      >
                        {new Date(referral.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-400">No referrals found.</div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Footer />
    </div>
  )
}

