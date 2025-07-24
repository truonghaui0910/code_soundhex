"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Play,
    Pause,
    Download,
    Heart,
    Share,
    Clock,
    Headphones,
    Music,
    Album,
    Plus,
    Shuffle,
    ArrowLeft,
    Edit,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Track } from "@/lib/definitions/Track";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";
import { TrackGrid } from "@/components/music/track-grid";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { showSuccess } from "@/lib/services/notification-service";
import { EditTrackModal } from "@/components/music/edit-track-modal";
import { useCurrentUser } from "@/hooks/use-current-user";

interface TrackDetailUIProps {
    track: Track;
    isLoading?: boolean;
}

export function TrackDetailUI({ track, isLoading }: TrackDetailUIProps) {
    const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
    const [artistTracks, setArtistTracks] = useState<Track[]>([]);
    const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
    const [isLoadingArtistTracks, setIsLoadingArtistTracks] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(track);
    const prevTrackIdRef = useRef<number | null>(null);
    const { user } = useCurrentUser();

    // Update current track when prop changes
    useEffect(() => {
        setCurrentTrack(track);
    }, [track]);

    // Fetch recommended tracks based on current track
    const fetchRecommendedTracks = useCallback(async () => {
        if (!currentTrack?.id) return;

        try {
            setIsLoadingRecommended(true);
            const response = await fetch(
                `/api/tracks/${currentTrack.id}/recommended?limit=12`,
            );

            if (response.ok) {
                const data = await response.json();
                setRecommendedTracks(data || []);
            } else {
                setRecommendedTracks([]);
            }
        } catch (error) {
            console.error("Error fetching recommended tracks:", error);
            setRecommendedTracks([]);
        } finally {
            setIsLoadingRecommended(false);
        }
    }, [currentTrack?.id]);

    // Fetch other tracks by the same artist
    const fetchArtistTracks = useCallback(async () => {
        if (!currentTrack?.id) return;

        try {
            setIsLoadingArtistTracks(true);
            const response = await fetch(
                `/api/tracks/${currentTrack.id}/artist-tracks?limit=20`,
            );

            if (response.ok) {
                const data = await response.json();
                setArtistTracks(data || []);
            } else {
                setArtistTracks([]);
            }
        } catch (error) {
            console.error("Error fetching artist tracks:", error);
            setArtistTracks([]);
        } finally {
            setIsLoadingArtistTracks(false);
        }
    }, [currentTrack?.id]);

    useEffect(() => {
        if (currentTrack?.id && currentTrack.id !== prevTrackIdRef.current) {
            fetchRecommendedTracks();
            fetchArtistTracks();
            prevTrackIdRef.current = currentTrack.id;
        }
    }, [currentTrack?.id, fetchRecommendedTracks, fetchArtistTracks]);

    const {
        currentTrack: audioCurrentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const { downloadTrack, isDownloading, isTrackDownloading } = useDownload();
    const { getTrackLikeStatus, toggleTrackLike } = useLikesFollows();

    const handleTrackPlay = useCallback(
        (selectedTrack: Track) => {
            if (audioCurrentTrack?.id === selectedTrack.id && isPlaying) {
                togglePlayPause();
            } else {
                setTrackList([selectedTrack]);
                playTrack(selectedTrack);
            }
        },
        [
            audioCurrentTrack?.id,
            isPlaying,
            togglePlayPause,
            setTrackList,
            playTrack,
        ],
    );

    // Check if current user owns this track
    const userOwnsTrack = user && currentTrack?.artist?.user_id === user.id;

    const handleTrackUpdate = (updatedTrack: Track) => {
        setCurrentTrack(updatedTrack);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
                {currentTrack.album?.cover_image_url ? (
                    <Image
                        src={currentTrack.album.cover_image_url}
                        alt={currentTrack.album?.title || currentTrack.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center">
                        <Music className="h-32 w-32 text-white/80" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20 dark:bg-black/60"></div>
            </div>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Track Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {currentTrack.title}
                                </h1>
                                {userOwnsTrack && (
                                    <Button
                                        onClick={() => setShowEditModal(true)}
                                        variant="outline"
                                        size="sm"
                                        className="ml-4"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Track
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-lg">
                                <span className="text-gray-600 dark:text-gray-400">
                                    by
                                </span>
                                <Link
                                    href={`/artist/${currentTrack.artist?.custom_url || currentTrack.artist?.id}`}
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                                >
                                    {currentTrack.artist?.name ||
                                        "Unknown Artist"}
                                </Link>
                                {currentTrack.album && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <Link
                                            href={`/album/${currentTrack.album?.custom_url || currentTrack.album?.id}`}
                                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                                        >
                                            {currentTrack.album.title}
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 border-0">
                                    {currentTrack.genre?.name ||
                                        "Unknown Genre"}
                                </Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    <Clock className="h-4 w-4 inline-block mr-1" />
                                    {currentTrack.duration
                                        ? `${Math.floor(currentTrack.duration / 60)}:${(currentTrack.duration % 60).toString().padStart(2, "0")}`
                                        : "Unknown"}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    <Headphones className="h-4 w-4 inline-block mr-1" />
                                    {currentTrack.view_count
                                        ? currentTrack.view_count.toLocaleString()
                                        : "0"}{" "}
                                    views
                                </span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {currentTrack.description ||
                                    "No description available."}
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button
                                    onClick={() =>
                                        handleTrackPlay(currentTrack)
                                    }
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {audioCurrentTrack?.id ===
                                        currentTrack.id && isPlaying ? (
                                        <Pause className="h-5 w-5 mr-2" />
                                    ) : (
                                        <Play className="h-5 w-5 mr-2" />
                                    )}
                                    {audioCurrentTrack?.id ===
                                        currentTrack.id && isPlaying
                                        ? "Pause"
                                        : "Play"}
                                </Button>

                                <AddToPlaylist
                                    trackId={currentTrack.id}
                                    trackTitle={currentTrack.title}
                                >
                                    <Button variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add to Playlist
                                    </Button>
                                </AddToPlaylist>

                                <Button
                                    variant="outline"
                                    onClick={() => downloadTrack(currentTrack)}
                                    disabled={isTrackDownloading(
                                        currentTrack.id,
                                    )}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {isTrackDownloading(currentTrack.id)
                                        ? "Downloading..."
                                        : "Download"}
                                </Button>

                                <Button
                                    variant="outline"
                                    className={`transition-all duration-200 ${
                                        getTrackLikeStatus(currentTrack.id)
                                            .isLiked
                                            ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() =>
                                        toggleTrackLike(currentTrack.id)
                                    }
                                    disabled={
                                        getTrackLikeStatus(currentTrack.id)
                                            .isLoading
                                    }
                                >
                                    <Heart
                                        className={`h-4 w-4 mr-2 ${
                                            getTrackLikeStatus(currentTrack.id)
                                                .isLiked
                                                ? "fill-current"
                                                : ""
                                        }`}
                                    />
                                    {getTrackLikeStatus(currentTrack.id).isLiked
                                        ? "Liked"
                                        : "Like"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Related Content */}
                    <div>
                        <Card className="w-full">
                            <CardContent className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    More by {currentTrack.artist?.name}
                                </h3>
                                <TrackGrid
                                    tracks={artistTracks}
                                    isLoading={isLoadingArtistTracks}
                                    gridCols="grid grid-cols-1 gap-4"
                                    loadingCount={5}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recommended Tracks Section */}
                {recommendedTracks.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Recommended for you
                        </h2>
                        <TrackGrid
                            tracks={recommendedTracks.slice(0, 5)}
                            isLoading={isLoadingRecommended}
                            gridCols="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                        />
                    </section>
                )}

                {/* Edit Track Modal */}
                {userOwnsTrack && (
                    <EditTrackModal
                        track={currentTrack}
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onUpdate={handleTrackUpdate}
                    />
                )}
            </div>
            <div className="pb-32"></div>
        </div>
    );
}
