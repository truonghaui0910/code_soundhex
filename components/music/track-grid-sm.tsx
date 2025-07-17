"use client";

import Image from "next/image";
import Link from "next/link";
import { 
    Music, 
    Play, 
    Pause, 
    Clock, 
    Plus, 
    Download, 
    Heart, 
    Share,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";

interface Track {
    id: number;
    title: string;
    duration: number | null;
    artist?: {
        id: number;
        name: string;
        custom_url: string | null;
    } | null;
    album?: {
        id: number;
        title: string;
        cover_image_url: string | null;
        custom_url: string | null;
    } | null;
    genre?: {
        id: number;
        name: string;
    } | null;
}

interface TrackGridSmProps {
    tracks: Track[];
    isLoading?: boolean;
    loadingCount?: number;
    onTrackPlay?: (track: Track, tracks: Track[]) => void;
    className?: string;
}

// Helper function to format time
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function TrackGridSm({ 
    tracks, 
    isLoading = false, 
    loadingCount = 10,
    onTrackPlay,
    className = "space-y-2"
}: TrackGridSmProps) {
    const {
        currentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const { downloadTrack } = useDownload();

    const handleTrackPlay = (track: Track) => {
        if (onTrackPlay) {
            onTrackPlay(track, tracks);
        } else {
            if (currentTrack?.id === track.id && isPlaying) {
                togglePlayPause();
            } else {
                setTrackList(tracks);
                playTrack(track);
            }
        }
    };

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: Math.ceil(loadingCount / 2) }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, colIndex) => (
                            <div key={colIndex} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                </div>
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    // Group tracks into pairs for 2-column layout
    const trackPairs = [];
    for (let i = 0; i < tracks.length; i += 2) {
        trackPairs.push(tracks.slice(i, i + 2));
    }

    return (
        <div className={className}>
            {trackPairs.map((pair, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pair.map((track) => (
                        <div
                            key={track.id}
                            className="group flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 border border-white/20 dark:border-gray-700/30"
                        >
                            {/* Album Cover */}
                            <div className="relative w-16 h-16 flex-shrink-0">
                                {track.album?.cover_image_url ? (
                                    <Image
                                        src={track.album.cover_image_url}
                                        alt={track.album?.title || track.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                                        <Music className="h-6 w-6 text-white/80" />
                                    </div>
                                )}

                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                                    <Button
                                        size="sm"
                                        onClick={() => handleTrackPlay(track)}
                                        className="w-8 h-8 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 p-0"
                                    >
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <Pause className="h-3 w-3" />
                                        ) : (
                                            <Play className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>

                                {/* Now playing indicator */}
                                {currentTrack?.id === track.id && isPlaying && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <div className="flex items-end space-x-0.5 h-2">
                                                <div className="w-0.5 bg-white animate-equalize-1" style={{ height: "30%" }}></div>
                                                <div className="w-0.5 bg-white animate-equalize-2" style={{ height: "100%" }}></div>
                                                <div className="w-0.5 bg-white animate-equalize-3" style={{ height: "60%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {track.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {track.artist?.name || "Unknown Artist"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {track.genre && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs px-2 py-0 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border-0"
                                        >
                                            {track.genre.name}
                                        </Badge>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-mono">{formatDuration(track.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-100 dark:hover:bg-purple-900/30 focus:opacity-100"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                    align="end" 
                                    className="w-48 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                                    sideOffset={5}
                                >
                                    <DropdownMenuItem 
                                        onClick={() => handleTrackPlay(track)}
                                        className="cursor-pointer"
                                    >
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <>
                                                <Pause className="h-4 w-4 mr-2" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4 mr-2" />
                                                Play
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add to Playlist
                                        </DropdownMenuItem>
                                    </AddToPlaylist>
                                    <DropdownMenuItem 
                                        onClick={() => downloadTrack(track)}
                                        className="cursor-pointer"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Heart className="h-4 w-4 mr-2" />
                                        Like
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Share className="h-4 w-4 mr-2" />
                                        Share
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}