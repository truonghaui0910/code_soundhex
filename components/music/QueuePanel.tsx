"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Play,
  Pause,
  Music,
  GripVertical,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
  const {
    currentTrack,
    trackList,
    currentIndex,
    isPlaying,
    jumpToTrack,
    removeFromQueue,
    togglePlayPause
  } = useAudioPlayer();

  if (!isOpen) return null;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Queue Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Queue</h3>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Track Count */}
        <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
          {trackList.length} {trackList.length === 1 ? 'track' : 'tracks'}
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto">
          {trackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Music className="h-12 w-12 mb-4" />
              <p>No tracks in queue</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {trackList.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className={`group flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                    currentIndex === index
                      ? 'bg-rose-500/20 border border-rose-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                  onClick={() => jumpToTrack(index)}
                >
                  {/* Drag Handle */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-gray-500" />
                  </div>

                  {/* Track Image */}
                  <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                    {track.album?.cover_image_url ? (
                      <Image
                        src={track.album.cover_image_url}
                        alt={`Album ${track.album.title}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Music className="h-4 w-4 text-rose-500" />
                      </div>
                    )}
                    
                    {/* Play/Pause Overlay */}
                    {currentIndex === index && (
                      <div 
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlayPause();
                        }}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      currentIndex === index ? 'text-rose-500' : 'text-white'
                    }`}>
                      {track.title || "Unknown Title"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {track.artist?.name && (
                        <Link 
                          href={`/artist/${track.artist.id}`}
                          className="hover:text-rose-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {track.artist.name}
                        </Link>
                      )}
                      {!track.artist?.name && "Unknown Artist"}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(track.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            {currentTrack && (
              <>Now playing: {currentTrack.title}</>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 