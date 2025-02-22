"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getBanners } from "@/app/actions/getBanners";

interface BannerImage {
  id: number
  image_path: string
  sequence: number | null
  start_date: string
  end_date: string | null
  url: string | null
}

export function HomeBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const banners = await getBanners();
      setBannerImages(banners);
      setLoading(false);
    };

    fetchData();
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  useEffect(() => {
    if (!loading && bannerImages.length > 0) {
      const interval = setInterval(nextBanner, 5000);
      return () => clearInterval(interval);
    }
  }, [loading, bannerImages]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextBanner();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      prevBanner();
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading banner...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  if (bannerImages.length === 0) {
    return <div className="text-white text-center py-8">No banner images available.</div>
  }

  return (
  <div
    className="relative w-full h-[500px] overflow-hidden"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    {bannerImages.map((banner, index) => (
      <div
        key={banner.id}
        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
          index === currentBanner ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: index === currentBanner ? "auto" : "none" }}
      >
        <a
          href={banner.url || "#"}
          target="_self"
          rel="noopener noreferrer"
          style={{ cursor: banner.url ? "pointer" : "default" }}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banner/${banner.image_path}`}
            alt={`Banner ${index + 1}`}
            fill
            className="object-cover"
          />
        </a>
      </div>
    ))}

    <button
      onClick={prevBanner}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </button>
    <button
      onClick={nextBanner}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full"
    >
      <ChevronRight className="w-6 h-6 text-white" />
    </button>
  </div>
);


}

