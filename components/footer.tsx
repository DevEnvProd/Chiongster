"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { supabase } from "@/lib/supabase"

interface FooterMenuItem {
  id: number
  title: string
  parent_id: number | null
  children?: FooterMenuItem[]
}

export function Footer() {
  const [footerSections, setFooterSections] = useState<FooterMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFooterMenu() {
      try {
        const { data, error } = await supabase.from("footer_menu").select("*").order("id")

        if (error) throw error

        // Structure the data
        const structuredData = data.reduce((acc: FooterMenuItem[], item) => {
          if (item.parent_id === null) {
            acc.push({ ...item, children: [] })
          } else {
            const parent = acc.find((p) => p.id === item.parent_id)
            if (parent) {
              parent.children = parent.children || []
              parent.children.push(item)
            }
          }
          return acc
        }, [])

        setFooterSections(structuredData)
      } catch (error) {
        console.error("Error fetching footer menu:", error)
        setError("Failed to load footer menu")
      } finally {
        setLoading(false)
      }
    }

    fetchFooterMenu()
  }, [])

  if (loading) return <div>Loading footer...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <footer className="mt-12 border-t border-zinc-800">
      <Accordion type="multiple" className="divide-y divide-zinc-900">
        {footerSections.map((section) => (
          <AccordionItem key={section.id} value={section.id.toString()} style={{ borderTopWidth: "1px", borderColor: "gray", borderBottomWidth: "0px" }}>
            <AccordionTrigger className="py-4 text-base font-medium hover:no-underline flex justify-between items-center px-4">
              <div className="flex items-center gap-2">{section.title}</div>
              {section.children && section.children.length > 0 }
            </AccordionTrigger>
            {section.children && section.children.length > 0 && (
              <AccordionContent>
                <div className="space-y-2 px-4 pb-4">
                  {section.children.map((item) => (
                    <button
                      key={item.id}
                      className="block w-full text-left py-2 text-sm text-zinc-400 hover:text-white"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
      <div className="py-6 text-center text-sm text-zinc-500" style={{ borderTopWidth: "1px", borderColor: "gray" }}>Copyright @ Chiongster.com 2025</div>
    </footer>
  )
}

