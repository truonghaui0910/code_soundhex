// app/(route)/album/[id]/album-detail-ui.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Play, Pause, Clock, Music, Heart, Share, Download, Plus } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { TrackGridSm } from "@/components/music/track-grid-sm";

// Helper function to format time
const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds || typeof seconds !== 'number') return "--:--";
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

export function AlbumDetailUI({ album, tracks, isLoading = false, tracksLoading = false }: AlbumDetailUIProps) {
  const { currentTrack, isPlaying, playTrack, setTrackList, togglePlayPause } = useAudioPlayer();
  const { downloadTrack, downloadMultipleTracks, isDownloading, isTrackDownloading } = useDownload();

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
  const safeTracks = Array.isArray(tracks) ? tracks.filter(track => track && track.id) : [];

  const handlePlayAlbum = () => {
    if (safeTracks && safeTracks.length > 0) {
      setTrackList(safeTracks);
      setTimeout(() => {
        playTrack(safeTracks[0]);
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
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
                {safeAlbum.release_date && (
                  <>
                    <span>•</span>
                    <span>{new Date(safeAlbum.release_date).getFullYear()}</span>
                  </>
                )}
                {safeTracks.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{safeTracks.length} songs</span>
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
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Save
                </Button>
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Track List</h2>
        </div>
        
        <TrackGridSm
          tracks={safeTracks}
          isLoading={tracksLoading}
          loadingCount={15}
          onPlayAll={handlePlayAlbum}
        />
      </div>

      {/* Music Player */}
      <div className="pb-32">
        <MusicPlayer />
      </div>
    </div>
  );
}