import { useState, useEffect } from "react"
import { MainMenu } from "@/components/main-menu"
import { GuestMenu } from "@/components/guest-menu"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="bg-black text-white min-h-screen flex flex-col">{children}</div>
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
