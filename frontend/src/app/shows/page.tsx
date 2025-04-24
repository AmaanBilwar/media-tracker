"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Show } from "@/lib/api"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { WatchStatusDropdown } from "@/components/watch-status-dropdown"
import { LoadingMessage } from "@/components/loading-message"

export default function ShowsPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const router = useRouter()
  const [shows, setShows] = useState<Show[]>([])
  const [filteredShows, setFilteredShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true)

  // Fetch popular TV shows from TMDB API - only runs once on initial load
  useEffect(() => {
    const fetchShows = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch popular TV shows from TMDB API
        const response = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=${page}`)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Format the shows to match our Show interface
        const formattedShows = data.results.map((show: any) => ({
          id: String(show.id),
          title: show.name,
          posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder.svg?height=450&width=300",
          rating: show.vote_average || 0,
          year: show.first_air_date?.substring(0, 4) || "",
          summary: show.overview,
          genres: [], // We'll need to fetch genres separately if needed
          status: show.status,
          type: "show"
        }))
        
        // Sort shows by rating (highest first)
        const sortedShows = formattedShows.sort((a: Show, b: Show) => b.rating - a.rating)
        
        if (page === 1) {
          setShows(sortedShows)
          setFilteredShows(sortedShows)
        } else {
          setShows(prev => [...prev, ...sortedShows])
          setFilteredShows(prev => [...prev, ...sortedShows])
        }
        
        setHasMore(data.page < data.total_pages)
      } catch (err) {
        console.error('Error fetching shows:', err)
        setError('Failed to load shows. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!searchQuery) {
      fetchShows()
    }
  }, [page, searchQuery])

  // Handle search from URL
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredShows(shows)
      setIsSearching(false)
      return
    }
    
    const searchShows = async () => {
      setIsSearching(true)
      setError(null)
      
      try {
        // Reset search page when query changes
        if (searchPage === 1) {
          setFilteredShows([])
        }
        
        // Search TV shows using TMDB API
        const response = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=${searchPage}`
        )
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Format the shows to match our Show interface
        const formattedShows = data.results.map((show: any) => ({
          id: String(show.id),
          title: show.name,
          posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/placeholder.svg?height=450&width=300",
          rating: show.vote_average || 0,
          year: show.first_air_date?.substring(0, 4) || "",
          summary: show.overview,
          genres: [], // We'll need to fetch genres separately if needed
          status: show.status,
          type: "show"
        }))
        
        if (searchPage === 1) {
          setFilteredShows(formattedShows)
        } else {
          setFilteredShows(prev => [...prev, ...formattedShows])
        }
        
        setHasMoreSearchResults(data.page < data.total_pages)
      } catch (err) {
        console.error('Error searching shows:', err)
        setError('Failed to search shows. Please try again later.')
      } finally {
        setIsSearching(false)
      }
    }
    
    searchShows()
  }, [searchQuery, searchPage])

  const loadMore = () => {
    if (searchQuery.trim()) {
      if (!isSearching && hasMoreSearchResults) {
        setSearchPage(prev => prev + 1)
      }
    } else {
      if (!isLoading && hasMore) {
        setPage(prev => prev + 1)
      }
    }
  }

  const handleShowClick = (showId: string) => {
    router.push(`/shows/${showId}`)
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">
          {searchQuery ? `Search Results for "${searchQuery}"` : "TV Shows"}
        </h1>
        
        {/* Loading state */}
        {isLoading && page === 1 && !searchQuery ? (
          <LoadingMessage pageType="shows" />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredShows.length === 0 && !isSearching ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No shows found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {filteredShows.map((show) => (
                <div 
                  key={show.id} 
                  className="group cursor-pointer"
                  onClick={() => handleShowClick(show.id)}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                      <Image
                        src={show.posterUrl || "/placeholder.svg"}
                        alt={show.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />

                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-md px-1.5 py-0.5">
                        <span className="text-xs font-medium text-white">{show.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-sm truncate">{show.title}</h3>
                    {show.year && <p className="text-xs text-gray-400">{show.year}</p>}
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <WatchStatusDropdown contentId={show.id} contentType="show" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load more button */}
            {(hasMore || hasMoreSearchResults) && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading || isSearching}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || isSearching ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
