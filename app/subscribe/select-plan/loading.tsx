import Header from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Breadcrumb */}
      <div className="px-4 py-4">
        <Skeleton className="h-4 w-48 bg-zinc-800" />
      </div>

      {/* Main Content */}
      <div className="px-4 max-w-md mx-auto pb-8">
        <Skeleton className="h-8 w-64 mb-6 bg-zinc-800" />

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-zinc-900/50 rounded-lg p-4 space-y-4">
              <div>
                <Skeleton className="h-4 w-24 bg-zinc-800" />
                <Skeleton className="h-8 w-32 mt-2 bg-zinc-800" />
                <Skeleton className="h-4 w-36 mt-2 bg-zinc-800" />
              </div>
              <Skeleton className="h-10 w-full bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

