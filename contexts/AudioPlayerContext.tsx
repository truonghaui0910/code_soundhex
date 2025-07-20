// contexts/AudioPlayerContext.tsx
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useAudioPlayer as useAudioPlayerHook } from "@/hooks/use-audio-player";
import { Track } from "@/lib/definitions/Track";

// Định nghĩa interface cho context
interface AudioPlayerContextType {
  currentTrack: Track | null;
  trackList: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  error: string | null;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isQueueOpen: boolean;
  originalTrackList: Track[];
  playTrack: (track: Track) => void;
  setTrackList: (tracks: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  changeVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  formatTime: (time: number) => string;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleQueue: () => void;
  toggleMute: () => void;
  removeFromQueue: (trackId: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  jumpToTrack: (index: number) => void;
}

// Tạo context
const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined,
);

// Provider component
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioPlayerState = useAudioPlayerHook();

  // MEMOIZE context value to prevent unnecessary re-renders - ADD THIS
  const contextValue = useMemo(() => audioPlayerState, [
    // ONLY re-create context when these specific values change
    audioPlayerState.currentTrack?.id, // Only track ID, not the whole object
    audioPlayerState.isPlaying,
    audioPlayerState.volume,
    audioPlayerState.currentTime,
    audioPlayerState.duration,
    audioPlayerState.error,
    audioPlayerState.isShuffled,
    audioPlayerState.repeatMode,
    audioPlayerState.isQueueOpen,
    audioPlayerState.currentIndex,
    audioPlayerState.trackList.length, // Only length, not the whole array
    audioPlayerState.originalTrackList.length, // Only length, not the whole array
    // Functions are stable from useCallback in the hook
    audioPlayerState.playTrack,
    audioPlayerState.setTrackList,
    audioPlayerState.playNext,
    audioPlayerState.playPrevious,
    audioPlayerState.togglePlayPause,
    audioPlayerState.changeVolume,
    audioPlayerState.seekTo,
    audioPlayerState.formatTime,
    audioPlayerState.toggleShuffle,
    audioPlayerState.toggleRepeat,
    audioPlayerState.toggleQueue,
    audioPlayerState.toggleMute,
    audioPlayerState.removeFromQueue,
    audioPlayerState.reorderQueue,
    audioPlayerState.jumpToTrack,
  ]);

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

// Hook để sử dụng context
export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);

  if (context === undefined) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider",
    );
  }

  return context;
}
