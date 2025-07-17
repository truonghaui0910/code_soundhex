
import { NextRequest, NextResponse } from 'next/server';
import { TracksController } from '@/lib/controllers/tracks';
import { AlbumsController } from '@/lib/controllers/albums';
import { ArtistsController } from '@/lib/controllers/artists';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        tracks: [], 
        albums: [], 
        artists: [],
        suggestions: []
      });
    }

    const [tracks, albums, artists] = await Promise.all([
      TracksController.searchTracks(query, 5), // Limit to 5 results each
      AlbumsController.searchAlbums(query, 5),
      ArtistsController.searchArtists(query, 5)
    ]);

    // Generate search suggestions based on the query
    const suggestions = [
      `Find "${query}"`,
      `Search tracks: "${query}"`,
      `Search albums: "${query}"`,
      `Search artists: "${query}"`
    ];

    return NextResponse.json({
      tracks: tracks.slice(0, 5),
      albums: albums.slice(0, 5), 
      artists: artists.slice(0, 5),
      suggestions: suggestions.slice(0, 4)
    });
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
