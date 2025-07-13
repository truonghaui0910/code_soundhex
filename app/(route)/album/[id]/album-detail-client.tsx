// app/(route)/album/[id]/album-detail-client.tsx - Enhanced version
"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import AlbumLoadingComponent from "./album-loading";
import { AlbumDetailUI } from "./album-detail-ui";

interface AlbumDetailClientProps {
  albumId: number;
}

export function AlbumDetailClient({ albumId }: AlbumDetailClientProps) {
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          `Starting API fetch for album ${albumId} (attempt ${retryCount + 1})`,
        );
        const startTime = Date.now();

        // Fetch với timeout để tránh hanging
        const fetchWithTimeout = (url: string, timeout = 10000) => {
          return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), timeout),
            ),
          ]);
        };

        // Fetch album và tracks từ API với timeout
        const [albumsResponse, tracksResponse] = await Promise.all([
          fetchWithTimeout("/api/albums"),
          fetchWithTimeout(`/api/albums/${albumId}/tracks`),
        ]);

        if (!albumsResponse.ok) {
          throw new Error(`Albums API error: ${albumsResponse.status}`);
        }

        if (!tracksResponse.ok) {
          throw new Error(`Tracks API error: ${tracksResponse.status}`);
        }

        const [albumsData, tracksData] = await Promise.all([
          albumsResponse.json(),
          tracksResponse.json(),
        ]);

        const fetchTime = Date.now() - startTime;
        console.log(`⚡ API fetch completed in ${fetchTime}ms`);

        const albumData = albumsData.find((a) => a.id === albumId);

        if (!albumData) {
          console.log(`Album not found with ID: ${albumId}`);
          notFound();
          return;
        }

        // Validate data structure
        const validatedAlbum = {
          id: albumData.id,
          title: albumData.title || "Unknown Album",
          artist: albumData.artist || { id: 0, name: "Unknown Artist" },
          cover_image_url: albumData.cover_image_url || null,
          release_date: albumData.release_date || null,
          genre: albumData.genre || null,
        };

        const validatedTracks = Array.isArray(tracksData) ? tracksData : [];

        console.log(
          `Successfully loaded album: ${validatedAlbum.title} with ${validatedTracks.length} tracks`,
        );

        setAlbum(validatedAlbum);
        setTracks(validatedTracks);
      } catch (err) {
        console.error("Error loading album:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [albumId, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Loading state - hiển thị ngay khi component mount
  if (loading) {
    return <AlbumLoadingComponent />;
  }

  // Error state với retry
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Album</h1>
          <p className="text-red-500 mb-4">Error loading album: {error}</p>
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
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

  // Not found state
  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Album Not Found</h1>
          <p className="text-gray-600 mb-4">
            The album you're looking for doesn't exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render UI component với data
  return <AlbumDetailUI album={album} tracks={tracks} />;
}
