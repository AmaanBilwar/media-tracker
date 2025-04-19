"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Movies", path: "/" },
    { name: "Shows", path: "/shows" },
    { name: "Anime", path: "/anime" },
  ]

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold text-red-500">
            MovieTracker
          </Link>

          <div className="hidden md:flex items-center ml-8 space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.path
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Watchlist</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-zinc-950 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap",
              pathname === item.path ? "bg-zinc-800 text-white" : "text-zinc-300",
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
