import Link from "next/link"
import DOMPurify from 'dompurify';

interface BlogCardProps {
  id: string
  date: string
  title: string
  tags: string[]
  description: string
  image: string
}

export function BlogCard({ id, date, title, tags, description, image }: BlogCardProps) {

  const sanitizeAndFilterHTML = (html) => {
    if (!html) return "";

    // Create a temporary DOM element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = DOMPurify.sanitize(html); // Sanitize first

    // Find and remove the first <img> tag
    const firstImg = tempDiv.querySelector("img");
    if (firstImg) {
      firstImg.remove();
    }

    return tempDiv.innerHTML; // Return the updated HTML
  };

  return (
    <div className="space-y-2 h-full bg-zinc-900 rounded-lg overflow-hidden">
      <div className="relative aspect-[16/9]">
        <img src={image || "/placeholder.svg"} alt={title} className="object-cover w-full h-full" />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-zinc-400">{new Date(date).toLocaleDateString()}</p>
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 text-xs rounded-lg bg-[#953553] text-purple-300">
              {tag}
            </span>
          ))}
        </div>
        <p 
          className="text-sm text-zinc-400 line-clamp-2" 
          dangerouslySetInnerHTML={{ __html: sanitizeAndFilterHTML(description) }} 
        />
        <Link
          href={`/blog/${id}`}
          className="text-[#DE3163] underline hover:text-[#DE3163] text-sm font-medium flex items-center gap-1"
        >
          READ DETAILS
          <span className="text-base text-white no-underline"></span>
        </Link>
      </div>
    </div>
  )
}

