"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon, ChevronRight } from "lucide-react"
import { Calendar, FileText, Diamond, LogOut } from "lucide-react"
import type React from "react" // Added import for React

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  slug: string
}

export function AdminMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState("My Bookings")

  const menuItems: MenuItem[] = [
    { icon: Calendar, label: "My Bookings", slug: "/admin/bookings" },
    { icon: FileText, label: "Report", slug: "/admin/report" },
    { icon: Diamond, label: "Insider Benefits", slug: "/admin/insider-benefits" },
  ]

  const handleMenuItemClick = (item: MenuItem) => {
    setSelectedItem(item.label)
    router.push(item.slug)
    setOpen(false)
  }

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/admin/login")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-1">
          <MenuIcon className="w-6 h-6 text-white" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0 bg-[#121212] border-zinc-800">
        <div className="flex flex-col h-full">
          {/* Admin Profile Section */}
          <div className="relative h-[120px] bg-[#1E1E1E] p-4">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white"></button>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                <span className="text-2xl text-white">A</span>
              </div>
              <div>
                <h2 className="font-semibold text-white text-lg">Admin Name</h2>
                <p className="text-sm text-white/90">Admin Role</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-2 p-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center justify-between w-full px-6 py-4 hover:bg-zinc-900/50 transition-colors ${
                  selectedItem === item.label ? "text-[#FF1493] bg-[#FF1493]/5" : "text-white"
                }`}
                onClick={() => handleMenuItemClick(item)}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-6 h-6 ${selectedItem === item.label ? "text-[#FF1493]" : "text-white"}`} />
                  <span className="text-[15px]">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </button>
            ))}
          </div>

          {/* Log Out */}
          <div className="border-t border-zinc-800">
            <button
              className="flex items-center gap-4 w-full px-6 py-4 hover:bg-zinc-900/50 text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[15px]">Log Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

