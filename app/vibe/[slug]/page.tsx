import { notFound } from "next/navigation"
import HappyHours from "@/components/vibe/happy-hours"
import Activities from "@/components/vibe/activities"
import ExclusiveForMen from "@/components/vibe/exclusive-for-men"
import LadiesNight from "@/components/vibe/ladies-night"
import ClassyChill from "@/components/vibe/classy-chill"
import Header from "@/components/header"
import { Footer } from "@/components/footer"

const vibeComponents = {
  "happy-hours": HappyHours,
  activities: Activities,
  "exclusive-for-men": ExclusiveForMen,
  "ladies-night": LadiesNight,
  "classy-chill": ClassyChill,
}

export default function VibePage({ params }: { params: { slug: string } }) {
  const VibeComponent = vibeComponents[params.slug as keyof typeof vibeComponents]

  if (!VibeComponent) {
    notFound()
  }

  return (
  <>
    <Header />
    <VibeComponent />
    <Footer />
  </>
  )
}

