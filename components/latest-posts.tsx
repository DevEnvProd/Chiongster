"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BlogCard } from "./blog-card"
import { supabase } from "@/lib/supabase"

interface BlogPost {
  id: string
  date: string
  title: string
  tags: string[]
  description: string
  image: string
  tag_ids: number[]
}

interface BlogTag {
  id: number
  tag_name: string
}

export function LatestPosts() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPostsAndTags = async () => {
      try {
        // Fetch blog posts
        const { data: blogData, error: blogError } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })

        if (blogError) throw blogError

        // Fetch all tags
        const { data: tagData, error: tagError } = await supabase.from("blog_tags").select("*")

        if (tagError) throw tagError

        // Create a map of tag ids to tag names
        const tagMap = new Map<number, string>()
        tagData.forEach((tag: BlogTag) => {
          tagMap.set(tag.id, tag.tag_name)
        })

        // Transform and merge the data
        const transformedPosts = blogData.map((post: any) => {
          let postTagIds: number[] = []
          try {
            postTagIds = Array.isArray(post.tags_id) ? post.tags_id : JSON.parse(post.tags_id || "[]")
          } catch (error) {
            console.error("Error parsing tag_ids:", error, post.tag_ids)
          }

          const postTags = postTagIds
            .map((id: number) => {
              return tagMap.get(id)
            })
            .filter(Boolean)

          return {
            id: post.id,
            date: post.created_at,
            title: post.title,
            tags: postTags,
            description: post.content,
            image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.image_path}`,
            tag_ids: postTagIds,
          }
        })

        setPosts(transformedPosts)
      } catch (error) {
        console.error("Error fetching blog posts and tags:", error)
        setError("Failed to load latest posts")
      } finally {
        setLoading(false)
      }
    }

    fetchPostsAndTags()
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = direction === "left" ? -container.offsetWidth : container.offsetWidth
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setScrollPosition(container.scrollLeft + scrollAmount)
    }
  }

  if (loading) {
    return <div className="text-white text-center py-8">Loading latest posts...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <section className="space-y-6 relative">
      <div className="space-y-1 text-center">
        <p className="text-[#FFD54A] text-sm font-medium">Be updated</p>
        <h2 className="text-3xl font-bold text-white font-futura">LATEST POSTS</h2>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex-none w-[300px] md:w-[400px] snap-start bg-[#191919] rounded-lg shadow-lg overflow-hidden"
          >
            <BlogCard
              key={post.id}
              id={post.id}
              date={post.date}
              title={post.title}
              tags={post.tags}
              description={post.description}
              image={post.image}
            />
          </div>
        ))}
      </div>

      <>
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#FFD54A] p-2 rounded-full shadow-md"
          style={{ display: scrollPosition > 0 ? "block" : "none" }}
        >
          <ChevronLeft className="w-6 h-6 text-[#191919]" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#FFD54A] p-2 rounded-full shadow-md"
          style={{
            display:
              scrollPosition < (scrollRef.current?.scrollWidth ?? 0) - (scrollRef.current?.clientWidth ?? 0)
                ? "block"
                : "none",
          }}
        >
          <ChevronRight className="w-6 h-6 text-[#191919]" />
        </button>
      </>
    </section>
  )
}

