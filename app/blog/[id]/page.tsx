"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import { Footer } from "@/components/footer"

interface BlogPost {
  id: string
  title: string
  content: string
  image_path: string
  created_at: string
  tags: string[]
}

export default function BlogPostPage() {
  const router = useRouter()
  const { id } = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single()

        if (error) throw error

        if (data) {
          // Fetch tags for the post
          const { data: tagData, error: tagError } = await supabase
            .from("blog_tags")
            .select("tag_name")
            .in("id", data.tags_id || [])

          if (tagError) throw tagError

          setPost({
            ...data,
            tags: tagData.map((tag) => tag.tag_name),
          })
        }
      } catch (error) {
        console.error("Error fetching blog post:", error)
        setError("Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBlogPost()
    }
  }, [id])

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {error || "Blog post not found"}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center text-zinc-400 hover:text-white mb-6">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-[#953553] text-white rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-zinc-400 mb-6">{new Date(post.created_at).toLocaleDateString()}</p>
          <div className="relative w-full h-64 mb-6">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${post.image_path}`}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
      <Footer />
    </div>
  )
}

