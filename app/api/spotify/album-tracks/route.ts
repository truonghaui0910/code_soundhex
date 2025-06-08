
import { NextRequest, NextResponse } from 'next/server';
import { serverLogger } from '@/lib/services/server-logger';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  duration_ms: number;
  external_ids?: {
    isrc?: string;
  };
  preview_url?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { albumId } = await request.json();
    
    serverLogger.logInfo('ALBUM_TRACKS_REQUEST', { albumId });
    
    if (!albumId) {
      serverLogger.logWarn('ALBUM_TRACKS_MISSING_ID');
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    const apiUrl = `http://source.automusic.win/spotify/album-tracks-onl/get/${albumId}`;
    serverLogger.logInfo('ALBUM_TRACKS_API_CALL', { apiUrl });
    
    const response = await fetch(apiUrl);
  
    if (!response.ok) {
      serverLogger.logError('ALBUM_TRACKS_API_ERROR', `HTTP error! status: ${response.status}`, { apiUrl });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const albumTracksData = await response.json();
    
    serverLogger.logDebug('ALBUM_TRACKS_RAW_DATA', {
      hasItems: !!albumTracksData.items,
      itemsType: typeof albumTracksData.items,
      itemsIsArray: Array.isArray(albumTracksData.items),
      itemsCount: albumTracksData.items?.length || 0,
      dataKeys: Object.keys(albumTracksData || {})
    });
    
    // API trả về { items: [...], href, limit, next, offset, previous, total }
    // items chứa array các track
    const tracks = albumTracksData.items?.map((track: SpotifyTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      album: track.album?.name || 'Unknown Album',
      duration: Math.floor(track.duration_ms / 1000),
      image: track.album?.images?.[0]?.url || '',
      isrc: track.external_ids?.isrc || null,
      preview_url: track.preview_url
    })) || [];

    const duration = Date.now() - startTime;
    
    serverLogger.logInfo('ALBUM_TRACKS_SUCCESS', { 
      albumId, 
      originalTracksCount: albumTracksData.items?.length || 0,
      mappedTracksCount: tracks.length,
      duration 
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    serverLogger.logError('ALBUM_TRACKS_ERROR', error instanceof Error ? error.message : 'Unknown error', { 
      duration 
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch album tracks' },
      { status: 500 }
    );
  }
}
