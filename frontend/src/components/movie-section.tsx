import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface MovieSectionProps {
  title: string
  children: React.ReactNode
  seeAllLink?: string
}

export function MovieSection({ title, children, seeAllLink = "/movies" }: MovieSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={seeAllLink} className="text-sm text-gray-500 hover:text-cyan-500 flex items-center">
          See all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      {children}
    </section>
  )
}
