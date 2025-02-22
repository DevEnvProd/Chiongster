"use client"

import { useState, useRef, useEffect } from "react"
import { Martini, Users, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface ImageGallery {
  id: string
  image_paths: string[]
}

interface VenuePhotosProps {
    imageGallery?: ImageGallery[]
}

export function VenuePhotos({ imageGallery }: VenuePhotosProps) {
if (!imageGallery) {
    return <div>Loading...</div>;
}

  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScrollWidth, setMaxScrollWidth] = useState(0)

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Amount to scroll on each button click
      const newPosition =
        direction === "left"
          ? Math.max(scrollPosition - scrollAmount, 0)
          : Math.min(scrollPosition + scrollAmount, maxScrollWidth);

      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setScrollPosition(newPosition);
    }
  };

  const handleScrollEvent = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };

  return (
   <div className="space-y-8">
      {/* Image Gallery Section */}
      <div className="grid grid-cols-3 gap-4">

      {imageGallery.length > 0 ? (
        imageGallery.flatMap((item) => {
          // Parse `image_paths` if it's a stringified array
          let paths = [];
          try {
            paths = Array.isArray(item.image_path)
              ? item.image_path
              : JSON.parse(item.image_path); // Safely parse
          } catch {
            console.error("Invalid image_paths format", item.image_paths);
            paths = []; // Fallback to an empty array
          }

          return paths.map((path, index) => (
            <div key={`${item.id}-${index}`} className="aspect-square relative">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galleries/${path}`}
                className="w-full h-full object-cover rounded-lg"
                alt={`Gallery Image ${index + 1}`}
              />
            </div>
          ));
        })
      ) : (
        <div className="col-span-full text-center text-gray-500">No images available</div>
      )}
          
      </div>
    </div> 
  )
}

