"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Anime, getPopularAnime, searchAnime } from "@/lib/api"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { WatchStatusDropdown } from "@/components/watch-status-dropdown"
import { LoadingMessage } from "@/components/loading-message"

export default function AnimePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const [anime, setAnime] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setIsLoading(true)
        setError(null)
        let animeData: Anime[] = []
        
        if (searchQuery) {
          animeData = await searchAnime(searchQuery)
        } else {
          animeData = await getPopularAnime()
        }
        
        setAnime(animeData || [])
      } catch (err) {
        console.error("Error fetching anime:", err)
        setError("Failed to load anime. Please try again later.")
        setAnime([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnime()
  }, [searchQuery])

  const handleAnimeClick = (animeId: string) => {
    router.push(`/anime/${animeId}`)
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Anime"}
        </h1>
        
        {isLoading ? (
          <LoadingMessage pageType="anime" />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : anime.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No anime found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {anime.map((anime) => (
              <div 
                key={anime.id} 
                className="group cursor-pointer"
                onClick={() => handleAnimeClick(anime.id)}
              >
                <div className="relative overflow-hidden rounded-lg">
                  <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                    <Image
                      src={anime.posterUrl || "/placeholder.svg"}
                      alt={anime.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />

                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-md px-1.5 py-0.5">
                      <span className="text-xs font-medium text-white">{anime.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-sm truncate">{anime.title}</h3>
                  {anime.year && <p className="text-xs text-gray-400">{anime.year}</p>}
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <WatchStatusDropdown contentId={anime.id} contentType="anime" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
