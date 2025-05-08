"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Anime, getAnimeDetails } from "@/lib/api"
import Image from "next/image"
import { Loader2, Calendar, Star, Tv, Clock, Users } from "lucide-react"
import { WatchStatusDropdown } from "@/components/watch-status-dropdown"

export default function AnimeDetailsPage() {
  const params = useParams()
  const animeId = params.id as string
  const [anime, setAnime] = useState<Anime | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const animeDetails = await getAnimeDetails(animeId)
        setAnime(animeDetails)
      } catch (err) {
        console.error('Error fetching anime details:', err)
        setError('Failed to load anime details. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnimeDetails()
  }, [animeId])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !anime) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Anime not found'}
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
                src={anime.posterUrl || "/placeholder.svg"}
                alt={anime.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="mt-4">
              <WatchStatusDropdown 
                contentId={anime.id} 
                contentType="anime"
                totalSeasons={1}
                totalEpisodes={anime.episodes || 1}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium">{anime.rating.toFixed(1)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{anime.year}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Tv className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{anime.status || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">Anime</p>
                </div>
              </div>

              {anime.episodes && (
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <Tv className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Episodes</p>
                    <p className="font-medium">{anime.episodes} {anime.episodes === 1 ? 'episode' : 'episodes'}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              {anime.summary ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {anime.summary.replace(/<[^>]*>?/gm, '')}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No overview available for this anime.
                </p>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {anime.episodes && (
                  <div className="flex items-center gap-2">
                    <Tv className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Episodes</p>
                      <p className="font-medium">{anime.episodes}</p>
                    </div>
                  </div>
                )}
                
                {anime.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{anime.duration} min</p>
                    </div>
                  </div>
                )}
                
                {anime.studios && anime.studios.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Studios</p>
                      <p className="font-medium">{anime.studios.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
