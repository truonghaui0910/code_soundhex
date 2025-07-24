"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import TracksListLight from "@/components/music/tracks-list-light";
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
    const router = useRouter();

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
        if (!currentTrack?.id) {
            console.log("🔍 fetchArtistTracks - No currentTrack.id, skipping");
            return;
        }

        console.log("🔍 fetchArtistTracks - Starting fetch:", {
            trackId: currentTrack.id,
            trackTitle: currentTrack.title,
            artistId: currentTrack.artist?.id,
            artistName: currentTrack.artist?.name
        });

        try {
            setIsLoadingArtistTracks(true);
            const apiUrl = `/api/tracks/${currentTrack.id}/artist-tracks?limit=20`;
            console.log("🔍 fetchArtistTracks - API URL:", apiUrl);
            
            const response = await fetch(apiUrl);
            console.log("🔍 fetchArtistTracks - Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("🔍 fetchArtistTracks - Raw response data:", {
                    isArray: Array.isArray(data),
                    count: data?.length || 0,
                    dataType: typeof data,
                    firstTrack: data?.[0],
                    currentTrackId: currentTrack.id,
                    allTrackIds: data?.map((t: any) => t.id) || []
                });

                // Filter out current track
                const filteredTracks = Array.isArray(data) 
                    ? data.filter(track => track.id !== currentTrack.id)
                    : [];
                
                console.log("🔍 fetchArtistTracks - After filtering:", {
                    originalCount: data?.length || 0,
                    filteredCount: filteredTracks.length,
                    removedCurrentTrack: (data?.length || 0) !== filteredTracks.length
                });

                setArtistTracks(filteredTracks);
            } else {
                const errorText = await response.text();
                console.error("🔍 fetchArtistTracks - Failed to fetch:", {
                    status: response.status,
                    statusText: response.statusText,
                    errorText
                });
                setArtistTracks([]);
            }
        } catch (error) {
            console.error("🔍 fetchArtistTracks - Error:", error);
            setArtistTracks([]);
        } finally {
            setIsLoadingArtistTracks(false);
        }
    }, [currentTrack?.id]);

    useEffect(() => {
        if (currentTrack?.id && currentTrack.id !== prevTrackIdRef.current) {
            fetchRecommendedTracks();
            fetchArtistTracks();
            fetchTrackLikeStatus(currentTrack.id);
            prevTrackIdRef.current = currentTrack.id;
        }
    }, [currentTrack?.id, fetchRecommendedTracks, fetchArtistTracks, fetchTrackLikeStatus]);

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

    // Check if current user owns this track (through artist relationship)
    const userOwnsTrack = user && currentTrack?.user_id === user.id;

    // Debug log
    useEffect(() => {
        console.log("Edit Track Debug:", {
            hasUser: !!user,
            userId: user?.id,
            trackArtistUserId: currentTrack?.artist?.user_id,
            userOwnsTrack,
            artistData: currentTrack?.artist,
        });
        console.log("Track Detail - Current track mood:", {
            trackId: currentTrack?.id,
            mood: currentTrack?.mood,
            moodType: typeof currentTrack?.mood,
            moodLength: currentTrack?.mood?.length
        });
    }, [user, currentTrack, userOwnsTrack]);

    const handleTrackUpdate = (updatedTrack: Track) => {
        setCurrentTrack(updatedTrack);
        
        // If custom_url changed, redirect to new URL
        if (updatedTrack.custom_url && updatedTrack.custom_url !== track.custom_url) {
            router.push(`/track/${updatedTrack.custom_url}`);
        }
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
                {/* Back to Music Button */}
                <div className="mb-6">
                    <Link href="/music">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Music
                        </Button>
                    </Link>
                </div>

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

                            <div className="flex flex-wrap items-center gap-4">
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 border-0">
                                    {currentTrack.genre?.name ||
                                        "Unknown Genre"}
                                </Badge>
                                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {currentTrack.duration
                                                ? `${Math.floor(currentTrack.duration / 60)}:${(currentTrack.duration % 60).toString().padStart(2, "0")}`
                                                : "Unknown"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Headphones className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {currentTrack.view_count
                                                ? currentTrack.view_count.toLocaleString()
                                                : "0"} views
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {getTrackLikeStatus(currentTrack.id).count || 0} likes
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Mood Tags Display */}
                            {currentTrack.mood && currentTrack.mood.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Mood & Vibe
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentTrack.mood.map((mood, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-700/50 backdrop-blur-sm hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300">
                                                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-sm group-hover:blur-md transition-all duration-300"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                {(() => {
                                    console.log("🔍 UI Debug - Artist tracks section:", {
                                        isLoadingArtistTracks,
                                        artistTracksLength: artistTracks.length,
                                        currentTrackId: currentTrack.id,
                                        artistTracks: artistTracks.map(t => ({ id: t.id, title: t.title })),
                                        filteredTracks: artistTracks
                                            .filter(track => track.id !== currentTrack.id)
                                            .map(t => ({ id: t.id, title: t.title }))
                                    });
                                    return null;
                                })()}
                                {!isLoadingArtistTracks &&
                                artistTracks.length > 0 ? (
                                    <TracksListLight
                                        tracks={artistTracks
                                            .filter(track => track.id !== currentTrack.id) // Exclude current track
                                            .slice(0, 10)
                                            .map((track) => ({
                                                id: track.id,
                                                title: track.title,
                                                custom_url: track.custom_url,
                                                artist: {
                                                    id: track.artist?.id || 0,
                                                    name: track.artist?.name || "Unknown Artist",
                                                    profile_image_url: track.artist?.profile_image_url,
                                                    custom_url: track.artist?.custom_url,
                                                },
                                                album: track.album ? {
                                                    id: track.album.id,
                                                    title: track.album.title,
                                                    cover_image_url: track.album.cover_image_url,
                                                    custom_url: track.album.custom_url,
                                                } : undefined,
                                                duration: track.duration,
                                                file_url: track.file_url,
                                                view_count: track.view_count,
                                            }))}
                                        className="max-h-96 overflow-y-auto"
                                    />
                                ) : isLoadingArtistTracks ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <span className="ml-2 text-gray-500">Loading artist tracks...</span>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            No other tracks by this artist
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Debug: {artistTracks.length} tracks found, loading: {isLoadingArtistTracks.toString()}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recommended Tracks Section */}
                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Recommended Songs
                    </h2>
                    {!isLoadingRecommended && recommendedTracks.length > 0 ? (
                        <TrackGrid
                            tracks={recommendedTracks.slice(0, 12)}
                            isLoading={isLoadingRecommended}
                            gridCols="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        />
                    ) : isLoadingRecommended ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2 text-gray-500">Loading recommendations...</span>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No recommendations available</p>
                        </div>
                    )}
                </section>

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
