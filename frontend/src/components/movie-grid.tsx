"use client"

import { useState } from "react"
import MovieCard from "./movie-card"
import { Movie } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { WatchStatusDropdown } from "./watch-status-dropdown"

interface MovieGridProps {
  movies: Movie[]
  limit?: number
}

export default function MovieGrid({ movies, limit }: MovieGridProps) {
  const displayMovies = limit ? movies.slice(0, limit) : movies

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No movies found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {displayMovies.map((movie) => (
        <div key={movie.id} className="group">
          <MovieCard
            id={movie.id}
            title={movie.title}
            posterUrl={movie.posterUrl}
            rating={movie.rating}
            year={movie.year}
            type={movie.type}
          />
          <div className="mt-2">
            <WatchStatusDropdown 
              contentId={movie.id} 
              contentType={movie.type as 'movie' | 'show'} 
            />
          </div>
        </div>
      ))}
    </div>
  )
}
