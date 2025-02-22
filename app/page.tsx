import Header from '@/components/header'
import { HomeBanner } from '@/components/home-banner'
import { Hero } from '@/components/hero'
import { CategorySection } from '@/components/category-section'
import { VibeSection } from '@/components/home/vibe-section'
import { VenueSection } from '@/components/venue-section'
import { InterestSection } from '@/components/interest-section'
import { TopPicks } from '@/components/top-picks'
import { LatestPosts } from '@/components/latest-posts'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen pb-8 overflow-x-hidden">
      <Header />
      <HomeBanner />
      <div className="px-4 space-y-12 max-w-7xl mx-auto">
        <Hero />
        <VibeSection />
        <VenueSection />
        <TopPicks />
        <InterestSection />
        <LatestPosts />
        <Footer />
      </div>
      
    </main>
  )
}

