import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getWatchStatus, updateWatchStatus, WatchStatus, WatchStatusResponse } from '@/lib/api';

interface WatchStatusDropdownProps {
  contentId: string;
  contentType: 'movie' | 'show' | 'anime';
}

export const WatchStatusDropdown: React.FC<WatchStatusDropdownProps> = ({ contentId, contentType }) => {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<WatchStatus>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (isLoaded && user) {
        setIsLoading(true);
        setError(null);
        try {
          const currentStatus = await getWatchStatus(contentId, contentType);
          setStatus(currentStatus.status);
        } catch (error) {
          console.error('Error fetching watch status:', error);
          setError('Failed to load watch status');
          setStatus('none');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStatus();
  }, [contentId, contentType, isLoaded, user]);

  const handleStatusChange = async (newStatus: WatchStatus) => {
    if (!isLoaded || !user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const success = await updateWatchStatus(contentId, contentType, newStatus);
      if (success) {
        setStatus(newStatus);
      } else {
        setError('Failed to update watch status');
      }
    } catch (error) {
      console.error('Error updating watch status:', error);
      setError('Failed to update watch status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      {error && (
        <div className="mb-2 text-xs text-red-500">
          {error}
        </div>
      )}
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as WatchStatus)}
        disabled={isLoading}
        className="block w-full px-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="none">Select Status</option>
        <option value="currently_watching">Currently Watching</option>
        <option value="watch_later">Watch Later</option>
        <option value="watched">Watched</option>
        <option value="rewatch">Rewatch</option>
      </select>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-md">
          <div className="w-5 h-5 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}; 