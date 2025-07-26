"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music, Play, Pause, Clock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Track } from "@/lib/definitions/Track";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import {
    TrackContextMenu,
    TrackContextMenuTrigger,
} from "./track-context-menu";
import { showSuccess } from "@/lib/services/notification-service";
import { LikeButton } from "@/components/ui/like-button";
import { createPortal } from "react-dom";

interface TrackGridProps {
    tracks: Track[];
    isLoading?: boolean;
    loadingCount?: number;
    showTrackNumbers?: boolean;
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
const formatViewCount = (views: number | undefined) => {
    if (!views || views === 0) return "0";
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
    return `${(views / 1000000).toFixed(1)}M`;
};

const TrackGrid = memo(function TrackGrid({
    tracks,
    isLoading = false,
    loadingCount = 10,
    showTrackNumbers = true,
    onTrackPlay,
    className = "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6",
}: TrackGridProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const {
        currentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const { downloadTrack } = useDownload();
    const {
        getTrackLikeStatus,
        fetchTrackLikeStatus,
        toggleTrackLike,
        fetchBatchTrackLikesStatus,
    } = useLikesFollows();

    // Memoize trackIds to prevent unnecessary recalculations
    const trackIds = useMemo(() => {
        if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return [];
        return tracks.map((track) => track.id);
    }, [tracks]);

    // ADD ref to track previous trackIds and prevent duplicate API calls
    const prevTrackIdsRef = useRef<number[]>([]);

    const handleTrackPlay = useCallback(
        (track: Track) => {
            if (onTrackPlay) {
                onTrackPlay(track, tracks);
            } else {
                if (currentTrack?.id === track.id && isPlaying) {
                    togglePlayPause();
                } else {
                    setTrackList([track]);
                    playTrack(track);
                }
            }
        },
        [
            onTrackPlay,
            tracks,
            currentTrack?.id,
            isPlaying,
            togglePlayPause,
            setTrackList,
            playTrack,
        ],
    );

    const toggleMenu = (trackId: number) => {
        setOpenMenuId(openMenuId === trackId ? null : trackId);
    };

    const handleTogglePlay = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            handleTrackPlay(track);
        }
    };

    // Batch fetch likes status for visible tracks
    useEffect(() => {
        if (trackIds.length > 0 && !isLoading) {
            // Create string representation for comparison
            const currentIdsString = [...trackIds].sort().join(",");
            const prevIdsString = [...prevTrackIdsRef.current].sort().join(",");

            // Only call API if trackIds actually changed
            if (currentIdsString !== prevIdsString) {
                console.log("TrackGrid - Fetching likes for tracks:", trackIds);
                console.log("TrackGrid - Previous IDs:", prevTrackIdsRef.current);
                console.log("TrackGrid - Current IDs:", trackIds);
                
                fetchBatchTrackLikesStatus(trackIds);
                prevTrackIdsRef.current = [...trackIds];
            }
        }
    }, [trackIds, isLoading, fetchBatchTrackLikesStatus]);

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: loadingCount }).map((_, index) => (
                    <div key={index} className="group relative">
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/30 animate-pulse">
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                            <div className="p-6 space-y-3">
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Safety check for tracks
    if (!tracks || !Array.isArray(tracks)) {
        return (
            <div className={className}>
                <div className="text-center py-20">
                    <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No tracks available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {tracks.map((track, index) => (
                <div
                    key={track.id}
                    className="group relative"
                    style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                    }}
                >
                    {/* Main Card */}
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 dark:border-gray-700/30 overflow-visible">
                        {/* Album Cover */}
                        <div className="relative aspect-square  rounded-t-3xl">
                            {track.album?.cover_image_url ? (
                                <Link href={`/track/${track.id}`}>
                                    <Image
                                        src={track.album.cover_image_url}
                                        alt={track.album?.title || track.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer rounded-t-3xl"
                                        style={{
                                            transform: "translateZ(0)",
                                            willChange: "transform",
                                        }}
                                    />
                                </Link>
                            ) : (
                                <Link href={`/track/${track.id}`}>
                                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center cursor-pointer">
                                        <Music className="h-20 w-20 text-white/80" />
                                    </div>
                                </Link>
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Bottom Controls - Like, Play and Menu aligned */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                <div className="flex items-baseline gap-10">
                                    <LikeButton
                                        type="track"
                                        id={track.id}
                                        variant="overlay"
                                        size="sm"
                                        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleTrackPlay(track);
                                        }}
                                        className="w-12 h-12 rounded-full bg-white/90 text-purple-600 hover:bg-white shadow-lg backdrop-blur-sm p-0"
                                    >
                                        {currentTrack?.id === track.id &&
                                        isPlaying ? (
                                            <Pause className="h-3 w-3" />
                                        ) : (
                                            <Play className="h-3 w-3" />
                                        )}
                                    </Button>
                                    <div className="relative z-[99999]">
                                        <TrackContextMenuTrigger
                                            isOpen={openMenuId === track.id}
                                            onToggle={() =>
                                                toggleMenu(track.id)
                                            }
                                            className="w-8 h-8 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full"
                                        />
                                        {openMenuId === track.id && (
                                            <TrackContextMenu
                                                track={track}
                                                isOpen={openMenuId === track.id}
                                                onClose={() =>
                                                    setOpenMenuId(null)
                                                }
                                                position="top"
                                                className="z-[999]"
                                                variant="light"
                                                actions={{
                                                    play: true,
                                                    addToPlaylist: true,
                                                    download: true,
                                                    like: false,
                                                    share: true,
                                                }}
                                                onPlayToggle={handleTogglePlay}
                                                onDownload={downloadTrack}
                                                onLikeToggle={toggleTrackLike}
                                                onShare={(track) => {
                                                    const trackPath =
                                                        track.custom_url ||
                                                        track.id;
                                                    const url = `${window.location.origin}/track/${trackPath}`;
                                                    navigator.clipboard.writeText(
                                                        url,
                                                    );
                                                    showSuccess({
                                                        title: "Copied!",
                                                        message:
                                                            "Link copied to clipboard!",
                                                    });
                                                }}
                                                isPlaying={isPlaying}
                                                isCurrentTrack={
                                                    currentTrack?.id ===
                                                    track.id
                                                }
                                                likeStatus={{
                                                    isLiked:
                                                        getTrackLikeStatus(
                                                            track.id,
                                                        ).isLiked || false,
                                                    isLoading:
                                                        getTrackLikeStatus(
                                                            track.id,
                                                        ).isLoading,
                                                    totalLikes:
                                                        getTrackLikeStatus(
                                                            track.id,
                                                        ).totalLikes,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Now playing indicator */}
                            {currentTrack?.id === track.id && isPlaying && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                        <div className="flex items-end space-x-0.5 h-4">
                                            <div
                                                className="w-0.5 bg-white animate-equalize-1"
                                                style={{ height: "30%" }}
                                            ></div>
                                            <div
                                                className="w-0.5 bg-white animate-equalize-2"
                                                style={{ height: "100%" }}
                                            ></div>
                                            <div
                                                className="w-0.5 bg-white animate-equalize-3"
                                                style={{ height: "60%" }}
                                            ></div>
                                            <div
                                                className="w-0.5 bg-white animate-equalize-4"
                                                style={{ height: "80%" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Track number badge */}
                            {showTrackNumbers && (
                                <div className="absolute top-4 left-4">
                                    <Link href={`/track/${track.id}`}>
                                        <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-black/70 transition-colors cursor-pointer">
                                            {index + 1}
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Genre badge - bottom left */}
                            <div className="absolute bottom-4 left-4">
                                <Link
                                    href={`/music?genre=${track.genre?.name || "all"}`}
                                >
                                    <div className="text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border-0 hover:bg-black/70 transition-colors cursor-pointer">
                                        {track.genre?.name || "Unknown"}
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Track Info */}
                        <div className="p-3">
                            <div className="space-y-3">
                                <div>
                                    <Link
                                        href={`/track/${track.custom_url || track.id}`}
                                    >
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors cursor-pointer">
                                            {track.title}
                                        </h3>
                                    </Link>
                                    <Link
                                        href={`/artist/${track.artist?.custom_url || track.artist?.id}`}
                                    >
                                        <p className="text-gray-600 dark:text-gray-400 truncate text-sm font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                                            {track.artist?.name ||
                                                "Unknown Artist"}
                                        </p>
                                    </Link>
                                    {track.album && (
                                        <Link
                                            href={`/album/${track.album?.custom_url || track.album?.id}`}
                                        >
                                            <p className="text-gray-500 dark:text-gray-500 truncate text-xs hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                                                {track.album?.title ||
                                                    "Unknown Album"}
                                            </p>
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <Link href={`/track/${track.id}`}>
                                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors cursor-pointer">
                                            <Headphones className="h-3 w-3" />
                                            <span className="font-mono">
                                                {formatViewCount(
                                                    track.view_count,
                                                )}
                                            </span>
                                        </div>
                                    </Link>
                                    <Link href={`/track/${track.id}`}>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors cursor-pointer">
                                            <Clock className="h-3 w-3" />
                                            <span className="font-mono">
                                                {formatDuration(
                                                    track.duration || null,
                                                )}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating shadow effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 transform scale-102"></div>
                </div>
            ))}
        </div>
    );
});

TrackGrid.displayName = "TrackGrid";

export { TrackGrid };
