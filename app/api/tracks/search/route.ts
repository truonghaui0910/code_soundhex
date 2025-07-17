
import { NextRequest, NextResponse } from 'next/server';
import { TracksController } from '@/lib/controllers/tracks';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const tracks = await TracksController.searchTracks(query);
    
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search tracks' },
      { status: 500 }
    );
  }
}
