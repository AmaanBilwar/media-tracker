// API service for making requests to our backend

import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Show {
  id: string;
  title: string;
  posterUrl: string;
  rating: number;
  year: string;
  summary?: string;
  genres?: string[];
  status?: string;
  type: string;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  rating: number;
  year: string;
  summary?: string;
  genres?: string[];
  type: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export type WatchStatus = 'currently_watching' | 'watch_later' | 'watched' | 'rewatch' | 'none';

export interface WatchStatusData {
  userId: string;
  contentId: string;
  contentType: 'movie' | 'show';
  status: WatchStatus;
}

export interface ContentByStatus {
  movies: Record<WatchStatus, Movie[]>;
  shows: Record<WatchStatus, Show[]>;
}

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/auth', {
      credentials: 'include', // Include cookies in the request
    });
    
    if (!response.ok) {
      console.error(`Failed to get current user ID: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data.userId || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

export async function getCurrentUserFromClerk(): Promise<string> {
  try {
    // In a real implementation, we would use Clerk's useUser hook
    // For now, we'll return the hardcoded ID
    return 'demo-user-123';
  } catch (error) {
    console.error('Error getting user from Clerk:', error);
    return 'demo-user-123';
  }
}

export async function searchMovies(query: string, page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: String(movie.id),
      title: movie.title,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg?height=450&width=300",
      rating: movie.vote_average || 0,
      year: movie.release_date?.substring(0, 4) || "",
      summary: movie.overview,
      type: "movie"
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: String(movie.id),
      title: movie.title,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg?height=450&width=300",
      rating: movie.vote_average || 0,
      year: movie.release_date?.substring(0, 4) || "",
      summary: movie.overview,
      type: "movie"
    }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
}

export async function searchShows(query: string): Promise<Show[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching shows:', error);
    return [];
  }
}

export async function getShowById(id: string): Promise<Show | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shows/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
}

// Watch status functions

export const getWatchStatus = async (contentId: string, contentType: 'movie' | 'show'): Promise<WatchStatus> => {
  try {
    const userId = await getCurrentUserId();
    
    // Check if we have a valid userId before making the request
    if (!userId) {
      console.error('No user ID available for watch status request');
      return 'none';
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-status/${contentType}/${contentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove credentials to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch watch status: ${response.status} ${response.statusText}`);
      return 'none';
    }
    
    const data = await response.json();
    return data.status || 'none';
  } catch (error) {
    console.error('Error fetching watch status:', error);
    return 'none';
  }
};

export const updateWatchStatus = async (
  contentId: string,
  contentType: 'movie' | 'show',
  status: WatchStatus
): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    
    // Check if we have a valid userId before making the request
    if (!userId) {
      console.error('No user ID available for watch status update');
      return false;
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-status/${contentType}/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove credentials to avoid CORS issues
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      console.error(`Failed to update watch status: ${response.status} ${response.statusText}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating watch status:', error);
    return false;
  }
};

export async function getBatchWatchStatus(
  contentIds: string[], 
  contentType: 'movie' | 'show'
): Promise<Record<string, WatchStatus>> {
  try {
    const userId = await getCurrentUserId();
    
    // Check if we have a valid userId before making the request
    if (!userId) {
      console.error('No user ID available for batch watch status request');
      // Return a map with all 'none' statuses in case of error
      return contentIds.reduce((acc, id) => {
        acc[id] = 'none';
        return acc;
      }, {} as Record<string, WatchStatus>);
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('contentType', contentType);
    contentIds.forEach(id => queryParams.append('contentIds', id));
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-status/batch?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove credentials to avoid CORS issues
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch batch watch status: ${response.status} ${response.statusText}`);
      // Return a map with all 'none' statuses in case of error
      return contentIds.reduce((acc, id) => {
        acc[id] = 'none';
        return acc;
      }, {} as Record<string, WatchStatus>);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching batch watch status:', error);
    // Return a map with all 'none' statuses in case of error
    return contentIds.reduce((acc, id) => {
      acc[id] = 'none';
      return acc;
    }, {} as Record<string, WatchStatus>);
  }
}

export async function getContentByStatus(contentType: 'movie' | 'show', status: WatchStatus): Promise<(Movie | Show)[]> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.error('No user ID available for fetching content by status');
      return [];
    }
    
    console.log(`Fetching ${contentType}s with status '${status}' for user ${userId}`);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-status/${contentType}?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${contentType}s by status: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`Received ${data[`${contentType}s`]?.length || 0} ${contentType}s for status '${status}'`);
    return data[`${contentType}s`] || [];
  } catch (error) {
    console.error(`Error fetching ${contentType}s by status:`, error);
    return [];
  }
}

export async function getAllContentByStatus(): Promise<ContentByStatus> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.error('No user ID available for fetching content');
      return {
        movies: {
          currently_watching: [],
          watch_later: [],
          watched: [],
          rewatch: [],
          none: []
        },
        shows: {
          currently_watching: [],
          watch_later: [],
          watched: [],
          rewatch: [],
          none: []
        }
      };
    }
    
    console.log(`Fetching all content for user ${userId}`);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-status/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch content: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch content');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function getMoviesByStatus(status: WatchStatus): Promise<Movie[]> {
  try {
    const data = await getAllContentByStatus();
    return data.movies[status] || [];
  } catch (error) {
    console.error('Error fetching movies by status:', error);
    return [];
  }
}

export async function getShowsByStatus(status: WatchStatus): Promise<Show[]> {
  try {
    const data = await getAllContentByStatus();
    return data.shows[status] || [];
  } catch (error) {
    console.error('Error fetching shows by status:', error);
    return [];
  }
} 