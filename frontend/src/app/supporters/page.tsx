"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const supporters = [
  {
    name: "Amaan Bilwar",
    message: "Makes sense for me to support this project. right?",
    tier: "Lifetime-Legend"
  },
  {
    name: "Ding Dong",
    message: "Obv i was made by the creator.",
    tier: "Super-Streamer"
  }
]

export default function SupportersPage() {
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Amazing Supporters</h1>
          <p className="text-muted-foreground text-lg">
            These wonderful people have supported the development of Media Tracker
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {supporters.map((supporter, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xl">{supporter.name}</h3>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        supporter.tier === 'Lifetime-Legend' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        supporter.tier === 'Super-Streamer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {supporter.tier}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">{supporter.message}</p>
                  </div>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Want to support Media Tracker? Contact us to learn more about becoming a supporter!
          </p>
        </div>
      </div>
    </div>
  )
}
