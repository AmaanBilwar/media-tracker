import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginForm from "@/components/login-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Hero content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20">
          <div className="max-w-md mx-auto md:mx-0 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Amaan's Media Tracker</h1>
              <p className="text-xl text-gray-600 mt-4">
                Track, discover, and organize your favorite movies and shows in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" className="bg-black hover:bg-zinc-800">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    Browse Content <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/movies">Movies</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/shows">Shows</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/anime">Anime</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="pt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-gray-500">Movies</p>
              </div>
              <div>
                <p className="text-2xl font-bold">5K+</p>
                <p className="text-gray-500">TV Shows</p>
              </div>
              <div>
                <p className="text-2xl font-bold">1 User
                  </p>
                <p className="text-gray-500">
                   <span className="text-gray-500 text-xs">
                   (its just me)
                   <br />
                   (for now)
                    </span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500">Built by Amaan</footer>
    </div>
  )
}
