"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import MovieGrid from "@/components/movie-grid"
import { getPopularAnime, searchAnime, Anime } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function AnimePage() {
  const [anime, setAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true)
        let animeData: Anime[]
        
        if (searchQuery) {
          animeData = await searchAnime(searchQuery)
        } else {
          animeData = await getPopularAnime()
        }
        
        setAnime(animeData)
        setError(null)
      } catch (err) {
        console.error("Error fetching anime:", err)
        setError("Failed to load anime. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [searchQuery])

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Anime"}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : anime.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No anime found.</p>
          </div>
        ) : (
          <MovieGrid movies={anime} limit={24} />
        )}
      </div>
    </DashboardLayout>
  )
}
