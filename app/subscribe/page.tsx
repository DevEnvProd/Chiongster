"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Gift, Coins, Crown, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Header from "@/components/header"

const benefits = [
  {
    icon: Gift,
    title: "Member's-Only Offer",
    description: "Receive exclusive offers and promotions, tailored just for our members",
  },
  {
    icon: Coins,
    title: "Earn Cashback",
    description:
      "Earn up to 20% cashback on alcohol reservations! Use your rewards for future bookings and save more every time.",
  },
  {
    icon: Crown,
    title: "Access to Exclusive Content",
    description: "Enjoy exclusive content like special events and photos, curated to keep you informed and inspired!",
  },
  {
    icon: Calendar,
    title: "Track Alcohol Balance Expiry",
    description:
      "Track your alcohol balance and expiry dates to never miss out! Members can even extend expiry periods with their next booking.",
  },
]

const sections = [
  {
    title: "FOR CHIONGSTER",
    items: ["About Us", "Contact Us", "Terms & Conditions", "Privacy Policy"],
  },
  {
    title: "DISCOVER",
    items: ["Nightlife Guide", "Events", "Blog", "Featured Places"],
  },
]

export default function SubscribePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">Subscribe to Pro Chiongster</span>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-8 max-w-xl mx-auto">
        <div className="space-y-2 gap-4 p-4 bg-zinc-900/50 rounded-lg">
          <h2 className="text-1.9x1 font-bold">
            Join and Subscribe as a Premium Member to <span className="text-amber-500">Enjoy Exclusive Benefits</span>
          </h2>
        </div>

        {/* Benefits Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Membership&apos;s Benefits</h2>
          <div className="space-y-4 gap-4 bg-zinc-900/50 rounded-lg">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4 p-4">
                <div className="shrink-0 border border-zinc-500 rounded-full w-8 h-8 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-purple-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">{benefit.title}</h3>
                  <p className="text-sm text-zinc-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {sections.map((section) => (
              <AccordionItem key={section.title} value={section.title} className="border-b border-zinc-800">
                <AccordionTrigger className="flex items-center justify-between py-4 w-full hover:no-underline">
                  <span className="text-sm font-medium">{section.title}</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pb-4">
                    {section.items.map((item) => (
                      <button key={item} className="block w-full text-left py-2 text-sm text-zinc-400 hover:text-white">
                        {item}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-800 space-y-4">
        <Button
          onClick={() => router.push("/subscribe/select-plan")}
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-[#6D1DDB] to-[#B31DC6] hover:from-[#6D1DDB]/90 hover:to-[#B31DC6]/90"
        >
          SUBSCRIBE NOW
        </Button>
        <div className="text-center">
          <Link href="/" className="text-[#FF2D92] text-sm font-medium hover:text-[#FF2D92]/90">
            CONTINUE AS A NORMAL USER
          </Link>
        </div>
      </div>
    </div>
  )
}

