import { NextRequest, NextResponse } from 'next/server'
import { getPopularAnime } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const animeId = params.id
    const animeList = await getPopularAnime()
    const anime = animeList.find(a => a.id === animeId)

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(anime)
  } catch (error) {
    console.error('Error fetching anime details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch anime details' },
      { status: 500 }
    )
  }
}