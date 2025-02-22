import Link from "next/link"
import type React from "react"
import Header from "@/components/header"

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
    <Header />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {children}
    </div>
    </div>
  )
}

