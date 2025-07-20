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
    Headphones 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { useEffect } from "react";
import { useLikesFollows } from "@/hooks/use-likes-follows";

interface Track {
    id: number;
    title: string;
    duration: number | null;
    view_count?: number;
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

export function TrackGrid({ 
    tracks, 
    isLoading = false, 
    loadingCount = 10, 
    showTrackNumbers = true,
    onTrackPlay,
    className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6"
}: TrackGridProps) {
    const {
        currentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const { downloadTrack } = useDownload();
    const { getTrackLikeStatus, fetchTrackLikeStatus, toggleTrackLike, fetchBatchTrackLikesStatus } = useLikesFollows();

    const handleTrackPlay = (track: Track) => {
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
    };

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

    // Batch fetch like status for all tracks
    useEffect(() => {
        if (!isLoading && tracks.length > 0) {
            const trackIds = tracks.map(track => track.id);
            fetchBatchTrackLikesStatus(trackIds);
        }
    }, [tracks, isLoading, fetchBatchTrackLikesStatus]);

    return (
        <div className={className}>
            {tracks.map((track, index) => (
                <div
                    key={track.id}
                    className="group relative"
                    style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`
                    }}
                >
                    {/* Main Card */}
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 dark:border-gray-700/30">

                        {/* Album Cover */}
                        <div className="relative aspect-square overflow-hidden">
                            {track.album?.cover_image_url ? (
                                <Image
                                    src={track.album.cover_image_url}
                                    alt={track.album?.title || track.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    style={{
                                        transform: 'translateZ(0)',
                                        willChange: 'transform'
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center">
                                    <Music className="h-20 w-20 text-white/80" />
                                </div>
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Play button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => handleTrackPlay(track)}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm"
                                >
                                    {currentTrack?.id === track.id && isPlaying ? (
                                        <Pause className="h-6 w-6" />
                                    ) : (
                                        <Play className="h-6 w-6" />
                                    )}
                                </Button>
                            </div>

                            {/* Now playing indicator */}
                            {currentTrack?.id === track.id && isPlaying && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                        <div className="flex items-end space-x-0.5 h-5">
                                            <div className="w-1 bg-white animate-equalize-1" style={{ height: "30%" }}></div>
                                            <div className="w-1 bg-white animate-equalize-2" style={{ height: "100%" }}></div>
                                            <div className="w-1 bg-white animate-equalize-3" style={{ height: "60%" }}></div>
                                            <div className="w-1 bg-white animate-equalize-4" style={{ height: "80%" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Track number badge */}
                            {showTrackNumbers && (
                                <div className="absolute top-4 left-4">
                                    <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {index + 1}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="p-6">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {track.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 truncate text-sm font-medium">
                                        {track.artist?.name || "Unknown Artist"}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-500 truncate text-xs">
                                        <Link
                                            href={`/album/${track.album?.custom_url || track.album?.id}`}
                                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {track.album?.title || "Unknown Album"}
                                        </Link>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-2 py-1 rounded-full border-0">
                                        <span>{track.genre?.name || "Unknown"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                        <Headphones className="h-3 w-3" />
                                        <span className="font-mono">{formatViewCount(track.view_count)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-mono">{formatDuration(track.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                                    <Button size="sm" variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900/30 flex-1">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </AddToPlaylist>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadTrack(track)}
                                    className="hover:bg-purple-100 dark:hover:bg-purple-900/30 flex-1"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className={`backdrop-blur-sm transition-all duration-200 border-0 p-2 h-8 w-8 ${
                                        getTrackLikeStatus(track.id).isLiked 
                                            ? 'bg-red-500 text-white hover:bg-red-600' 
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                    onClick={() => toggleTrackLike(track.id)}
                                    disabled={getTrackLikeStatus(track.id).isLoading}
                                >
                                    <Heart className={`h-4 w-4 ${getTrackLikeStatus(track.id).isLiked ? 'fill-current' : ''}`} />
                                </Button>
                                <Button size="sm" variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900/30 flex-1">
                                    <Share className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Floating shadow effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 transform scale-102"></div>
                </div>
            ))}
        </div>
    );
}