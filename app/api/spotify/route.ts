
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

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string }>;
  release_date: string;
  tracks?: {
    items: SpotifyTrack[];
  };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
}

async function fetchSpotifyData(url: string) {
  const startTime = Date.now();
  serverLogger.logInfo('SPOTIFY_API_REQUEST', { url });
  
  try {
    const response = await fetch(url);
    const duration = Date.now() - startTime;
    
    serverLogger.logInfo('SPOTIFY_API_RESPONSE', { 
      url, 
      status: response.status, 
      duration 
    });
    
    if (!response.ok) {
      serverLogger.logError('SPOTIFY_API_ERROR', `HTTP error! status: ${response.status}`, { url });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    serverLogger.logDebug('SPOTIFY_API_DATA', { 
      url, 
      dataKeys: Object.keys(data),
      hasItems: data.items ? data.items.length : 'no items',
      hasTracks: data.tracks ? (data.tracks.items ? data.tracks.items.length : 'no track items') : 'no tracks'
    });
    
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    serverLogger.logError('SPOTIFY_API_FETCH_ERROR', error instanceof Error ? error.message : 'Unknown error', { 
      url, 
      duration 
    });
    throw error;
  }
}

function detectSpotifyUrlType(url: string) {
  if (url.includes('/artist/')) return 'artist';
  if (url.includes('/album/')) return 'album';
  if (url.includes('/playlist/')) return 'playlist';
  if (url.includes('/track/')) return 'track';
  return null;
}

function extractSpotifyId(url: string) {
  const match = url.match(/\/(artist|album|playlist|track)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    const { spotifyUrl } = await request.json();
    
    serverLogger.logInfo('SPOTIFY_REQUEST_START', { spotifyUrl });
    
    if (!spotifyUrl) {
      serverLogger.logWarn('SPOTIFY_REQUEST_MISSING_URL');
      return NextResponse.json({ error: 'Spotify URL is required' }, { status: 400 });
    }

    const urlType = detectSpotifyUrlType(spotifyUrl);
    const spotifyId = extractSpotifyId(spotifyUrl);

    serverLogger.logInfo('SPOTIFY_URL_PARSED', { spotifyUrl, urlType, spotifyId });

    if (!urlType || !spotifyId) {
      serverLogger.logError('SPOTIFY_URL_INVALID', 'Could not parse URL', { spotifyUrl, urlType, spotifyId });
      return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 });
    }

    let apiUrl = '';
    let data;

    switch (urlType) {
      case 'artist':
        // Get artist info first
        apiUrl = `http://source.automusic.win/spotify/artist-onl/get/${spotifyId}`;
        const artistData = await fetchSpotifyData(apiUrl);
        
        // Get artist albums
        const albumsUrl = `http://automusic.win/spotify/artist-albums-onl/get/${spotifyId}`;
        const albumsData = await fetchSpotifyData(albumsUrl);
        
        data = {
          type: 'artist',
          data: {
            id: artistData.id,
            name: artistData.name,
            image: artistData.images?.[0]?.url || '',
            albums: albumsData.items?.map((album: SpotifyAlbum) => ({
              id: album.id,
              name: album.name,
              artist: album.artists?.[0]?.name || artistData.name,
              image: album.images?.[0]?.url || '',
              release_date: album.release_date,
              tracks: [] // Will be populated when album is expanded
            })) || []
          }
        };
        break;

      case 'album':
        apiUrl = `http://source.automusic.win/spotify/album-tracks-onl/get/${spotifyId}`;
        serverLogger.logInfo('ALBUM_REQUEST', { spotifyId, apiUrl });
        
        const albumTracksData = await fetchSpotifyData(apiUrl);
        
        serverLogger.logDebug('ALBUM_RAW_DATA', { 
          id: albumTracksData.id,
          name: albumTracksData.name,
          hasArtists: !!albumTracksData.artists,
          artistsCount: albumTracksData.artists?.length || 0,
          hasImages: !!albumTracksData.images,
          imagesCount: albumTracksData.images?.length || 0,
          hasTracks: !!albumTracksData.tracks,
          tracksType: typeof albumTracksData.tracks,
          tracksHasItems: !!albumTracksData.tracks?.items,
          tracksItemsCount: albumTracksData.tracks?.items?.length || 0
        });
        
        const mappedTracks = albumTracksData.tracks?.items?.map((track: SpotifyTrack) => ({
          id: track.id,
          name: track.name,
          artist: track.artists?.[0]?.name || 'Unknown Artist',
          album: albumTracksData.name,
          duration: Math.floor(track.duration_ms / 1000),
          image: albumTracksData.images?.[0]?.url || '',
          isrc: track.external_ids?.isrc || null,
          preview_url: track.preview_url
        })) || [];
        
        serverLogger.logInfo('ALBUM_PROCESSED', { 
          albumName: albumTracksData.name,
          originalTracksCount: albumTracksData.tracks?.items?.length || 0,
          mappedTracksCount: mappedTracks.length
        });
        
        data = {
          type: 'album',
          data: {
            id: albumTracksData.id,
            name: albumTracksData.name,
            artist: albumTracksData.artists?.[0]?.name || 'Unknown Artist',
            image: albumTracksData.images?.[0]?.url || '',
            release_date: albumTracksData.release_date,
            tracks: mappedTracks
          }
        };
        break;

      case 'playlist':
        apiUrl = `http://source.automusic.win/spotify/playlist-onl/get/${spotifyId}`;
        serverLogger.logInfo('PLAYLIST_REQUEST', { spotifyId, apiUrl });
        
        const playlistData = await fetchSpotifyData(apiUrl);
        
        serverLogger.logDebug('PLAYLIST_RAW_DATA', { 
          id: playlistData.id,
          name: playlistData.name,
          hasImages: !!playlistData.images,
          imagesCount: playlistData.images?.length || 0,
          hasTracks: !!playlistData.tracks,
          tracksType: typeof playlistData.tracks,
          tracksTotal: playlistData.tracks?.total,
          tracksHasItems: !!playlistData.tracks?.items,
          tracksItemsCount: playlistData.tracks?.items?.length || 0
        });
        
        const mappedPlaylistTracks = playlistData.tracks?.items?.map((item: any) => {
          serverLogger.logDebug('PLAYLIST_TRACK_ITEM', {
            hasTrack: !!item.track,
            trackId: item.track?.id,
            trackName: item.track?.name,
            hasArtists: !!item.track?.artists,
            artistsCount: item.track?.artists?.length || 0
          });
          
          return {
            id: item.track?.id,
            name: item.track?.name,
            artist: item.track?.artists?.[0]?.name || 'Unknown Artist',
            album: item.track?.album?.name || 'Unknown Album',
            duration: Math.floor(item.track?.duration_ms / 1000),
            image: item.track?.album?.images?.[0]?.url || '',
            isrc: item.track?.external_ids?.isrc || null,
            preview_url: item.track?.preview_url
          };
        }) || [];
        
        serverLogger.logInfo('PLAYLIST_PROCESSED', { 
          playlistName: playlistData.name,
          originalTracksCount: playlistData.tracks?.items?.length || 0,
          mappedTracksCount: mappedPlaylistTracks.length
        });
        
        data = {
          type: 'playlist',
          data: {
            id: playlistData.id,
            name: playlistData.name,
            artist: `${playlistData.tracks?.total || 0} tracks`,
            image: playlistData.images?.[0]?.url || '',
            release_date: '',
            tracks: mappedPlaylistTracks
          }
        };
        break;

      case 'track':
        apiUrl = `http://source.automusic.win/spotify/track-onl/get/${spotifyId}`;
        const trackData = await fetchSpotifyData(apiUrl);
        
        data = {
          type: 'track',
          data: {
            id: trackData.id,
            name: trackData.name,
            artist: trackData.artists?.[0]?.name || 'Unknown Artist',
            album: trackData.album?.name || 'Unknown Album',
            duration: Math.floor(trackData.duration_ms / 1000),
            image: trackData.album?.images?.[0]?.url || '',
            isrc: trackData.external_ids?.isrc || null,
            preview_url: trackData.preview_url
          }
        };
        break;

      default:
        return NextResponse.json({ error: 'Unsupported URL type' }, { status: 400 });
    }

    const totalDuration = Date.now() - requestStartTime;
    
    serverLogger.logInfo('SPOTIFY_REQUEST_SUCCESS', { 
      urlType, 
      spotifyId, 
      duration: totalDuration,
      dataType: data.type,
      tracksCount: data.data.tracks?.length || 0
    });
    
    return NextResponse.json(data);
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    
    serverLogger.logError('SPOTIFY_REQUEST_ERROR', error instanceof Error ? error.message : 'Unknown error', { 
      spotifyUrl, 
      urlType, 
      spotifyId, 
      duration: totalDuration 
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch data from Spotify' },
      { status: 500 }
    );
  }
}
