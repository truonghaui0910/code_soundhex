
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";

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

export function AlbumGrid({ 
    albums, 
    isLoading = false, 
    loadingCount = 5, 
    onAlbumPlay,
    className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
}: AlbumGridProps) {
    const { setTrackList, playTrack } = useAudioPlayer();

    const handleAlbumPlay = async (album: Album) => {
        if (onAlbumPlay) {
            onAlbumPlay(album);
        } else {
            // Default play behavior - fetch album tracks
            try {
                const response = await fetch(`/api/albums/${album.id}/tracks`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
                        setTrackList(data.tracks);
                        playTrack(data.tracks[0]);
                    }
                }
            } catch (error) {
                console.error("Error loading album tracks:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: loadingCount }).map((_, index) => (
                    <div key={index} className="group text-center animate-pulse">
                        <div className="aspect-square mb-3 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="space-y-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
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
                                <div className="bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center w-full h-full rounded-lg">
                                    <Music className="h-12 w-12 text-white" />
                                </div>
                            )}
                        </Link>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                        {/* Play Album Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                            <Button
                                size="lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAlbumPlay(album);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm"
                            >
                                <Play className="h-6 w-6" />
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
}
