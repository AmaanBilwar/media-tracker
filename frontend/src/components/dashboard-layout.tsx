"use client"

import type React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Determine if we're on the shows page or movies page
    const isShowsPage = pathname.includes('/shows')
    const isMoviesPage = pathname.includes('/movies')
    
    // Navigate to the appropriate page with search query
    if (isShowsPage || (!isMoviesPage && !isShowsPage)) {
      router.push(`/shows?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push(`/movies?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold shrink-0">
            <div className="flex flex-col">
              <span>Amaan's</span>
              <span>Media</span>
              <span>Tracker</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="relative w-[300px] mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder={pathname.includes('/shows') ? "Search shows by title..." : "Search movies by title..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-100 border-0 rounded-full w-full"
            />
          </form>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="font-medium hover:text-cyan-500">
              Dashboard
            </Link>
            <Link href="/movies" className="font-medium hover:text-cyan-500">
              Movies
            </Link>
            <Link href="/shows" className="font-medium hover:text-cyan-500">
              Shows
            </Link>
            <Link href="/anime" className="font-medium hover:text-cyan-500">
              Anime
            </Link>
            <div className="flex items-center gap-2">
              <SignOutButton>
                <Button variant="outline" size="sm">Sign Out</Button>
              </SignOutButton>
              <div className="w-8 h-8 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4">{children}</main>

      <footer className="py-4 text-center text-sm text-gray-500 mt-12">Built by Amaan :)</footer>
    </div>
  )
}
