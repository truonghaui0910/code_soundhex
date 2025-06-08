
import { NextRequest, NextResponse } from 'next/server';
import { serverLogger } from '@/lib/services/server-logger';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  duration_ms: number;
  external_ids?: {
    isrc?: string;
  };
  preview_url?: string;
  track_number: number;
}

interface AlbumInfoResponse {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string }>;
  release_date: string;
  tracks: {
    items: SpotifyTrack[];
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { albumId } = await request.json();
    
    serverLogger.logInfo('ALBUM_INFO_REQUEST', { albumId });
    
    if (!albumId) {
      serverLogger.logWarn('ALBUM_INFO_MISSING_ID');
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    // Use the new album-info API endpoint
    const apiUrl = `http://automusic.win/spotify/album-info/get/${albumId}`;
    serverLogger.logInfo('ALBUM_INFO_API_CALL', { apiUrl });
    
    const response = await fetch(apiUrl);
  
    if (!response.ok) {
      serverLogger.logError('ALBUM_INFO_API_ERROR', `HTTP error! status: ${response.status}`, { apiUrl });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const albumData: AlbumInfoResponse = await response.json();
    
    serverLogger.logDebug('ALBUM_INFO_RAW_DATA', {
      hasAlbumData: !!albumData,
      albumName: albumData?.name,
      hasTracks: !!albumData?.tracks?.items,
      tracksIsArray: Array.isArray(albumData?.tracks?.items),
      tracksCount: albumData?.tracks?.items?.length || 0,
      dataKeys: Object.keys(albumData || {})
    });
    
    // Extract tracks from the album info structure
    const tracks = albumData?.tracks?.items?.map((track: SpotifyTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.[0]?.name || albumData.artists?.[0]?.name || 'Unknown Artist',
      album: albumData.name || 'Unknown Album',
      duration: Math.floor(track.duration_ms / 1000),
      image: albumData.images?.[0]?.url || '',
      isrc: track.external_ids?.isrc || null,
      preview_url: track.preview_url
    })) || [];

    const duration = Date.now() - startTime;
    
    serverLogger.logInfo('ALBUM_INFO_SUCCESS', { 
      albumId, 
      albumName: albumData?.name,
      originalTracksCount: albumData?.tracks?.items?.length || 0,
      mappedTracksCount: tracks.length,
      duration 
    });

    return NextResponse.json({ 
      data: {
        ...albumData,
        tracks: tracks
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    serverLogger.logError('ALBUM_INFO_ERROR', error instanceof Error ? error.message : 'Unknown error', { 
      duration 
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch album info' },
      { status: 500 }
    );
  }
}
