import Image from "next/image"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { getWatchStatus } from "@/lib/api"

interface MovieCardProps {
  id: string
  title: string
  posterUrl: string
  rating: number
  year: string
  type?: 'movie' | 'show'
}

export default function MovieCard({ id, title, posterUrl, rating, year, type = "movie" }: MovieCardProps) {
  const [watchInfo, setWatchInfo] = useState<{ lastSeason?: number; lastEpisode?: number } | null>(null)

  useEffect(() => {
    const fetchWatchInfo = async () => {
      if (type === 'show') {
        try {
          const status = await getWatchStatus(id, type)
          if (status.lastSeason && status.lastEpisode) {
            setWatchInfo({
              lastSeason: status.lastSeason,
              lastEpisode: status.lastEpisode
            })
          }
        } catch (error) {
          console.error('Error fetching watch info:', error)
        }
      }
    }

    fetchWatchInfo()
  }, [id, type])

  return (
    <div className="relative overflow-hidden rounded-lg group">
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />

        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-md px-1.5 py-0.5">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-white">{rating.toFixed(1)}</span>
        </div>

        {type === 'show' && watchInfo && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-4">
            <div className="text-center">
              <p className="text-sm font-medium">Last Watched:</p>
              <p className="text-sm">Season {watchInfo.lastSeason}</p>
              <p className="text-sm">Episode {watchInfo.lastEpisode}</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        {year && <p className="text-xs text-gray-400">{year}</p>}
      </div>
    </div>
  )
}
