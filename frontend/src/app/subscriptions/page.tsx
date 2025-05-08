"use client"

import { useState } from "react"
import { Check, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const features = {
  watcher: [
    "Track Everything, Everywhere – Movies, TV, anime in a single tap",
    "Never Lose Your Place – Auto-update your queues",
    "Episode-Drop Emails – Know the moment a new episode lands",
    "Light Binge Stats – Hours watched, days saved, bragging rights",
    "No Ads. No Credit Card. – Just sign up and start tracking"
  ],
  bingeBuddy: [
    "20 Custom Lists – Curate 'Spooky October,' 'Dad Comedies,' whatever you want",
    "Push & Calendar Reminders – Get pinged or see drops on Google/Apple/Outlook",
    "Random Pick Button – One click ends the 'What should we watch?' debate",
    "Weekly Binge Report – Fun infographics delivered every Sunday",
    "Two Exclusive Themes – Swap the UI to match your vibe"
  ],
  superStreamer: [
    "Unlimited & Collaborative Lists – Invite up to 5 friends to build lists together",
    "Deep Stats Dashboard – Genre heat-maps, streak medals, time-wasted counters",
    "Custom Cover Art & Profile Banners – Make every list, and your profile, pop",
    "Priority Data Fixes – Your title corrections move to the front of the line",
    "Early Feature Access – Test new goodies before anyone else"
  ],
  lifetimeLegend: [
    "All Current & Future Premium Features – No renewals, no surprises",
    "Gold Supporter Badge – Shines beside every comment, list, and profile",
    "Animated Profile Banner & Exclusive Theme Pack – Stand out instantly",
    "Founders Wall – Your name immortalized on our supporters page",
    "VIP Beta & Feature Voting – Direct line to shape what we build next"
  ]
}

const planIcons = {
  Watcher: <Check className="h-6 w-6 text-green-500" strokeWidth={3} />,
  "Binge Buddy": <Lock className="h-6 w-6 text-purple-500" strokeWidth={2.5} />,
  "Super-Streamer": <Star className="h-6 w-6 text-purple-500 fill-purple-100" strokeWidth={2.5} />,
  "Lifetime Legend": <Lock className="h-6 w-6 text-purple-500" strokeWidth={2.5} />,
}

const planColors = {
  Watcher: "text-green-600",
  "Binge Buddy": "text-purple-600",
  "Super-Streamer": "text-purple-600",
  "Lifetime Legend": "text-purple-600",
}

export default function SubscriptionsPage() {
  const { resolvedTheme } = useTheme()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: "Watcher",
      description: "The essentials, forever free.",
      price: "Free",
      features: features.watcher,
      cta: "Get Started",
      popular: false,
      lockIcon: false
    },
    {
      name: "Binge Buddy",
      description: "Level-up your nightly binge.",
      price: billingCycle === 'monthly' ? "$3" : "$30",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      features: features.bingeBuddy,
      cta: "Upgrade Now",
      popular: true,
      lockIcon: true
    },
    {
      name: "Super-Streamer",
      description: "Built for marathons and mega watch-lists.",
      price: billingCycle === 'monthly' ? "$6" : "$60",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      features: features.superStreamer,
      cta: "Upgrade Now",
      popular: false,
      lockIcon: true
    },
    {
      name: "Lifetime Legend",
      description: "Pay once. Flex forever.",
      price: "$99",
      period: " one-time",
      features: features.lifetimeLegend,
      cta: "Become a Legend",
      popular: false,
      lockIcon: true
    }
  ]

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-start">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-foreground">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Ready to binge smarter? Create your free account or upgrade in one click right from your dashboard.
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-muted/50 rounded-full shadow-lg flex items-center p-1.5 border border-border relative">
              {/* Animated background slider */}
              <div 
                className={cn(
                  "absolute h-[calc(100%-12px)] rounded-full bg-background shadow-md transition-all duration-300 ease-in-out",
                  billingCycle === 'monthly' ? 'left-[6px] w-[calc(50%-6px)]' : 'left-[calc(50%+6px)] w-[calc(50%-6px)]'
                )}
              />
              <Button
                variant="ghost"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "rounded-full px-8 py-2.5 text-base font-semibold transition-all duration-200 relative z-10",
                  billingCycle === 'monthly' 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </Button>
              <Button
                variant="ghost"
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "rounded-full px-8 py-2.5 text-base font-semibold transition-all duration-200 relative z-10",
                  billingCycle === 'yearly' 
                    ? "text-purple-600 dark:text-purple-400" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <span className={cn(
                  "absolute -top-4 right-0 text-xs bg-green-500 text-white px-3 py-1 rounded-full shadow-md font-medium transition-all duration-300",
                  billingCycle === 'yearly' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                )}>
                  Save 17%
                </span>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <div key={plan.name} className="relative">
              {/* Most Popular Ribbon */}
              {plan.popular && (
                <div className="absolute -top-4 right-[-32px] rotate-45 z-10">
                  <span className="bg-purple-600 text-white px-8 py-1 text-xs font-semibold shadow rounded">Most Popular</span>
                </div>
              )}
              <Card className={cn(
                "flex flex-col h-full border border-border bg-card text-card-foreground rounded-2xl shadow-sm transition hover:shadow-lg",
                plan.popular && "border-2 border-purple-500"
              )}>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <span>{planIcons[plan.name as keyof typeof planIcons]}</span>
                  <CardTitle className={cn("text-2xl font-bold", planColors[plan.name as keyof typeof planColors])}>{plan.name}</CardTitle>
                </CardHeader>
                <CardDescription className="px-6 text-base text-muted-foreground mb-2">{plan.description}</CardDescription>
                <CardContent className="flex-grow px-6 pb-0">
                  <div className="mb-6 flex items-end gap-2">
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-base text-muted-foreground font-medium">{plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {plan.name === "Watcher" ? (
                          <Check className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <Lock className="h-5 w-5 text-purple-500 mt-1" />
                        )}
                        <span className={cn("text-base", plan.name === "Watcher" ? "text-green-700" : "text-purple-700")}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-8 mt-auto">
                  <Button
                    className={cn(
                      "w-full py-2 text-base font-semibold rounded-lg transition",
                      plan.name === "Watcher"
                        ? "border border-border bg-background text-foreground hover:bg-muted"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
