
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, 
  Pause, 
  Music, 
  Clock, 
  Download, 
  Plus, 
  Volume2,
  Heart,
  Share
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { Track } from "@/lib/definitions/Track";
import { showSuccess } from "@/lib/services/notification-service";
import { useLikesFollows } from "@/hooks/use-likes-follows";

interface TrackListProps {
  tracks: Track[];
  title?: string;
  showTrackNumber?: boolean;
  showAlbumInfo?: boolean;
  showArtistInfo?: boolean;
  onPlayAll?: () => void;
}

// Helper function to format time in minutes:seconds
const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds || typeof seconds !== 'number') return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function TrackList({ 
  tracks, 
  title = "Track List",
  showTrackNumber = true,
  showAlbumInfo = false,
  showArtistInfo = true,
  onPlayAll
}: TrackListProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  
  const {
    currentTrack,
    isPlaying,
    playTrack,
    setTrackList,
    togglePlayPause,
  } = useAudioPlayer();
  
  const { downloadTrack, isTrackDownloading } = useDownload();
  const { getTrackLikeStatus, fetchTrackLikeStatus, toggleTrackLike } = useLikesFollows();

  const handlePlayTrack = (track: Track, index: number) => {
    setTrackList(tracks);
    setTimeout(() => {
      playTrack(track);
    }, 50);
  };

  const handleTogglePlay = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      handlePlayTrack(track, index);
    }
  };

  const handleDownload = async (track: Track) => {
    try {
      await downloadTrack(track);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const safeTracks = Array.isArray(tracks) ? tracks.filter(track => track && track.id) : [];

  // Fetch track like status when component mounts
  useEffect(() => {
    if (safeTracks.length > 0) {
      const trackIds = safeTracks.map(track => track.id);
      trackIds.forEach(trackId => {
        const trackLikeStatus = getTrackLikeStatus(trackId);
        if (trackLikeStatus.isLiked === undefined && !trackLikeStatus.isLoading) {
          fetchTrackLikeStatus(trackId);
        }
      });
    }
  }, [safeTracks, getTrackLikeStatus, fetchTrackLikeStatus]);

  if (safeTracks.length === 0) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              {title}
            </h2>
          </div>
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tracks available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
      <CardContent className="p-0">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              {title}
            </h2>
            {onPlayAll && (
              <Button
                onClick={onPlayAll}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Play All
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {safeTracks.map((track, idx) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;

            return (
              <div
                key={`${track.id}-${idx}`}
                className="group flex items-center gap-4 p-4 border-b border-gray-100/50 dark:border-gray-700/30 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                {/* Track Number / Play Button */}
                {showTrackNumber && (
                  <div className="w-8 text-center">
                    {hoveredTrack === track.id || isCurrentTrack ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        onClick={() => handleTogglePlay(track, idx)}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Play className="h-4 w-4 text-purple-600" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                )}

                {/* Hidden Play Button Space for non-numbered lists */}
                {!showTrackNumber && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    {hoveredTrack === track.id || isCurrentTrack ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        onClick={() => handleTogglePlay(track, idx)}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Play className="h-4 w-4 text-purple-600" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                )}

                {/* Track Cover */}
                <Link href={`/track/${track.id}`}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center cursor-pointer">
                    {track.album?.cover_image_url ? (
                      <Image
                        src={track.album.cover_image_url}
                        alt={track.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-white/80" />
                    )}
                  </div>
                </Link>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/track/${track.id}`}>
                      <h3 
                        className={`font-semibold text-lg truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${
                          isCurrentTrack ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {track.title}
                      </h3>
                    </Link>
                    {/* Playing indicator with wave animation */}
                    {isCurrentlyPlaying && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-end gap-[2px] h-4">
                          <div className="w-[2px] bg-purple-500 rounded-full animate-pulse" style={{ height: '4px', animationDelay: '0ms', animationDuration: '1000ms' }}></div>
                          <div className="w-[2px] bg-purple-500 rounded-full animate-pulse" style={{ height: '8px', animationDelay: '150ms', animationDuration: '1000ms' }}></div>
                          <div className="w-[2px] bg-purple-500 rounded-full animate-pulse" style={{ height: '6px', animationDelay: '300ms', animationDuration: '1000ms' }}></div>
                          <div className="w-[2px] bg-purple-500 rounded-full animate-pulse" style={{ height: '10px', animationDelay: '450ms', animationDuration: '1000ms' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-base text-gray-500 dark:text-gray-400">
                    {showArtistInfo && track.artist && (
                      <Link
                        href={`/artist/${track.artist.custom_url || track.artist.id}`}
                        className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate font-medium"
                      >
                        {track.artist.name}
                      </Link>
                    )}
                    {showAlbumInfo && track.album && (
                      <>
                        {showArtistInfo && <span>•</span>}
                        <Link
                          href={`/album/${track.album.custom_url || track.album.id}`}
                          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
                        >
                          {track.album.title}
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Duration and Genre */}
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  {track.genre && (
                    <Link href={`/music?genre=${track.genre.name}`}>
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border-0 hover:from-purple-200 hover:to-pink-200 cursor-pointer transition-colors"
                      >
                        {track.genre.name}
                      </Badge>
                    </Link>
                  )}
                  <Link href={`/track/${track.id}`}>
                    <div className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                    </Button>
                  </AddToPlaylist>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload(track);
                    }}
                    disabled={isTrackDownloading(track.id)}
                  >
                    <Download className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50 ${
                      getTrackLikeStatus(track.id).isLiked ? 'text-red-500' : ''
                    }`}
                    title="Like"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleTrackLike(track.id);
                    }}
                    disabled={getTrackLikeStatus(track.id).isLoading}
                  >
                    <Heart className={`h-4 w-4 ${getTrackLikeStatus(track.id).isLiked ? 'fill-current' : ''} hover:text-purple-600 dark:hover:text-purple-400`} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    title="Share"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentUrl = window.location.href;
                      navigator.clipboard.writeText(currentUrl);
                      showSuccess({ title: "Copied!", message: "Link copied to clipboard!" });
                    }}
                  >
                    <Share className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
