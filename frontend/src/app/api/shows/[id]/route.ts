import { NextRequest, NextResponse } from 'next/server'
import { TMDB_API_KEY, TMDB_BASE_URL } from '@/lib/constants'

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch show details from TMDB')
    }

    const data = await response.json()

    // Get seasons data
    const seasonsData = await Promise.all(
      data.seasons.map(async (season: any) => {
        const seasonResponse = await fetch(
          `${TMDB_BASE_URL}/tv/${id}/season/${season.season_number}?api_key=${TMDB_API_KEY}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        const seasonData = await seasonResponse.json()
        return {
          seasonNumber: season.season_number,
          episodeCount: seasonData.episodes?.length || 0,
          name: season.name
        }
      })
    )

    // Transform TMDB data to match our Show interface
    const show = {
      id: String(data.id),
      title: data.name,
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      rating: data.vote_average,
      year: data.first_air_date ? data.first_air_date.substring(0, 4) : null,
      summary: data.overview,
      genres: data.genres.map((genre: any) => genre.name),
      status: data.status,
      type: "show",
      numberOfSeasons: data.number_of_seasons,
      seasons: seasonsData
    }

    return NextResponse.json(show)
  } catch (error) {
    console.error('Error fetching show details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch show details' },
      { status: 500 }
    )
  }
} 