// app/(route)/track/[id]/track-detail-client.tsx - Enhanced version
"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import TrackLoadingComponent from "./track-loading";
import { TrackDetailUI } from "./track-detail-ui";

interface TrackDetailClientProps {
  trackId: number;
  initialTrack?: any;
}

export function TrackDetailClient({ trackId, initialTrack }: TrackDetailClientProps) {
  const [track, setTrack] = useState<any>(initialTrack || null);
  const [loading, setLoading] = useState(!initialTrack);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          `Starting API fetch for track ${trackId} (attempt ${retryCount + 1})`,
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

        // Nếu đã có initialTrack, không cần fetch lại
        if (initialTrack) {
          console.log("Using initial track data");
          setTrack(initialTrack);
        } else {
                  // Fetch track từ API với timeout
        const trackResponse = await fetchWithTimeout(`/api/tracks/${trackId}`) as Response;

        if (!trackResponse.ok) {
          throw new Error(`Track API error: ${trackResponse.status}`);
        }

        const trackData = await trackResponse.json();
          const fetchTime = Date.now() - startTime;
          console.log(`⚡ API fetch completed in ${fetchTime}ms`);

          if (!trackData) {
            console.log(`Track not found with ID: ${trackId}`);
            notFound();
            return;
          }

          // Validate data structure
          const validatedTrack = {
            id: trackData.id,
            title: trackData.title || "Unknown Track",
            description: trackData.description || null,
            duration: trackData.duration || null,
            file_url: trackData.file_url || null,
            view_count: trackData.view_count || 0,
            artist: trackData.artist || { id: 0, name: "Unknown Artist" },
            album: trackData.album || null,
            genre: trackData.genre || null,
            created_at: trackData.created_at || null,
          };

          console.log(
            `Successfully loaded track: ${validatedTrack.title}`,
          );

          setTrack(validatedTrack);
        }
      } catch (err: any) {
        console.error("Error loading track:", err);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [trackId, retryCount, initialTrack]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Loading state - hiển thị ngay khi component mount
  if (loading) {
    return <TrackLoadingComponent />;
  }

  // Error state với retry
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Track</h1>
          <p className="text-red-500 mb-4">Error loading track: {error}</p>
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
  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Track Not Found</h1>
          <p className="text-gray-600 mb-4">
            The track you're looking for doesn't exist.
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
  return <TrackDetailUI track={track} isLoading={loading} />;
} 