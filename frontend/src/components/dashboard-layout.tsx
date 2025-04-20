"use client"

import type React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTheme } from "next-themes"

function ThemeLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-32 w-[280px]" /> // Placeholder with same dimensions
    )
  }

  return (
    <img
      src={resolvedTheme === 'dark' ? '/logo-white.png' : '/logo.png'}
      alt="Media Tracker Logo"
      className="h-32 w-[280px] object-contain"
    />
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Determine which page we're on
    const isShowsPage = pathname.includes('/shows')
    const isMoviesPage = pathname.includes('/movies')
    const isAnimePage = pathname.includes('/anime')
    
    // Navigate to the appropriate page with search query
    if (isShowsPage) {
      router.push(`/shows?search=${encodeURIComponent(searchQuery)}`)
    } else if (isMoviesPage) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery)}`)
    } else if (isAnimePage) {
      router.push(`/anime?search=${encodeURIComponent(searchQuery)}`)
    } else {
      // Default to shows if on any other page
      router.push(`/shows?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="shrink-0">
            <ThemeLogo />
          </Link>

          <form onSubmit={handleSearch} className="relative w-[300px] mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder={pathname.includes('/shows') ? "Search shows by title..." : pathname.includes('/movies') ? "Search movies by title..." : "Search anime by title..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-full w-full"
            />
          </form>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="hover:cursor-pointer font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/movies" className="hover:cursor-pointer font-medium hover:text-primary">
              Movies
            </Link>
            <Link href="/shows" className="hover:cursor-pointer font-medium hover:text-primary">
              Shows
            </Link>
            <Link href="/anime" className="hover:cursor-pointer font-medium hover:text-primary">
              Anime
            </Link>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <SignOutButton>
                <Button variant="outline" className='hover:cursor-pointer'size="sm">Sign Out</Button>
              </SignOutButton>
              <div className="w-8 h-8 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4">{children}</main>

      <footer className="py-4 text-center text-sm text-muted-foreground mt-12">Built by Amaan :)</footer>
    </div>
  )
}
