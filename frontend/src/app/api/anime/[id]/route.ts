import { NextRequest, NextResponse } from 'next/server'
import { getPopularAnime } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params Promise
    const animeList = await getPopularAnime();
    const anime = animeList.find(a => a.id === id);

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(anime);
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime details' },
      { status: 500 }
    );
  }
}
