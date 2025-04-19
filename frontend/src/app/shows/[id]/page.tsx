"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Show, getShowById } from "@/lib/api"
import { Loader2, Star, Calendar, Tag, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ShowDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const [show, setShow] = useState<Show | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!id) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await getShowById(id)
        setShow(data)
      } catch (err) {
        console.error('Error fetching show details:', err)
        setError('Failed to load show details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchShowDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!show) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Show not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-red-500 hover:text-red-600 mb-6 inline-block">
        &larr; Back to Home
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <Image
              src={show.posterUrl || "/placeholder.svg"}
              alt={show.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{show.title}</h1>
          
          <div className="flex items-center gap-4 mb-4">
            {show.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{show.rating.toFixed(1)}</span>
              </div>
            )}
            
            {show.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{show.year}</span>
              </div>
            )}
            
            {show.status && (
              <div className="flex items-center gap-1">
                <Info className="h-5 w-5 text-gray-400" />
                <span>{show.status}</span>
              </div>
            )}
          </div>
          
          {show.genres && show.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres.map((genre) => (
                <span 
                  key={genre} 
                  className="bg-zinc-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {genre}
                </span>
              ))}
            </div>
          )}
          
          {show.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: show.summary }}
              />
            </div>
          )}
          
          <div className="flex gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md">
              Add to Watchlist
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-md">
              Mark as Watched
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 