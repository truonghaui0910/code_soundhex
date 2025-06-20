"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSlider } from "@/components/ui/custom-slider";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

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
    togglePlayPause,
    playNext,
    playPrevious,
    changeVolume,
    seekTo,
    formatTime,
  } = useAudioPlayer();

  // Reference to progress bar
  const progressRef = useRef<HTMLDivElement>(null);

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(pos * duration);
  };

  // Use effect for debugging
  useEffect(() => {
    console.log("MusicPlayer: currentTrack =", currentTrack?.title || null);
    console.log("MusicPlayer: isPlaying =", isPlaying);
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
                    {currentTrack.artist?.name || "Unknown Artist"} • {currentTrack.album?.title || "Unknown Album"}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">Select a track to play</div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-3 flex-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-rose-500 transition-colors"
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
              className="h-8 w-8 text-gray-400 hover:text-rose-500 transition-colors"
              onClick={playNext}
              disabled={!currentTrack || !trackList || trackList.length <= 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="hidden md:flex items-center gap-2 min-w-0 w-1/4 justify-end">
            <Volume2 className={`h-4 w-4 ${volume === 0 ? 'text-gray-500' : 'text-rose-500'}`} />
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
    </>
  );
}