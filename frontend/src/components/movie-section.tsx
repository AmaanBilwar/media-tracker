import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface MovieSectionProps {
  title: string
  children: React.ReactNode
  seeAllLink?: `/${string}`
}

export function MovieSection({ title, children, seeAllLink = "/movies" }: MovieSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
      </div>
      {children}
    </section>
  )
}
