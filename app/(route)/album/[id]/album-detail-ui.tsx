// app/(route)/album/[id]/album-detail-ui.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import {
  Play,
  Pause,
  Clock,
  Music,
  Heart,
  Share,
  Download,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { TrackGridSm } from "@/components/music/track-grid-sm";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useEffect, useState } from "react";
import { showSuccess } from "@/lib/services/notification-service";

// Helper function to format time
const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds || typeof seconds !== "number") return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface AlbumDetailUIProps {
  album: any;
  tracks: Track[];
  isLoading?: boolean;
  tracksLoading?: boolean;
}

export function AlbumDetailUI({
  album,
  tracks,
  isLoading = false,
  tracksLoading = false,
}: AlbumDetailUIProps) {
  const { currentTrack, isPlaying, playTrack, setTrackList, togglePlayPause } =
    useAudioPlayer();
  const {
    downloadTrack,
    downloadMultipleTracks,
    isDownloading,
    isTrackDownloading,
  } = useDownload();
  const { getAlbumLikeStatus, fetchAlbumLikeStatus, toggleAlbumLike } = useLikesFollows();
  const [recommendedAlbums, setRecommendedAlbums] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  // Safe album data with fallbacks
  const safeAlbum = {
    id: album?.id || 0,
    title: album?.title || "Unknown Album",
    artist: album?.artist || { id: 0, name: "Unknown Artist" },
    cover_image_url: album?.cover_image_url || null,
    release_date: album?.release_date || null,
    genre: album?.genre || null,
  };

  // Safe tracks data
  const safeTracks = Array.isArray(tracks)
    ? tracks.filter((track) => track && track.id)
    : [];

  const handlePlayAlbum = () => {
    if (safeTracks && safeTracks.length > 0) {
      setTrackList(safeTracks);
      setTimeout(() => {
        playTrack(safeTracks[0]);
      }, 10);
    }
  };

  // Fetch album like status when component mounts
  useEffect(() => {
    if (safeAlbum.id && !isLoading) {
      const albumLikeStatus = getAlbumLikeStatus(safeAlbum.id);
      // Only fetch if we haven't fetched yet and it's not currently loading
      if (albumLikeStatus.isLiked === undefined && !albumLikeStatus.isLoading) {
        fetchAlbumLikeStatus(safeAlbum.id);
      }
    }
  }, [safeAlbum.id, isLoading]); // Remove fetchAlbumLikeStatus from deps to prevent re-fetching

  const albumLikeStatus = getAlbumLikeStatus(safeAlbum.id);

  // Fetch recommended albums
  useEffect(() => {
    const fetchRecommendedAlbums = async () => {
      if (safeAlbum.id && !isLoading) {
        setLoadingRecommended(true);
        try {
          const response = await fetch(`/api/albums/${safeAlbum.id}/recommended`);
          if (response.ok) {
            const data = await response.json();
            setRecommendedAlbums(data.albums || []);
          }
        } catch (error) {
          console.error("Error fetching recommended albums:", error);
        } finally {
          setLoadingRecommended(false);
        }
      }
    };

    fetchRecommendedAlbums();
  }, [safeAlbum.id, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          {/* Back to Music Button */}
          <div className="mb-6">
            <Link href="/music">
              <Button
                size="sm"
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Music
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              {safeAlbum.cover_image_url ? (
                <Image
                  src={safeAlbum.cover_image_url}
                  alt={safeAlbum.title}
                  width={256}
                  height={256}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Music className="h-20 w-20 text-white/60" />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <Badge className="bg-white/20 text-white border-white/30 w-fit mx-auto md:mx-0">
                Album
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {safeAlbum.title}
              </h1>
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <Link
                  href={`/artist/${safeAlbum.artist.custom_url || safeAlbum.artist.id}`}
                  prefetch={false} // Disable prefetch để tránh blocking
                  className="font-medium hover:underline"
                >
                  {safeAlbum.artist.name}
                </Link>
                {(safeAlbum.release_date || safeTracks.length > 0) && <span>•</span>}
                {safeAlbum.release_date && (
                  <>
                    <span>
                      {new Date(safeAlbum.release_date).getFullYear()}
                    </span>
                    {safeTracks.length > 0 && <span>•</span>}
                  </>
                )}
                {safeTracks.length > 0 && (
                  <>
                    <span>{safeTracks.length} songs</span>
                    {albumLikeStatus.totalLikes !== undefined ? (
                      <>
                        <span>•</span>
                        <span>{albumLikeStatus.totalLikes} {albumLikeStatus.totalLikes === 1 ? 'like' : 'likes'}</span>
                      </>
                    ) : albumLikeStatus.isLoading ? (
                      <>
                        <span>•</span>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : null}
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={handlePlayAlbum}
                  disabled={safeTracks.length === 0}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Play Album
                </Button>
                <Button
                  size="lg"
                  className={`backdrop-blur-sm transition-all duration-200 border-0 ${
                    albumLikeStatus.isLiked 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  onClick={() => toggleAlbumLike(safeAlbum.id)}
                  disabled={albumLikeStatus.isLoading}
                >
                  <Heart className={`mr-2 h-5 w-5 ${albumLikeStatus.isLiked ? 'fill-current' : ''}`} />
                  <div className="min-w-[60px] flex justify-center items-center">
                    {albumLikeStatus.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (albumLikeStatus.isLiked ? 'Liked' : 'Like')}
                  </div>
                </Button>
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
                  onClick={() => {
                    const currentUrl = window.location.href;
                    navigator.clipboard.writeText(currentUrl);
                    showSuccess({ title: "Copied!", message: "Link copied to clipboard!" });
                  }}
                >
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Track List
          </h2>
        </div>

        <TrackGridSm
          tracks={safeTracks}
          isLoading={tracksLoading}
          loadingCount={15}
        />

        {/* Recommended Albums Section */}
        {recommendedAlbums.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Similar Albums
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendedAlbums.map((album: any) => (
                <div
                  key={album.id}
                  className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Link href={`/album/${album.custom_url || album.id}`}>
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      {album.cover_image_url ? (
                        <Image
                          src={album.cover_image_url}
                          alt={album.title}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <Music className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                      {album.title}
                    </h3>
                  </Link>
                  {album.artist && (
                    <Link href={`/artist/${album.artist.custom_url || album.artist.id}`}>
                      <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                        {album.artist.name}
                      </p>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Music Player */}
      <div className="pb-32">
        <MusicPlayer />
      </div>
    </div>
  );
}