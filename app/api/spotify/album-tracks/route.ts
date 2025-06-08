
import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  duration_ms: number;
  external_ids?: {
    isrc?: string;
  };
  preview_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { albumId } = await request.json();
    
    if (!albumId) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    const apiUrl = `http://source.automusic.win/spotify/album-tracks-onl/get/${albumId}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const albumData = await response.json();
    
    const tracks = albumData.tracks?.items?.map((track: SpotifyTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      album: albumData.name,
      duration: Math.floor(track.duration_ms / 1000),
      image: albumData.images?.[0]?.url || '',
      isrc: track.external_ids?.isrc || null,
      preview_url: track.preview_url
    })) || [];

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album tracks' },
      { status: 500 }
    );
  }
}
