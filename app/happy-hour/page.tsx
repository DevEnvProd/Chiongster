'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MenuIcon } from 'lucide-react'
import Header from '@/components/header'
import { Footer } from '@/components/footer'

const categories = [
  {
    title: 'Pub',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U9eT1Nb4Un5dVSt4hkyQQXn4wxXClG.png', // This should be replaced with actual pub image
    slug: 'pub'
  },
  {
    title: 'Lounge & Bar',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U9eT1Nb4Un5dVSt4hkyQQXn4wxXClG.png', // This should be replaced with actual lounge image
    slug: 'lounge-and-bar'
  },
  {
    title: 'KTV Nightclub',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U9eT1Nb4Un5dVSt4hkyQQXn4wxXClG.png', // This should be replaced with actual KTV image
    slug: 'ktv-nightclub'
  }
]

export default function HappyHourPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="px-4 py-2 text-sm text-zinc-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Happy Hour</span>
      </div>

      {/* Hero Banner */}
      <div className="relative h-[200px] mb-8">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=400&width=800&text=Happy+Hour"
            alt="Happy Hour"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-purple-900/50" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">HAPPY HOUR</h1>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-4 space-y-6">
        <h2 className="text-xl font-semibold">Select Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.title} 
              href={`/category/${category.slug}`}
              className="block"
            >
              <div className="relative h-[160px] rounded-lg overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=320&width=640&text=${category.title}`}
                  alt={category.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <Footer />
      </div>
    </main>
  )
}

