"use client"

import type React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTheme } from "next-themes"
import Image from "next/image"
import { ContentByStatus } from "@/lib/api"

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
    <Image
      src={resolvedTheme === 'dark' ? '/logo-white.png' : '/logo.png'}
      alt="Media Tracker Logo"
      width={280}
      height={128}
      className="object-contain"
    />
  )
}

export default function DashboardLayout({ 
  children,
  data
}: { 
  children: React.ReactNode
  data?: ContentByStatus
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    const isShowsPage = pathname.includes('/shows')
    const isMoviesPage = pathname.includes('/movies')
    const isAnimePage = pathname.includes('/anime')
    const isDashboardPage = pathname === '/dashboard'
    
    // If on dashboard, filter the existing content
    if (isDashboardPage && data) {
      // Update the URL with search params without navigation
      const searchParams = new URLSearchParams(window.location.search)
      if (query) {
        searchParams.set('search', query)
      } else {
        searchParams.delete('search')
      }
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`
      window.history.pushState({}, '', newUrl)
      return
    }
    
    // For specific content pages, use the existing search behavior
    if (query) {
      if (isShowsPage) {
        router.push(`/shows?search=${encodeURIComponent(query)}`)
      } else if (isMoviesPage) {
        router.push(`/movies?search=${encodeURIComponent(query)}`)
      } else if (isAnimePage) {
        router.push(`/anime?search=${encodeURIComponent(query)}`)
      }
    } else {
      // If search is cleared, remove search param
      if (isShowsPage) {
        router.push('/shows')
      } else if (isMoviesPage) {
        router.push('/movies')
      } else if (isAnimePage) {
        router.push('/anime')
      }
    }
  }, [pathname, data, router])

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout)
    }
    
    // Set new timeout for debounced search
    window.searchTimeout = setTimeout(() => {
      debouncedSearch(value)
    }, 300) // 300ms delay
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout)
      }
    }
  }, [])

  // Handle form submission (for accessibility and mobile devices)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout)
    }
    debouncedSearch(searchQuery)
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
              placeholder={pathname.includes('/shows') ? "Search shows by title..." : pathname.includes('/movies') ? "Search movies by title..." : pathname.includes('/anime') ? "Search anime by title..." : "Search your dashboard by title..."}
              value={searchQuery}
              onChange={handleInputChange}
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

// Add TypeScript declaration for the window object
declare global {
  interface Window {
    searchTimeout?: NodeJS.Timeout;
  }
}
