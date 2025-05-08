"use client"

import { useEffect, useState } from "react"

type PageType = 'movies' | 'shows' | 'anime' | 'dashboard'

const loadingMessages: Record<PageType, string[]> = {
  movies: [
    "Assembling the Avengers… or at least your data.",
    "In a world… where loading takes a few seconds…",
    "Spinning up like Nolan's totem.",
    "Calling in backup from the Batcave…",
    "Grabbing popcorn 🍿 and your stats.",
    "Decrypting Inception layers to show your favorites.",
    "Still waiting for the T-Rex to stop roaring.",
    "Running down the Blade Runner memory lanes.",
    "Calling Gandalf for help… You shall not wait long!",
    "Just one more frame… Kubrick would understand.",
  ],
  shows: [
    "Loading like it's the finale of Breaking Bad.",
    "Buffering through the Upside Down…",
    "Paging Michael Scott… he's got your watchlist.",
    "Still lost on the island… bringing your data back.",
    "Putting on a Friends-style intro—just for you.",
    "Dialing in from Hawkins… Eleven's on it.",
    "Loading like a Westworld timeline—give us a sec.",
    "Grabbing your favorite sitcom's laugh track.",
    "Queuing like you just hit 'Next Episode.'",
    "Rewinding like you're watching a Better Call Saul flashback.",
  ],
  anime: [
    "Charging up like Goku on Namek… hang tight!",
    "Searching for the One Piece… and your media list.",
    "Summoning your data with a Fullmetal circle.",
    "Hold on... L is still calculating.",
    "Running through the Hidden Leaf to grab your watch history.",
    "Just like a Titan—this may take a few seconds to load.",
    "Rewinding through 9000+ episodes…",
    "Trying to get Senku to speed up the science.",
    "Updating like Shinji finally getting in the robot.",
    "Riding on Haku's back—fetching your info.",
  ],
  dashboard: [
    "Bringing order to your chaos of unfinished episodes…",
    "Your multiverse of media is syncing…",
    "Brushing the dust off your 'Watch Later' list.",
    "Resurrecting those titles you totally meant to finish.",
    "We're almost done loading... unlike your watchlist.",
    "Categorizing like a perfectionist with too many streaming apps.",
    "Fetching your media status... and your commitment issues 👀",
    "Compiling your personal streaming universe...",
    "Balancing your time between 'Just one more episode' and sleep.",
    "Dusting off that movie you added 3 years ago and never watched.",
    "Somewhere between 'Watch Later' and 'Never Gonna Watch.'",
    "Running through your media like a Netflix binge gone rogue.",
    "Evaluating your current progress… and your procrastination level.",
    "Organizing your collection like a film archivist on too much coffee.",
    "Reconstructing your watch stats with Hollywood-level precision.",
    "One does not simply finish every show they start... but we try.",
    "Fetching your timeline of tastes—no judgment (okay, maybe a little).",
    "Detecting emotional damage from that unfinished anime finale...",
    "Syncing across universes—because one dashboard can't contain it all.",
  ]
}

interface LoadingMessageProps {
  pageType: PageType
}

export function LoadingMessage({ pageType }: LoadingMessageProps) {
  const [currentMessage, setCurrentMessage] = useState<string>(loadingMessages[pageType][0])

  useEffect(() => {
    const getRandomMessage = () => {
      const messages = loadingMessages[pageType]
      const randomIndex = Math.floor(Math.random() * messages.length)
      return messages[randomIndex]
    }

    const interval = setInterval(() => {
      setCurrentMessage(getRandomMessage())
    }, 3000) // Change message every 3 seconds

    return () => clearInterval(interval)
  }, [pageType])

  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-center text-muted-foreground max-w-md">
        {currentMessage}
      </p>
    </div>
  )
} 