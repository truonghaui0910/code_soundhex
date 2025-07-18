// app/(route)/artist/[id]/artist-detail-client.tsx - Copy album logic
"use client";

import { useState, useEffect, useMemo } from "react";
import ArtistDetailLoading from './artist-loading';
import { ArtistDetailUI } from './artist-detail-ui';

interface ArtistDetailClientProps {
  artistId: number;
  artist?: any;
}

export function ArtistDetailClient({ artistId, artist: initialArtist }: ArtistDetailClientProps) {
  const [loading, setLoading] = useState(!initialArtist);
  const [artist, setArtist] = useState(initialArtist);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // If we already have artist data, just fetch tracks and albums
      if (initialArtist) {
        try {
          setLoading(true);
          setError(null);

          console.log(`Starting API fetch for tracks and albums for artist ${artistId}`);
          const startTime = Date.now();

          const [tracksResponse, albumsResponse] = await Promise.all([
            fetch(`/api/artists/${artistId}/tracks`),
            fetch('/api/albums')
          ]);

          if (!tracksResponse.ok) {
            const errorText = await tracksResponse.text();
            console.error(`Tracks API error:`, errorText);
            throw new Error(`Tracks API error: ${tracksResponse.status} - ${errorText}`);
          }

          if (!albumsResponse.ok) {
            const errorText = await albumsResponse.text();
            console.error(`Albums API error:`, errorText);
            throw new Error(`Albums API error: ${albumsResponse.status} - ${errorText}`);
          }

          const [tracksData, albumsResponseData] = await Promise.all([
            tracksResponse.json(),
            albumsResponse.json()
          ]);

          const fetchTime = Date.now() - startTime;
          console.log(`API fetch completed in ${fetchTime}ms`);

          // Fix: Access albums array from response object
          const albumsArray = albumsResponseData.albums || albumsResponseData;
          const artistAlbums = Array.isArray(albumsArray) ? albumsArray.filter((album) => album.artist?.id === artistId) : [];
          const validatedTracks = Array.isArray(tracksData) ? tracksData : [];
          const validatedAlbums = Array.isArray(artistAlbums) ? artistAlbums : [];

          setTracks(validatedTracks);
          setAlbums(validatedAlbums);
        } catch (err) {
          console.error("Error loading tracks and albums:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`Starting API fetch for artist ${artistId}`);
        const startTime = Date.now();

        // Fetch artist, tracks và albums song song từ API
        const [artistsResponse, tracksResponse, albumsResponse] = await Promise.all([
          fetch('/api/artists'),
          fetch(`/api/artists/${artistId}/tracks`),
          fetch('/api/albums')
        ]);

        if (!artistsResponse.ok) {
          const errorText = await artistsResponse.text();
          console.error(`Artists API error:`, errorText);
          throw new Error(`Artists API error: ${artistsResponse.status} - ${errorText}`);
        }

        if (!tracksResponse.ok) {
          const errorText = await tracksResponse.text();
          console.error(`Tracks API error:`, errorText);
          throw new Error(`Tracks API error: ${tracksResponse.status} - ${errorText}`);
        }

        if (!albumsResponse.ok) {
          const errorText = await albumsResponse.text();
          console.error(`Albums API error:`, errorText);
          throw new Error(`Albums API error: ${albumsResponse.status} - ${errorText}`);
        }

        const [artistsData, tracksData, albumsResponseData] = await Promise.all([
          artistsResponse.json(),
          tracksResponse.json(),
          albumsResponse.json()
        ]);

        const fetchTime = Date.now() - startTime;
        console.log(`API fetch completed in ${fetchTime}ms`);

        const artistData = artistsData.artists ? artistsData.artists.find((a) => a.id === artistId) : artistsData.find((a) => a.id === artistId);
        console.log(`Looking for artist ID ${artistId}:`, artistData ? 'Found' : 'Not found');

        // Giống album: Không dùng notFound(), chỉ log
        if (!artistData) {
          console.log(`Artist not found with ID: ${artistId}`);
          const availableIds = artistsData.artists ? artistsData.artists.map(a => a.id) : artistsData.map(a => a.id);
          console.log('Available artist IDs:', availableIds);
          // Không gọi notFound() ở đây
        }

        // Fix: Access albums array from response object
        const albumsArray = albumsResponseData.albums || albumsResponseData;
        const artistAlbums = Array.isArray(albumsArray) ? albumsArray.filter((album) => album.artist?.id === artistId) : [];

        // Validate data structure - với fallback values
        const validatedArtist = artistData ? {
          id: artistData.id,
          name: artistData.name || "Unknown Artist",
          profile_image_url: artistData.profile_image_url || null,
          bio: artistData.bio || null,
          created_at: artistData.created_at || null,
          social: artistData.social || [], // Ensure social exists and is an array
        } : {
          id: artistId,
          name: "Unknown Artist",
          profile_image_url: null,
          bio: null,
          created_at: null,
          social: [], //Provide default value
        };

        const validatedTracks = Array.isArray(tracksData) ? tracksData : [];
        const validatedAlbums = Array.isArray(artistAlbums) ? artistAlbums : [];

        console.log(`Successfully loaded artist: ${validatedArtist.name} with ${validatedTracks.length} tracks and ${validatedAlbums.length} albums`);

        // Set data regardless - giống album
        setArtist(validatedArtist);
        setTracks(validatedTracks);
        setAlbums(validatedAlbums);
      } catch (err) {
        console.error("Error loading artist:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [artistId, initialArtist]);

  // Loading state - hiển thị ngay khi component mount
  if (loading) {
    return <ArtistDetailLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Artist</h1>
          <p className="text-red-500 mb-4">Error loading artist: {error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const memoizedTracks = useMemo(() => tracks, [tracks]);

  return (
    <ArtistDetailUI artist={artist} tracks={memoizedTracks} albums={albums} />;
}