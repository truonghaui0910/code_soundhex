"use client";

import { useState, memo, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music, Play, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { toast } from "sonner";

interface Album {
    id: number;
    title: string;
    cover_image_url: string | null;
    custom_url: string | null;
    artist: {
        id: number;
        name: string;
        custom_url: string | null;
    };
}

interface AlbumGridProps {
    albums: Album[];
    isLoading?: boolean;
    loadingCount?: number;
    onAlbumPlay?: (album: Album) => void;
    className?: string;
}

const AlbumGrid = memo(function AlbumGrid({
    albums,
    isLoading = false,
    loadingCount = 12,
    onAlbumPlay,
    className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6",
}: AlbumGridProps) {
    const { setTrackList, playTrack } = useAudioPlayer();
    const { getAlbumLikeStatus, fetchBatchAlbumLikesStatus, toggleAlbumLike } =
        useLikesFollows();
    const [loadingAlbums, setLoadingAlbums] = useState<Set<number>>(new Set());

    // Batch fetch album like status for all albums when component mounts
    useEffect(() => {
        if (!isLoading && albums.length > 0) {
            const albumIds = albums.map((album) => album.id);
            // Only fetch for albums that haven't been fetched yet
            const unfetchedAlbumIds = albumIds.filter((id) => {
                const status = getAlbumLikeStatus(id);
                return status.isLiked === undefined && !status.isLoading;
            });

            if (unfetchedAlbumIds.length > 0) {
                fetchBatchAlbumLikesStatus(unfetchedAlbumIds);
            }
        }
    }, [albums, isLoading, fetchBatchAlbumLikesStatus, getAlbumLikeStatus]);

    // Fetch album like status when albums change
    useEffect(() => {
        if (albums.length > 0) {
            const albumIds = albums.map(album => album.id);
            console.log("AlbumGrid - Fetching likes for albums:", albumIds);
            fetchBatchAlbumLikesStatus(albumIds);
        }
    }, [albums.length > 0 ? albums.map(a => a.id).join(',') : '', fetchBatchAlbumLikesStatus]);

    const handleAlbumPlay = useCallback(
        async (album: Album) => {
            console.log(
                `🎵 AlbumGrid - Playing album: "${album.title}" (ID: ${album.id})`,
            );

            if (onAlbumPlay) {
                console.log("🎵 AlbumGrid - Using custom onAlbumPlay callback");
                onAlbumPlay(album);
                return;
            }

            // Set loading state for this album
            setLoadingAlbums((prev) => new Set(prev).add(album.id));

            try {
                console.log(
                    `🎵 AlbumGrid - Fetching tracks for album ${album.id}...`,
                );
                const response = await fetch(`/api/albums/${album.id}/tracks`);
                console.log(
                    `🎵 AlbumGrid - API response status: ${response.status}`,
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(
                        `🎵 AlbumGrid - API Error ${response.status}:`,
                        errorText,
                    );
                    toast.error(
                        `Failed to load album: ${response.status} error`,
                    );
                    return;
                }

                const data = await response.json();
                console.log(`🎵 AlbumGrid - API response data:`, {
                    dataType: typeof data,
                    isArray: Array.isArray(data),
                    length: Array.isArray(data) ? data.length : "N/A",
                    hasTracksProperty: "tracks" in data,
                    firstItem: Array.isArray(data)
                        ? data[0]
                        : data.tracks?.[0] || "No tracks",
                });

                // Handle both formats: { tracks: [...] } and direct array [...]
                const tracksArray = Array.isArray(data)
                    ? data
                    : data.tracks || [];

                if (!Array.isArray(tracksArray)) {
                    console.error(
                        "🎵 AlbumGrid - Invalid tracks data format:",
                        tracksArray,
                    );
                    toast.error("Invalid album data format");
                    return;
                }

                if (tracksArray.length === 0) {
                    console.warn(
                        `🎵 AlbumGrid - Album "${album.title}" has no tracks`,
                    );
                    toast.error("This album has no tracks to play");
                    return;
                }

                // Validate first track has required properties
                const firstTrack = tracksArray[0];
                if (!firstTrack || !firstTrack.id || !firstTrack.file_url) {
                    console.error(
                        "🎵 AlbumGrid - First track is invalid:",
                        firstTrack,
                    );
                    toast.error("Album tracks are missing required data");
                    return;
                }

                console.log(
                    `🎵 AlbumGrid - Setting trackList with ${tracksArray.length} tracks`,
                );
                console.log(`🎵 AlbumGrid - First track:`, {
                    id: firstTrack.id,
                    title: firstTrack.title,
                    hasFileUrl: !!firstTrack.file_url,
                    hasArtist: !!firstTrack.artist,
                    hasAlbum: !!firstTrack.album,
                });

                setTrackList(tracksArray);

                // Add small delay to ensure setTrackList completes
                setTimeout(() => {
                    console.log(
                        `🎵 AlbumGrid - Playing first track: "${firstTrack.title}"`,
                    );
                    playTrack(firstTrack);
                }, 50);
            } catch (error) {
                console.error(
                    "🎵 AlbumGrid - Error loading album tracks:",
                    error,
                );
                toast.error(
                    `Failed to load album: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
            } finally {
                // Remove loading state
                setLoadingAlbums((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(album.id);
                    return newSet;
                });
            }
        },
        [onAlbumPlay, setTrackList, playTrack],
    );

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: loadingCount }).map((_, index) => (
                    <div
                        key={index}
                        className="group text-center animate-pulse"
                    >
                        <div className="aspect-square mb-3 bg-white/20 dark:bg-white/20 rounded-lg"></div>
                        <div className="space-y-1">
                            <div className="h-4 bg-white/20 dark:bg-white/20 rounded mx-auto"></div>
                            <div className="h-3 bg-white/20 dark:bg-white/20 rounded w-2/3 mx-auto"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={className}>
            {albums.map((album) => (
                <div key={album.id} className="group text-center">
                    <div className="relative aspect-square mb-3">
                        <Link
                            href={`/album/${album.custom_url || album.id}`}
                            prefetch={false}
                        >
                            {album.cover_image_url ? (
                                <Image
                                    src={album.cover_image_url}
                                    alt={album.title}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-300">
                                    <Music className="h-12 w-12 text-white" />
                                </div>
                            )}
                        </Link>

                        {/* Play Album Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                            {/* Heart Icon - Left */}
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleAlbumLike(album.id);
                                }}
                                disabled={
                                    getAlbumLikeStatus(album.id).isLoading
                                }
                                className={`opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm w-10 h-10 p-0 absolute left-3 ${
                                    getAlbumLikeStatus(album.id).isLiked
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-white/90 text-red-500 hover:bg-white hover:text-red-600"
                                }`}
                            >
                                <Heart
                                    className={`h-5 w-5 ${getAlbumLikeStatus(album.id).isLiked ? "fill-current" : ""}`}
                                />
                            </Button>

                            {/* Play Button - Center */}
                            <Button
                                size="lg"
                                onClick={(e) => {
                                    console.log(
                                        `🎵 AlbumGrid - Play button clicked for album: "${album.title}" (ID: ${album.id})`,
                                    );
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAlbumPlay(album);
                                }}
                                disabled={loadingAlbums.has(album.id)}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:scale-100"
                            >
                                {loadingAlbums.has(album.id) ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Play className="h-6 w-6" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Link
                            href={`/album/${album.custom_url || album.id}`}
                            prefetch={false}
                            className="block"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                {album.title}
                            </h3>
                        </Link>
                        <Link
                            href={`/artist/${album.artist?.custom_url || album.artist?.id}`}
                            prefetch={false}
                            className="block"
                        >
                            <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                                {album.artist?.name}
                            </p>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
});

AlbumGrid.displayName = "AlbumGrid";

export { AlbumGrid };