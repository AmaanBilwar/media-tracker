import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const response = await fetch(`${API_BASE_URL}/api/anime/${id}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const anime = await response.json()
    return NextResponse.json(anime)
  } catch (error) {
    console.error('Error fetching anime details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch anime details' },
      { status: 500 }
    )
  }
}
