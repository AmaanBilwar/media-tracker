"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Show, getShowDetails } from "@/lib/api"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { WatchStatusDropdown } from "@/components/watch-status-dropdown"

export default function ShowDetailsPage() {
  const params = useParams()
  const showId = params.id as string
  const [show, setShow] = useState<Show | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const showDetails = await getShowDetails(showId)
        setShow(showDetails)
      } catch (err) {
        console.error('Error fetching show details:', err)
        setError('Failed to load show details. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchShowDetails()
  }, [showId])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !show) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Show not found'}
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
                src={show.posterUrl || "/placeholder.svg"}
                alt={show.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="mt-4">
              <WatchStatusDropdown contentId={show.id} contentType="show" />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{show.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg font-medium">{show.rating.toFixed(1)}</span>
              <span className="text-gray-500">{show.year}</span>
              {show.status && <span className="text-gray-500">{show.status}</span>}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-700">{show.summary}</p>
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {show.genres.map((genre) => (
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 