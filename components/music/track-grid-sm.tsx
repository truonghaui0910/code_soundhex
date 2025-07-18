"use client";

import React, { useState, useRef, useEffect } from "react";
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
    MoreHorizontal,
    Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import { useLikesFollows } from "@/hooks/use-likes-follows";
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
    view_count?: number;
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

// Helper function to format view count
const formatViewCount = (count: number) => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
};

export const TrackGridSm = React.memo(function TrackGridSm({ 
    tracks, 
    isLoading = false, 
    loadingCount = 10,
    onTrackPlay,
    className = "space-y-2"
}: TrackGridSmProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const {
        currentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const { downloadTrack } = useDownload();
    const { getTrackLikeStatus, fetchTrackLikeStatus, toggleTrackLike } = useLikesFollows();

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId !== null) {
                const menuElement = menuRefs.current[openMenuId];
                if (menuElement && !menuElement.contains(event.target as Node)) {
                    setOpenMenuId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    // Fetch like status for all tracks
    useEffect(() => {
        if (!isLoading && tracks.length > 0) {
            tracks.forEach(track => {
                fetchTrackLikeStatus(track.id);
            });
        }
    }, [tracks, isLoading, fetchTrackLikeStatus]);

    const toggleMenu = (trackId: number) => {
        setOpenMenuId(openMenuId === trackId ? null : trackId);
    };

    const handleTrackPlay = (track: Track) => {
        if (onTrackPlay) {
            onTrackPlay(track, tracks);
        } else {
            setTrackList(tracks);
            setTimeout(() => {
                playTrack(track);
            }, 50);
        }
    };

    const handleTogglePlay = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            handleTrackPlay(track);
        }
    };

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: Math.ceil(loadingCount / 3) }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, colIndex) => (
                            <div key={colIndex} className="flex items-center gap-4 p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 min-w-0 px-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (!isLoading && tracks.length === 0) {
        return (
            <div className={className}>
                <div className="flex items-center gap-4 p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tracks available</p>
                </div>
            </div>
        );
    }

    // Group tracks into groups of 3 for 3-column layout
    const trackGroups = [];
    for (let i = 0; i < tracks.length; i += 3) {
        trackGroups.push(tracks.slice(i, i + 3));
    }

    return (
        <div className={className}>
            {trackGroups.map((group, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.map((track) => {
                        const trackLikeStatus = getTrackLikeStatus(track.id);
                        
                        return (
                        <div
                            key={track.id}
                            className="group flex items-center gap-4 p-6 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-200"
                        >
                            {/* Album Cover */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                {track.album?.cover_image_url ? (
                                    <Image
                                        src={track.album.cover_image_url}
                                        alt={track.album?.title || track.title}
                                        fill
                                        sizes="128px"
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
                                        onClick={() => handleTogglePlay(track)}
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
                            <div className="flex-1 min-w-0 px-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-1">
                                    <Link
                                        href={`/track/${track.id}`}
                                        className="hover:underline"
                                    >
                                        {track.title}
                                    </Link>
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                    {track.artist ? (
                                        <Link
                                            href={`/artist/${track.artist.custom_url || track.artist.id}`}
                                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:underline"
                                        >
                                            {track.artist.name}
                                        </Link>
                                    ) : (
                                        "Unknown Artist"
                                    )}
                                </p>
                                {track.album && (
                                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate mb-2">
                                        <Link
                                            href={`/album/${track.album.custom_url || track.album.id}`}
                                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:underline"
                                        >
                                            {track.album.title}
                                        </Link>
                                    </p>
                                )}
                                <div className="flex items-center justify-between gap-2 mt-2">
                                    {track.genre && (
                                        <div className="flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-2 py-1 rounded-full border-0">
                                            <span>{track.genre.name}</span>
                                        </div>
                                    )}
                                    {track.view_count !== undefined && (
                                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                            <Headphones className="h-3 w-3" />
                                            <span className="font-mono">{formatViewCount(track.view_count)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-mono">{formatDuration(track.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Menu */}
                            <div className="relative">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-200 dark:hover:bg-purple-800/50 focus:opacity-100"
                                    onClick={() => toggleMenu(track.id)}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                <div
                                    ref={(el) => (menuRefs.current[track.id] = el)}
                                    className={`absolute right-0 mt-2 w-48 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md overflow-hidden ${openMenuId === track.id ? '' : 'hidden'}`}
                                >
                                    <button
                                        onClick={() => {
                                            handleTogglePlay(track);
                                            setOpenMenuId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <>
                                                <Pause className="h-4 w-4 mr-2 inline-block" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4 mr-2 inline-block" />
                                                Play
                                            </>
                                        )}
                                    </button>
                                    <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setOpenMenuId(null);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4 mr-2 inline-block" />
                                            Add to Playlist
                                        </button>
                                    </AddToPlaylist>
                                    <button
                                        onClick={() => {
                                            downloadTrack(track);
                                            setOpenMenuId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        <Download className="h-4 w-4 mr-2 inline-block" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            toggleTrackLike(track.id);
                                            setOpenMenuId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        disabled={trackLikeStatus.isLoading}
                                    >
                                        <Heart className={`h-4 w-4 mr-2 inline-block ${trackLikeStatus.isLiked ? 'fill-current text-red-500' : ''}`} />
                                        {trackLikeStatus.isLiked ? 'Unlike' : 'Like'}
                                        {trackLikeStatus.totalLikes !== undefined && trackLikeStatus.totalLikes > 0 && (
                                            <span className="ml-1">({trackLikeStatus.totalLikes})</span>
                                        )}
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        <Share className="h-4 w-4 mr-2 inline-block" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});