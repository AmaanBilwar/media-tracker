"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Movie, getMovieDetails } from "@/lib/api"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { WatchStatusDropdown } from "@/components/watch-status-dropdown"

export default function MovieDetailsPage() {
  const params = useParams()
  const movieId = params.id as string
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieDetails = await getMovieDetails(movieId)
        setMovie(movieDetails)
      } catch (err) {
        console.error('Error fetching movie details:', err)
        setError('Failed to load movie details. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movieId])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !movie) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Movie not found'}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
              <Image
                src={movie.posterUrl || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="mt-4">
              <WatchStatusDropdown contentId={movie.id} contentType="movie" />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg font-medium">{movie.rating.toFixed(1)}</span>
              <span className="text-gray-500">{movie.year}</span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-700">{movie.overview}</p>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      <div className="relative aspect-square rounded-full overflow-hidden mb-2">
                        <Image
                          src={actor.profileUrl || "/placeholder.svg"}
                          alt={actor.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <p className="font-medium text-sm">{actor.name}</p>
                      <p className="text-xs text-gray-500">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
