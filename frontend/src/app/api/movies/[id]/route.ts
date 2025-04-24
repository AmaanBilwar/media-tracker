import { NextResponse } from 'next/server'
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/lib/constants'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = params.id
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch movie details from TMDB')
    }

    const data = await response.json()

    // Transform TMDB data to match our Movie interface
    const movie = {
      id: String(data.id),
      title: data.title,
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      rating: data.vote_average,
      year: data.release_date ? parseInt(data.release_date.substring(0, 4)) : null,
      overview: data.overview,
      genres: data.genres.map((genre: any) => genre.name),
      cast: data.credits.cast.slice(0, 8).map((actor: any) => ({
        id: String(actor.id),
        name: actor.name,
        character: actor.character,
        profileUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
      })),
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error fetching movie details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    )
  }
} 