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
  // Use hook to manage audio playback state
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    changeVolume,
    seekTo,
    formatTime
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
    console.log('MusicPlayer: currentTrack =', currentTrack);
    console.log('MusicPlayer: isPlaying =', isPlaying);
  }, [currentTrack, isPlaying]);

  return (
    <>
      {/* Music player control bar (fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50 shadow-lg">
        {/* Time display above progress bar */}
        {currentTrack && (
          <div className="flex justify-between text-xs text-gray-400 mb-1 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatDuration(currentTrack.duration)}</span>
          </div>
        )}

        {/* Progress bar and thumb */}
        <div className="relative w-full mb-4 cursor-pointer group" onClick={handleProgressClick} ref={progressRef}>
          {/* Background track */}
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            {/* Colored progress */}
            <div
              className="h-full bg-red-600 rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Thumb/handle - positioned at the end of progress with higher z-index */}
          {currentTrack && (
            <div 
              className="absolute top-1/2 h-5 w-5 bg-rose-600 rounded-full border-2 border-white shadow-md opacity-100 transform -translate-y-1/2 z-10"
              style={{ 
                left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 2.5px)`,
              }}
            />
          )}
        </div>

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
      </div>
    </>
  );
}