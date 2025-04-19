import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"

interface MovieCardProps {
  id: string
  title: string
  posterUrl: string
  rating: number
  year: string
  type?: string
}

export default function MovieCard({ id, title, posterUrl, rating, year, type = "movie" }: MovieCardProps) {
  // Determine the correct link based on the type
  const detailLink = type === "show" ? `/shows/${id}` : `/movies/${id}`

  return (
    <Link href={detailLink} className="group">
      <div className="relative overflow-hidden rounded-lg">
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
        </div>
      </div>
    </Link>
  )
}
