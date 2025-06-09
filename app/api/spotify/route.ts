import { NextRequest, NextResponse } from "next/server";
import { serverLogger } from "@/lib/services/server-logger";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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

async function fetchSpotifyData(url: string, userEmail?: string) {
  const startTime = Date.now();

  try {
    // Log request tới automusic.win
    serverLogger.logInfo("AUTOMUSIC_API_REQUEST", { url }, userEmail);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Log response từ automusic.win
    serverLogger.logInfo(
      "AUTOMUSIC_API_RESPONSE",
      {
        url,
        status: response.status,
        duration: Date.now() - startTime,
        tracksCount: data?.tracks?.items?.length || data?.items?.length || 0,
      },
      userEmail,
    );

    return data;
  } catch (error) {
    serverLogger.logError(
      "AUTOMUSIC_API_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      {
        url,
        duration: Date.now() - startTime,
      },
      userEmail,
    );
    throw error;
  }
}

function detectSpotifyUrlType(url: string) {
  if (url.includes("/artist/")) return "artist";
  if (url.includes("/album/")) return "album";
  if (url.includes("/playlist/")) return "playlist";
  if (url.includes("/track/")) return "track";
  return null;
}

function extractSpotifyId(url: string) {
  const match = url.match(/\/(artist|album|playlist|track)\/([a-zA-Z0-9]+)/);
  return match ? match[2] : null;
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  
  // Get user email from Supabase session (secure way) - moved outside try-catch
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userEmail = session?.user?.email || undefined;

  try {
    const { spotifyUrl } = await request.json();

    if (!spotifyUrl) {
      return NextResponse.json(
        { error: "Spotify URL is required" },
        { status: 400 },
      );
    }

    const urlType = detectSpotifyUrlType(spotifyUrl);
    const spotifyId = extractSpotifyId(spotifyUrl);

    if (!urlType || !spotifyId) {
      return NextResponse.json(
        { error: "Invalid Spotify URL" },
        { status: 400 },
      );
    }

    let apiUrl = "";
    let data;

    switch (urlType) {
      case "artist":
        // Get artist info first
        apiUrl = `http://source.automusic.win/spotify/artist-onl/get/${spotifyId}`;
        const artistData = await fetchSpotifyData(apiUrl, userEmail);

        // Get artist albums
        const albumsUrl = `http://automusic.win/spotify/artist-albums-onl/get/${spotifyId}`;
        const albumsData = await fetchSpotifyData(albumsUrl, userEmail);

        data = {
          type: "artist",
          data: {
            id: artistData.id,
            name: artistData.name,
            image: artistData.images?.[0]?.url || "",
            albums:
              albumsData.items?.map((album: SpotifyAlbum) => ({
                id: album.id,
                name: album.name,
                artist: album.artists?.[0]?.name || artistData.name,
                image: album.images?.[0]?.url || "",
                release_date: album.release_date,
                tracks: [], // Will be populated when album is expanded
              })) || [],
          },
        };
        break;

      case "album":
        // Use new album-info API to get complete album information
        apiUrl = `http://automusic.win/spotify/album-info/get/${spotifyId}`;
        const albumInfoData = await fetchSpotifyData(apiUrl, userEmail);

        // albumInfoData has complete album info plus tracks
        const mappedTracks =
          albumInfoData.tracks?.items?.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            artist:
              track.artists?.[0]?.name ||
              albumInfoData.artists?.[0]?.name ||
              "Unknown Artist",
            album: albumInfoData.name || "Unknown Album",
            duration: Math.floor(track.duration_ms / 1000),
            image: albumInfoData.images?.[0]?.url || "",
            isrc: track.external_ids?.isrc || null,
            preview_url: track.preview_url,
          })) || [];

        data = {
          type: "album",
          data: {
            id: albumInfoData.id || spotifyId,
            name: albumInfoData.name || "Unknown Album",
            artist: albumInfoData.artists?.[0]?.name || "Unknown Artist",
            image: albumInfoData.images?.[0]?.url || "",
            release_date: albumInfoData.release_date || "",
            tracks: mappedTracks,
          },
        };
        break;

      case "playlist":
        apiUrl = `http://automusic.win/spotify/playlist-info/get/${spotifyId}`;
        const playlistData = await fetchSpotifyData(apiUrl, userEmail);

        // playlistData now contains complete playlist info with tracks.items array
        const mappedPlaylistTracks =
          playlistData.tracks?.items?.map((item: any) => ({
            id: item.track?.id,
            name: item.track?.name,
            artist: item.track?.artists?.[0]?.name || "Unknown Artist",
            album: item.track?.album?.name || "Unknown Album",
            duration: Math.floor(item.track?.duration_ms / 1000),
            image: item.track?.album?.images?.[0]?.url || "",
            isrc: item.track?.external_ids?.isrc || null,
            preview_url: item.track?.preview_url,
          })) || [];

        data = {
          type: "playlist",
          data: {
            id: playlistData.id || spotifyId,
            name: playlistData.name || "Unknown Playlist",
            artist: `${mappedPlaylistTracks.length} tracks`,
            image:
              playlistData.images?.[0]?.url ||
              mappedPlaylistTracks[0]?.image ||
              "",
            release_date: "",
            tracks: mappedPlaylistTracks,
          },
        };
        break;

      case "track":
        apiUrl = `http://source.automusic.win/spotify/track-onl/get/${spotifyId}`;
        const trackData = await fetchSpotifyData(apiUrl, userEmail);

        data = {
          type: "track",
          data: {
            id: trackData.id,
            name: trackData.name,
            artist: trackData.artists?.[0]?.name || "Unknown Artist",
            album: trackData.album?.name || "Unknown Album",
            duration: Math.floor(trackData.duration_ms / 1000),
            image: trackData.album?.images?.[0]?.url || "",
            isrc: trackData.external_ids?.isrc || null,
            preview_url: trackData.preview_url,
          },
        };
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported URL type" },
          { status: 400 },
        );
    }

    const totalDuration = Date.now() - requestStartTime;

    // Get track count based on type
    let trackCount = 0;
    if (urlType === "track") {
      trackCount = 1;
    } else if (urlType === "album" || urlType === "playlist") {
      trackCount = data.data.tracks?.length || 0;
    } else if (urlType === "artist") {
      trackCount =
        data.data.albums?.reduce((total: number, album: any) => {
          return total + (album.tracks?.length || 0);
        }, 0) || 0;
    }

    return NextResponse.json(data);
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;

    serverLogger.logError(
      "SPOTIFY_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      {
        duration: totalDuration,
      },
      userEmail,
    );

    return NextResponse.json(
      { error: "Failed to fetch data from Spotify" },
      { status: 500 },
    );
  }
}
