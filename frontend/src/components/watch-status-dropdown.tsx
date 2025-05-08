"use client"

import { useState, useEffect } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  getWatchStatus, 
  updateWatchStatus, 
  WatchStatus,
  ContentType,
  WatchStatusResponse
} from "@/lib/api"
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  MoreHorizontal,
  Loader2,
  ChevronDown
} from "lucide-react"
import { useSWRConfig } from 'swr'
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface WatchStatusDropdownProps {
  contentId: string
  contentType: ContentType
  className?: string
  totalSeasons?: number
  totalEpisodes?: number
  seasons?: {
    seasonNumber: number
    episodeCount: number
    name: string
  }[]
}

export function WatchStatusDropdown({ 
  contentId, 
  contentType,
  className = "",
  totalSeasons = 1,
  totalEpisodes = 1,
  seasons = []
}: WatchStatusDropdownProps) {
  const [status, setStatus] = useState<WatchStatus>('none')
  const [isLoading, setIsLoading] = useState(false)
  const [watchProgress, setWatchProgress] = useState<{ season: number; episode: number }>({ season: 1, episode: 1 })
  const { mutate } = useSWRConfig()
  const { toast } = useToast()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true)
        const response = await getWatchStatus(contentId, contentType)
        setStatus(response.status)
        if (response.lastSeason && response.lastEpisode) {
          setWatchProgress({
            season: response.lastSeason,
            episode: response.lastEpisode
          })
        }
      } catch (error) {
        console.error('Error fetching status:', error)
        toast({
          title: "Error",
          description: "Failed to load watch status",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStatus()
  }, [contentId, contentType, toast])

  const handleStatusChange = async (newStatus: WatchStatus) => {
    setIsLoading(true)
    const previousStatus = status
    
    // Optimistically update the UI
    setStatus(newStatus)
    
    try {
      const success = await updateWatchStatus(
        contentId, 
        contentType, 
        newStatus,
        newStatus === 'currently_watching' ? watchProgress.season : undefined,
        newStatus === 'currently_watching' ? watchProgress.episode : undefined
      )
      if (!success) {
        // Revert on failure
        setStatus(previousStatus)
        toast({
          title: "Error",
          description: "Failed to update watch status",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Watch status updated successfully"
        })
        // Only revalidate the specific content's status
        mutate(`/api/user-content`)
        mutate(`/api/user-content/${contentType}/${contentId}`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      // Revert on error
      setStatus(previousStatus)
      toast({
        title: "Error",
        description: "Failed to update watch status",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProgressChange = async (type: 'season' | 'episode', value: number) => {
    const newProgress = { ...watchProgress, [type]: value }
    setWatchProgress(newProgress)
    
    if (status === 'currently_watching') {
      try {
        await updateWatchStatus(
          contentId,
          contentType,
          status,
          newProgress.season,
          newProgress.episode
        )
        toast({
          title: "Success",
          description: "Progress updated successfully"
        })
        mutate(`/api/user-content`)
      } catch (error) {
        console.error('Error updating progress:', error)
        toast({
          title: "Error",
          description: "Failed to update progress",
          variant: "destructive"
        })
      }
    }
  }

  const getStatusIcon = (status: WatchStatus) => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    }
    switch (status) {
      case 'currently_watching':
        return <PlayCircle className="h-4 w-4 mr-2" />
      case 'watch_later':
        return <Clock className="h-4 w-4 mr-2" />
      case 'watched':
        return <CheckCircle className="h-4 w-4 mr-2" />
      case 'rewatch':
        return <RefreshCw className="h-4 w-4 mr-2" />
      default:
        return <MoreHorizontal className="h-4 w-4 mr-2" />
    }
  }

  const getStatusLabel = (status: WatchStatus) => {
    if (isLoading) {
      return "Updating..."
    }
    switch (status) {
      case 'currently_watching':
        return 'Currently Watching'
      case 'watch_later':
        return 'Watch Later'
      case 'watched':
        return 'Watched'
      case 'rewatch':
        return 'Rewatch'
      default:
        return 'Set Status'
    }
  }

  // Get episodes for the selected season
  const getEpisodesForSeason = (seasonNumber: number) => {
    if (seasons.length > 0) {
      const season = seasons.find(s => s.seasonNumber === seasonNumber)
      return season?.episodeCount || 1
    }
    return totalEpisodes
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full max-w-[150px] flex-nowrap overflow-hidden px-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${className}`}
            disabled={isLoading}
          >
            {getStatusIcon(status)}
            <span className="truncate block max-w-[90px]">{getStatusLabel(status)}</span>
            <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md"
        >
          <DropdownMenuItem 
            onClick={() => handleStatusChange('currently_watching')}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
            disabled={isLoading}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Currently Watching
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusChange('watch_later')}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
            disabled={isLoading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Watch Later
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusChange('watched')}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Watched
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleStatusChange('rewatch')}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rewatch
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
          <DropdownMenuItem 
            onClick={() => handleStatusChange('none')}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
            disabled={isLoading}
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Clear Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {(contentType === 'show' || contentType === 'anime') && status === 'currently_watching' && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="space-y-1">
            <Label htmlFor="season" className="text-sm text-gray-700 dark:text-gray-300">
              Season
            </Label>
            <Select
              value={watchProgress.season.toString()}
              onValueChange={(value) => {
                const newSeason = parseInt(value)
                setWatchProgress(prev => ({ ...prev, season: newSeason, episode: 1 }))
                handleProgressChange('season', newSeason)
              }}
            >
              <SelectTrigger id="season" className="w-full bg-white dark:bg-gray-800 dark:text-white">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
                  <SelectItem 
                    key={season} 
                    value={season.toString()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    {seasons.length > 0 
                      ? `Season ${season} (${seasons.find(s => s.seasonNumber === season)?.episodeCount || 0} episodes)`
                      : `Season ${season}`
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="episode" className="text-sm text-gray-700 dark:text-gray-300">
              Episode
            </Label>
            <Select
              value={watchProgress.episode.toString()}
              onValueChange={(value) => handleProgressChange('episode', parseInt(value))}
            >
              <SelectTrigger id="episode" className="w-full bg-white dark:bg-gray-800 dark:text-white">
                <SelectValue placeholder="Select episode" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                {Array.from({ length: getEpisodesForSeason(watchProgress.season) }, (_, i) => i + 1).map((episode) => (
                  <SelectItem 
                    key={episode} 
                    value={episode.toString()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Episode {episode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
} 