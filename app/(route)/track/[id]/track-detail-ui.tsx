// app/(route)/track/[id]/track-detail-ui.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Headphones,
  Calendar,
  User,
  Disc,
} from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useEffect } from "react";
import { showSuccess } from "@/lib/services/notification-service";

// Helper function to format time
const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds || typeof seconds !== "number") return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to format view count
const formatViewCount = (views: number | undefined) => {
  if (!views || views === 0) return "0";
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
};

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

interface TrackDetailUIProps {
  track: any;
  isLoading?: boolean;
}

export function TrackDetailUI({
  track,
  isLoading = false,
}: TrackDetailUIProps) {
  const { currentTrack, isPlaying, playTrack, setTrackList, togglePlayPause } =
    useAudioPlayer();
  const {
    downloadTrack,
    isDownloading,
    isTrackDownloading,
  } = useDownload();
  const { getTrackLikeStatus, fetchTrackLikeStatus, toggleTrackLike } = useLikesFollows();

  // Safe track data with fallbacks
  const safeTrack = {
    id: track?.id || 0,
    title: track?.title || "Unknown Track",
    description: track?.description || null,
    duration: track?.duration || null,
    file_url: track?.file_url || null,
    view_count: track?.view_count || 0,
    artist: track?.artist || { id: 0, name: "Unknown Artist" },
    album: track?.album || null,
    genre: track?.genre || null,
    created_at: track?.created_at || null,
  };

  const handlePlayTrack = () => {
    if (safeTrack.file_url) {
      if (currentTrack?.id === safeTrack.id && isPlaying) {
        togglePlayPause();
      } else {
        setTrackList([safeTrack]);
        setTimeout(() => {
          playTrack(safeTrack);
        }, 10);
      }
    }
  };

  // Fetch track like status when component mounts
  useEffect(() => {
    if (safeTrack.id && !isLoading) {
      const trackLikeStatus = getTrackLikeStatus(safeTrack.id);
      // Only fetch if we haven't fetched yet and it's not currently loading
      if (trackLikeStatus.isLiked === undefined && !trackLikeStatus.isLoading) {
        fetchTrackLikeStatus(safeTrack.id);
      }
    }
  }, [safeTrack.id, isLoading]);

  const trackLikeStatus = getTrackLikeStatus(safeTrack.id);

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
              {safeTrack.album?.cover_image_url ? (
                <Image
                  src={safeTrack.album.cover_image_url}
                  alt={safeTrack.title}
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
                Track
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {safeTrack.title}
              </h1>
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start flex-wrap">
                <Link
                  href={`/artist/${safeTrack.artist.custom_url || safeTrack.artist.id}`}
                  prefetch={false}
                  className="font-medium hover:underline flex items-center gap-1"
                >
                  <User className="h-4 w-4" />
                  {safeTrack.artist.name}
                </Link>
                {safeTrack.album && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/album/${safeTrack.album.custom_url || safeTrack.album.id}`}
                      prefetch={false}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      <Disc className="h-4 w-4" />
                      {safeTrack.album.title}
                    </Link>
                  </>
                )}
                {safeTrack.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(safeTrack.duration)}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Headphones className="h-4 w-4" />
                  {formatViewCount(safeTrack.view_count)}
                </span>
                {trackLikeStatus.totalLikes !== undefined ? (
                  <>
                    <span>•</span>
                    <span>{trackLikeStatus.totalLikes}</span>
                  </>
                ) : trackLikeStatus.isLoading ? (
                  <>
                    <span>•</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : null}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={handlePlayTrack}
                  disabled={!safeTrack.file_url}
                >
                  {currentTrack?.id === safeTrack.id && isPlaying ? (
                    <Pause className="mr-2 h-5 w-5" />
                  ) : (
                    <Play className="mr-2 h-5 w-5" />
                  )}
                  {currentTrack?.id === safeTrack.id && isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  size="lg"
                  className={`backdrop-blur-sm transition-all duration-200 border-0 ${
                    trackLikeStatus.isLiked 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  onClick={() => toggleTrackLike(safeTrack.id)}
                  disabled={trackLikeStatus.isLoading}
                >
                  <Heart className={`mr-2 h-5 w-5 ${trackLikeStatus.isLiked ? 'fill-current' : ''}`} />
                  <div className="min-w-[60px] flex justify-center items-center">
                    {trackLikeStatus.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (trackLikeStatus.isLiked ? 'Liked' : 'Like')}
                  </div>
                </Button>
                <AddToPlaylist trackId={safeTrack.id} trackTitle={safeTrack.title}>
                  <Button
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add to Playlist
                  </Button>
                </AddToPlaylist>
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
                  onClick={() => downloadTrack(safeTrack)}
                  disabled={isTrackDownloading(safeTrack.id)}
                >
                  {isTrackDownloading(safeTrack.id) ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-5 w-5" />
                  )}
                  Download
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

      {/* Track Details Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Track Details
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Track Information */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Track Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <Music className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">Title</p>
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{safeTrack.title}</p>
                </div>

                {/* Artist */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Artist</p>
                  </div>
                  <Link
                    href={`/artist/${safeTrack.artist.custom_url || safeTrack.artist.id}`}
                    className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors truncate block"
                  >
                    {safeTrack.artist.name}
                  </Link>
                </div>

                {/* Album */}
                {safeTrack.album && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Disc className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Album</p>
                    </div>
                    <Link
                      href={`/album/${safeTrack.album.custom_url || safeTrack.album.id}`}
                      className="font-bold text-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors truncate block"
                    >
                      {safeTrack.album.title}
                    </Link>
                  </div>
                )}

                {/* Genre */}
                {safeTrack.genre && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide">Genre</p>
                    </div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{safeTrack.genre.name}</p>
                  </div>
                )}

                {/* Duration */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-rose-200/50 dark:border-rose-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300 uppercase tracking-wide">Duration</p>
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white font-mono">{formatDuration(safeTrack.duration)}</p>
                </div>

                {/* Views */}
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-cyan-200/50 dark:border-cyan-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-lg flex items-center justify-center">
                      <Headphones className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">Plays</p>
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{formatViewCount(safeTrack.view_count)}</p>
                </div>

                {/* Likes */}
                {trackLikeStatus.totalLikes !== undefined && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-red-200/50 dark:border-red-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white fill-current" />
                      </div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">Likes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{trackLikeStatus.totalLikes}</p>
                      <Heart className="h-5 w-5 text-white fill-white drop-shadow-md" />
                    </div>
                  </div>
                )}

                {/* Release Date */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-violet-200/50 dark:border-violet-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-violet-700 dark:text-violet-300 uppercase tracking-wide">Release Date</p>
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{formatDate(safeTrack.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Track Description */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Description
              </h3>
              {safeTrack.description ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {safeTrack.description}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No description available for this track.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom spacing for music player */}
      <div className="pb-32"></div>
    </div>
  );
}