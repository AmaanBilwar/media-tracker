"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import MovieGrid from "@/components/movie-grid"
import { MovieSection } from "@/components/movie-section"
import { getAllContentByStatus, Movie, Show, WatchStatus, ContentByStatus } from "@/lib/api"
import { Loader2 } from "lucide-react"
import useSWR from 'swr'

export default function DashboardPage() {
  const [error, setError] = useState<string | null>(null)
  
  // Use SWR for data fetching with caching
  const { data, error: swrError, isLoading } = useSWR<ContentByStatus>(
    '/api/user-content',
    getAllContentByStatus,
    {
      revalidateOnFocus: false, // Don't revalidate when window regains focus
      revalidateOnReconnect: true, // Revalidate when reconnecting
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  )

  // Handle errors
  useEffect(() => {
    if (swrError) {
      console.error('Error fetching content:', swrError)
      setError('Failed to load content. Please try again later.')
    }
  }, [swrError])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </DashboardLayout>
    )
  }

  const renderContentSection = (title: string, movies: Movie[], shows: Show[]) => {
    const hasContent = movies.length > 0 || shows.length > 0
    if (!hasContent) return null

    return (
      <MovieSection title={title}>
        <MovieGrid movies={[...movies, ...shows]} />
      </MovieSection>
    )
  }

  // If no data is available yet, show loading
  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 py-6">
        {renderContentSection("Currently Watching", 
          data.movies.currently_watching, 
          data.shows.currently_watching
        )}

        {renderContentSection("Watch Later", 
          data.movies.watch_later, 
          data.shows.watch_later
        )}

        {renderContentSection("Watched", 
          data.movies.watched, 
          data.shows.watched
        )}

        {renderContentSection("Want to Rewatch", 
          data.movies.rewatch, 
          data.shows.rewatch
        )}

        {Object.values(data.movies).every(movies => movies.length === 0) &&
         Object.values(data.shows).every(shows => shows.length === 0) && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No content in your watchlist yet.</p>
            <p className="text-sm text-gray-400 mt-2">Start adding movies and shows to see them here!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
