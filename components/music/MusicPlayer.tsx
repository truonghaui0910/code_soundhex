"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Shuffle,
  Repeat,
  Repeat1,
  List,
  Heart,
  MoreHorizontal,
  Plus,
  Download,
  Share
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSlider } from "@/components/ui/custom-slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useDownload } from "@/hooks/use-download";
import { QueuePanel } from "./QueuePanel";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { toast } from "sonner";
import { showImportSuccess, showError, showProcessing, dismissNotifications } from "@/lib/services/notification-service";

// Helper function to format time in minutes:seconds
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function MusicPlayer() {
  const {
    currentTrack,
    trackList,
    isPlaying,
    volume,
    currentTime,
    duration,
    isShuffled,
    repeatMode,
    isQueueOpen,
    togglePlayPause,
    playNext,
    playPrevious,
    changeVolume,
    seekTo,
    formatTime,
    toggleShuffle,
    toggleRepeat,
    toggleQueue,
    toggleMute,
  } = useAudioPlayer();

  const { getTrackLikeStatus, toggleTrackLike, fetchBatchTrackLikesStatus } = useLikesFollows();
  const { downloadTrack } = useDownload();

  // References and state
  const progressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(pos * duration);
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Fetch like status for current track only
  useEffect(() => {
    if (currentTrack) {
      fetchBatchTrackLikesStatus([currentTrack.id]);
    }
  }, [currentTrack?.id, fetchBatchTrackLikesStatus]);

  // Use effect for debugging
  useEffect(() => {
    console.log('MusicPlayer: currentTrack =', currentTrack);
    console.log('MusicPlayer: isPlaying =', isPlaying);
  }, [currentTrack, isPlaying]);

  // Don't render if no track is selected
  if (!currentTrack) {
    return null;
  }

  return (
    <>
      {/* Music player control bar (fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border p-3 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Track info & image */}
          <div className="hidden sm:flex items-center gap-3 min-w-0 w-1/4">
            {currentTrack ? (
              <>
                <div className="relative h-14 w-14 rounded-md overflow-hidden shadow-md flex-shrink-0">
                  {currentTrack.album?.cover_image_url ? (
                    <Image
                      src={currentTrack.album.cover_image_url}
                      alt={`Album ${currentTrack.album.title}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Music className="h-6 w-6 text-rose-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate text-white">
                    {currentTrack.title || "Unknown Title"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentTrack.artist?.name && (
                      <>
                        <Link 
                          href={`/artist/${currentTrack.artist.id}`}
                          className="hover:text-rose-500 transition-colors"
                        >
                          {currentTrack.artist.name}
                        </Link>
                        {currentTrack.album?.title && " • "}
                      </>
                    )}
                    {currentTrack.album?.title && (
                      <Link 
                        href={`/album/${currentTrack.album.id}`}
                        className="hover:text-rose-500 transition-colors"
                      >
                        {currentTrack.album.title}
                      </Link>
                    )}
                    {!currentTrack.artist?.name && !currentTrack.album?.title && "Unknown Artist"}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">Select a track to play</div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-3 flex-1">
            {/* Shuffle button */}
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 transition-colors ${
                isShuffled 
                  ? 'text-rose-500 hover:text-rose-600' 
                  : 'text-gray-400 dark:hover:bg-white/10 hover:bg-white/10'
              }`}
              onClick={toggleShuffle}
              disabled={!currentTrack || !trackList || trackList.length <= 1}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 dark:hover:bg-white/10 hover:bg-white/10 transition-colors"
              onClick={playPrevious}
              disabled={!currentTrack || !trackList || trackList.length <= 1}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlayPause}
              disabled={!currentTrack}
              style={{ backgroundColor: currentTrack ? '#e11d48' : '#374151' }}
              className="h-12 w-12 rounded-full text-white shadow-md transition-all hover:bg-rose-700"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 dark:hover:bg-white/10 hover:bg-white/10 transition-colors"
              onClick={playNext}
              disabled={!currentTrack || !trackList || trackList.length <= 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Repeat button */}
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 transition-colors ${
                repeatMode !== 'none'
                  ? 'text-rose-500 hover:text-rose-600' 
                  : 'text-gray-400 dark:hover:bg-white/10 hover:bg-white/10'
              }`}
              onClick={toggleRepeat}
              disabled={!currentTrack}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Like, Queue and Volume control */}
          <div className="hidden md:flex items-center gap-2 min-w-0 w-1/4 justify-end">
            {/* Like button */}
            {currentTrack && (() => {
              const likeStatus = getTrackLikeStatus(currentTrack.id);
              return (
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 transition-colors ${
                    likeStatus.isLiked
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 dark:hover:bg-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => toggleTrackLike(currentTrack.id)}
                  disabled={likeStatus.isLoading}
                >
                  <Heart className={`h-4 w-4 ${
                    likeStatus.isLiked ? 'fill-current text-red-500' : ''
                  }`} />
                </Button>
              );
            })()}

            {/* Queue button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 dark:hover:bg-white/10 hover:bg-white/10 transition-colors"
              onClick={toggleQueue}
              disabled={!currentTrack || !trackList}
            >
              <List className="h-4 w-4" />
            </Button>

            {/* More options menu */}
            {currentTrack && (
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-400 dark:hover:bg-white/10 hover:bg-white/10 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                
                <div
                  ref={menuRef}
                  className={`absolute right-0 bottom-full mb-2 w-48 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md overflow-hidden ${isMenuOpen ? '' : 'hidden'}`}
                >
                  <AddToPlaylist trackId={currentTrack.id} trackTitle={currentTrack.title}>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2 inline-block" />
                      Add to Playlist
                    </button>
                  </AddToPlaylist>
                  
                  <button
                    onClick={() => {
                      downloadTrack(currentTrack);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2 inline-block" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => {
                      // Implement share functionality
                      const url = `${window.location.origin}/track/${currentTrack.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied to clipboard!');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Share className="h-4 w-4 mr-2 inline-block" />
                    Share
                  </button>
                </div>
              </div>
            )}

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={toggleMute}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-gray-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-rose-500" />
              )}
            </Button>
            <div className="w-28">
              <CustomSlider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(values) => changeVolume(values[0])}
              />
            </div>
          </div>
        </div>

        {/* Progress bar section - moved closer to controls */}
        {currentTrack && (
          <div className="mt-2">
            {/* Progress bar with time display on same line */}
            <div className="flex items-center gap-3">
              {/* Current time */}
              <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(currentTime)}</span>

              {/* Progress bar container */}
              <div className="relative flex-1 cursor-pointer group" onClick={handleProgressClick} ref={progressRef}>
                {/* Background track */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  {/* Colored progress */}
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Thumb/handle - positioned at the end of progress with higher z-index */}
                <div 
                  className="absolute top-1/2 h-5 w-5 bg-primary rounded-full border-2 border-white shadow-lg opacity-100 transform -translate-y-1/2 z-10 transition-all duration-200 hover:scale-110"
                  style={{ 
                    left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 2.5px)`,
                  }}
                />
              </div>

              {/* Total duration */}
              <span className="text-xs text-gray-400 min-w-[35px]">{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Queue Panel */}
      <QueuePanel 
        isOpen={isQueueOpen} 
        onClose={toggleQueue} 
      />
    </>
  );
}