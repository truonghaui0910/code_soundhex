
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, 
  Pause, 
  Music, 
  Clock, 
  Download, 
  Plus, 
  MoreVertical,
  Volume2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { Track } from "@/lib/definitions/Track";

interface TrackListProps {
  tracks: Track[];
  title?: string;
  showTrackNumber?: boolean;
  showAlbumInfo?: boolean;
  showArtistInfo?: boolean;
  onPlayAll?: () => void;
}

// Helper function to format time in minutes:seconds
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
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

  const handlePlayTrack = (track: Track, index: number) => {
    setTrackList(tracks);
    playTrack(track, index);
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

  const safeTracks = Array.isArray(tracks) ? tracks : [];

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
            if (!track || !track.id) {
              return null;
            }

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
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  {track.cover_image_url ? (
                    <Image
                      src={track.cover_image_url}
                      alt={track.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="h-5 w-5 text-white/80" />
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 
                      className={`font-medium text-sm truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${
                        isCurrentTrack ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                      onClick={() => handleTogglePlay(track, idx)}
                    >
                      {track.title}
                    </h3>
                    {isCurrentlyPlaying && (
                      <Volume2 className="h-3 w-3 text-purple-600 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {showArtistInfo && track.artist && (
                      <Link
                        href={`/artist/${track.artist.custom_url || track.artist.id}`}
                        className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
                      >
                        {track.artist.name}
                      </Link>
                    )}
                    {showAlbumInfo && track.album && (
                      <>
                        {showArtistInfo && <span>•</span>}
                        <Link
                          href={`/album/${track.album.id}`}
                          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
                        >
                          {track.album.title}
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {formatDuration(track.duration)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    >
                      <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                    </Button>
                  </AddToPlaylist>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    onClick={() => handleDownload(track)}
                    disabled={isTrackDownloading(track.id)}
                  >
                    <Download className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
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
