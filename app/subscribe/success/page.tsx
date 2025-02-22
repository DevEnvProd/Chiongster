import { Suspense } from "react"
import SubscriptionSuccessClient from "./SubscriptionSuccessClient"
import Header from "@/components/header"

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <SubscriptionSuccessClient />
      </Suspense>
    </div>
  )
}

