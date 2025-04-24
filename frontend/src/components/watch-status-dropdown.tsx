"use client"

import { useState, useEffect } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  getWatchStatus, 
  updateWatchStatus, 
  WatchStatus,
  ContentType
} from "@/lib/api"
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  MoreHorizontal 
} from "lucide-react"
import { useSWRConfig } from 'swr'

interface WatchStatusDropdownProps {
  contentId: string
  contentType: ContentType
  className?: string
}

export function WatchStatusDropdown({ 
  contentId, 
  contentType,
  className = "" 
}: WatchStatusDropdownProps) {
  const [status, setStatus] = useState<WatchStatus>('none')
  const [isLoading, setIsLoading] = useState(false)
  const { mutate } = useSWRConfig()

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await getWatchStatus(contentId, contentType)
      setStatus(response.status)
    }
    
    fetchStatus()
  }, [contentId, contentType])

  const handleStatusChange = async (newStatus: WatchStatus) => {
    setIsLoading(true)
    const previousStatus = status
    
    // Optimistically update the UI
    setStatus(newStatus)
    
    try {
      const success = await updateWatchStatus(contentId, contentType, newStatus)
      if (!success) {
        // Revert on failure
        setStatus(previousStatus)
      }
      
      // Trigger revalidation of all related data
      await Promise.all([
        mutate('/api/user-content', undefined, { revalidate: true }),
        mutate((key) => typeof key === 'string' && key.startsWith('/api/user-content'), undefined, { revalidate: true })
      ])
    } catch (error) {
      console.error('Error updating status:', error)
      // Revert on error
      setStatus(previousStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: WatchStatus) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white ${className}`}
          disabled={isLoading}
        >
          {getStatusIcon(status)}
          {getStatusLabel(status)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md"
      >
        <DropdownMenuItem 
          onClick={() => handleStatusChange('currently_watching')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Currently Watching
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('watch_later')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
        >
          <Clock className="h-4 w-4 mr-2" />
          Watch Later
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('watched')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Watched
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('rewatch')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rewatch
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('none')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
        >
          <MoreHorizontal className="h-4 w-4 mr-2" />
          Clear Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 