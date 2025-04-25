"use client"

import Link from "next/link"
import { ArrowRight, ChevronDown, Film, Tv, PlaySquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

function ThemeLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-32 w-[350px] mb-6" />
    )
  }

  return (
    <Image
      src={resolvedTheme === 'dark' ? '/logo-white.png' : '/logo.png'}
      alt="Media Tracker Logo"
      width={350}
      height={128}
      className="object-contain mb-6"
    />
  )
}

export default function SignInPage() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Hero content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20">
          <div className="max-w-md mx-auto md:mx-0 space-y-8">
            <div className="space-y-2">
              <ThemeLogo />
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">
                Track, discover, and organize your favorite movies and shows in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-gray-800 hover:bg-gray-700 text-white shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-[1.02]"
              >
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    Browse Content <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700">
                    <Link href="/movies" className="flex items-center w-full px-2 py-1.5">
                      <Film className="mr-2 h-4 w-4" /> Movies
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700">
                    <Link href="/shows" className="flex items-center w-full px-2 py-1.5">
                      <Tv className="mr-2 h-4 w-4" /> Shows
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700">
                    <Link href="/anime" className="flex items-center w-full px-2 py-1.5">
                      <PlaySquare className="mr-2 h-4 w-4" /> Anime
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="pt-8 grid grid-cols-3 gap-4">
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-[1.02] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">10K+</p>
                  <p className="text-gray-500 dark:text-gray-400">Movies</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-[1.02] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">5K+</p>
                  <p className="text-gray-500 dark:text-gray-400">TV Shows</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-[1.02] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1 User</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    (it&apos;s just me)<br />(for now)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right side - Sign In form */}
        <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 flex items-center justify-center p-6 md:p-12">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <SignIn 
                appearance={{
                  baseTheme: resolvedTheme === "dark" ? dark : undefined,
                  variables: {
                    colorPrimary: "#374151",
                    colorTextOnPrimaryBackground: "white",
                    colorBackground: resolvedTheme === "dark" ? "#1f2937" : "white",
                    colorText: resolvedTheme === "dark" ? "white" : "#374151",
                    colorInputText: resolvedTheme === "dark" ? "white" : "#374151",
                    colorInputBackground: resolvedTheme === "dark" ? "#374151" : "#f3f4f6",
                  },
                  elements: {
                    formButtonPrimary: "bg-gray-700 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200",
                    card: "shadow-none bg-transparent",
                    headerTitle: "text-gray-900 dark:text-white",
                    headerSubtitle: "text-gray-500 dark:text-gray-400",
                    socialButtonsBlockButton: "border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200",
                    dividerLine: "bg-gray-200 dark:bg-gray-700",
                    dividerText: "text-gray-500 dark:text-gray-400",
                    formFieldLabel: "text-gray-700 dark:text-gray-300",
                    formFieldInput: "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-gray-400 transition-all duration-200",
                    footerActionLink: "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Built by Amaan
      </footer>
    </div>
  )
} 