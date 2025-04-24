export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in environment variables')
} 