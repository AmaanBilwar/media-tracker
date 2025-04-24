"use client"

import { useState } from "react"
import MovieCard from "./movie-card"
import { Movie, Show, Anime, ContentType } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { WatchStatusDropdown } from "./watch-status-dropdown"

type Content = Movie | Show | Anime

interface ContentGridProps {
  content: Content[]
  limit?: number
}

export default function ContentGrid({ content, limit }: ContentGridProps) {
  const displayContent = limit ? content.slice(0, limit) : content

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No content found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {displayContent.map((item) => {
        const contentType = 'type' in item ? item.type as ContentType : 'movie'
        const year = 'year' in item ? String(item.year) : ''
        
        return (
          <div key={item.id} className="group">
            <MovieCard
              id={item.id}
              title={item.title}
              posterUrl={item.posterUrl || "/placeholder.svg"}
              rating={item.rating || 0}
              year={year}
              type={contentType}
            />
            <div className="mt-2">
              <WatchStatusDropdown 
                contentId={item.id} 
                contentType={contentType}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
} 