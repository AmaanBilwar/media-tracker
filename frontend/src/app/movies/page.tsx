"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Movie, getPopularMovies, searchMovies as searchMoviesApi } from "@/lib/api"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { WatchStatusDropdown } from "@/components/watch-status-dropdown"
import { LoadingMessage } from "@/components/loading-message"

export default function MoviesPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(true)

  // Fetch popular movies from TMDB API
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const popularMovies = await getPopularMovies(page)
        
        if (page === 1) {
          setMovies(popularMovies)
          setFilteredMovies(popularMovies)
        } else {
          setMovies(prev => [...prev, ...popularMovies])
          setFilteredMovies(prev => [...prev, ...popularMovies])
        }
        
        // If we got fewer results than expected, we've reached the end
        setHasMore(popularMovies.length > 0)
      } catch (err) {
        console.error('Error fetching movies:', err)
        setError('Failed to load movies. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!searchQuery) {
      fetchMovies()
    }
  }, [page, searchQuery])

  // Handle search from URL
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredMovies(movies)
        setIsSearching(false)
        return
      }
      
      setIsSearching(true)
      setError(null)
      
      try {
        // Reset search page when query changes
        if (searchPage === 1) {
          setFilteredMovies([])
        }
        
        const results = await searchMoviesApi(searchQuery, searchPage)
        
        if (searchPage === 1) {
          setFilteredMovies(results)
        } else {
          setFilteredMovies(prev => [...prev, ...results])
        }
        
        setHasMoreSearchResults(results.length > 0)
      } catch (err) {
        console.error('Error searching movies:', err)
        setError('Failed to search movies. Please try again.')
      } finally {
        setIsSearching(false)
      }
    }
    
    performSearch()
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

  const handleMovieClick = (movieId: string) => {
    router.push(`/movies/${movieId}`)
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">
          {searchQuery ? `Search Results for "${searchQuery}"` : "All Movies"}
        </h1>
        
        {/* Loading state */}
        {isLoading && page === 1 && !searchQuery ? (
          <LoadingMessage pageType="movies" />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredMovies.length === 0 && !isSearching ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No movies found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="group cursor-pointer"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                      <Image
                        src={movie.posterUrl || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />

                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-md px-1.5 py-0.5">
                        <span className="text-xs font-medium text-white">{movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                    {movie.year && <p className="text-xs text-gray-400">{movie.year}</p>}
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <WatchStatusDropdown contentId={movie.id} contentType="movie" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load more button */}
            {((searchQuery && hasMoreSearchResults) || (!searchQuery && hasMore)) && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={loadMore}
                  disabled={isLoading || isSearching}
                  className="bg-black text-white hover:bg-gray-700 hover:text-white hover:cursor-pointer"
                >
                  {isLoading || isSearching ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
