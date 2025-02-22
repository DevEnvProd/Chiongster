import type React from "react"
import { AdminHeader } from "@/components/admin/header"

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-black"><AdminHeader />{children}</div>
}

