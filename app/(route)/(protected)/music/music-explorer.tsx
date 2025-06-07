"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Music,
    Users,
    Album,
    TrendingUp,
    Play,
    Pause,
    Heart,
    Clock,
    Filter,
    Download,
    Plus,
    Headphones,
    Upload,
    Share,
    Shuffle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Track } from "@/lib/definitions/Track";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useDownload } from "@/hooks/use-download";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface MusicExplorerProps {
    initialTracks: Track[];
}

export function MusicExplorer({ initialTracks }: MusicExplorerProps) {
    const [tracks] = useState<Track[]>(initialTracks);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<string>("all");
    const [currentView, setCurrentView] = useState<
        "featured" | "library" | "upload"
    >("featured");
    const {
        currentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { downloadTrack, isTrackDownloading } = useDownload();
    const searchParams = useSearchParams();

    // Get unique genres from tracks
    const genres = Array.from(
        new Set(tracks.map((track) => track.genre?.name).filter(Boolean)),
    );

    // Filter tracks based on search and filters
    const filteredTracks = tracks.filter((track) => {
        const matchesSearch =
            !searchQuery ||
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            track.album.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre =
            selectedGenre === "all" || track.genre?.name === selectedGenre;

        return matchesSearch && matchesGenre;
    });

    // Get featured tracks (first 8)
    const featuredTracks = filteredTracks.slice(0, 8);

    // Memoize unique albums and artists to prevent re-renders
    const uniqueAlbums = useMemo(() => {
        return Array.from(
            new Map(
                tracks.map((track) => [
                    track.album.id,
                    {
                        id: track.album.id,
                        title: track.album.title,
                        cover_image_url: track.album.cover_image_url,
                        artist: track.artist,
                        tracksCount: tracks.filter(
                            (t) => t.album.id === track.album.id,
                        ).length,
                    },
                ]),
            ).values(),
        );
    }, [tracks]);

    const uniqueArtists = useMemo(() => {
        return Array.from(
            new Map(
                tracks.map((track) => [
                    track.artist.id,
                    {
                        id: track.artist.id,
                        name: track.artist.name,
                        profile_image_url: track.artist.profile_image_url,
                        tracksCount: tracks.filter(
                            (t) => t.artist.id === track.artist.id,
                        ).length,
                    },
                ]),
            ).values(),
        );
    }, [tracks]);

    // Get trending tracks (memoized stable random selection)
    const trendingTracks = useMemo(() => {
        // Create a stable random order based on track IDs
        const shuffled = [...filteredTracks].sort((a, b) => {
            // Use track IDs to create a stable sort
            const seedA = a.id * 9301 + 49297;
            const seedB = b.id * 9301 + 49297;
            return (seedA % 233280) - (seedB % 233280);
        });
        return shuffled.slice(0, 12);
    }, [filteredTracks]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            console.log("Files selected:", files);
            alert("Upload functionality will be implemented soon!");
        }
    };

    useEffect(() => {
        // Check for the 'tab' parameter in the URL
        const tab = searchParams.get("tab");
        if (tab === "upload") {
            setCurrentView("upload");
            // Clear the URL parameter after setting the state
            window.history.replaceState({}, "", "/music");
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative container mx-auto px-6 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <p className="text-xl md:text-2xl mb-8 text-purple-100">
                            Stream unlimited music for free • Upload your tracks
                            • Connect with artists
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto mb-8">
                            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400 z-10" />
                            <Input
                                placeholder="Search songs, artists, albums..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("featured")}
                                className={`${currentView === "featured" ? "bg-white text-purple-600 hover:bg-red-500 hover:text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Music className="mr-2 h-5 w-5" />
                                Explore Music
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("library")}
                                className={`${currentView === "library" ? "bg-white text-purple-600 hover:bg-red-500 hover:text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Headphones className="mr-2 h-5 w-5" />
                                Full Library
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("upload")}
                                className={`${currentView === "upload" ? "bg-white text-purple-600 hover:bg-red-500 hover:text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Music
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span className="font-medium">Filters:</span>
                            </div>

                            {/* Genre Filter */}
                            <select
                                value={selectedGenre}
                                onChange={(e) =>
                                    setSelectedGenre(e.target.value)
                                }
                                className="px-4 py-2 rounded-full border bg-white dark:bg-gray-800 text-sm font-medium"
                            >
                                <option value="all">All Genres</option>
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredTracks.length} tracks found
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 pb-32 space-y-8 sm:space-y-16 pt-8 sm:pt-12">
                {currentView === "featured" && (
                    <div className="space-y-16">
                        {/* Albums Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <Music className="h-5 w-5 text-white" />
                                    </div>
                                    Albums
                                </h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentView("library")}
                                >
                                    View All
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {Array.from(
                                    new Set(
                                        filteredTracks.map(
                                            (track) => track.album.id,
                                        ),
                                    ),
                                )
                                    .slice(0, 25)
                                    .map((albumId) => {
                                        const track = filteredTracks.find(
                                            (t) => t.album.id === albumId,
                                        );
                                        if (!track) return null;

                                        return (
                                            <Card
                                                key={track.album.id}
                                                className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                                            >
                                                <div className="relative aspect-square">
                                                    <Link
                                                        href={`/album/${track.album.id}`}
                                                    >
                                                        {track.album
                                                            .cover_image_url ? (
                                                            <Image
                                                                src={
                                                                    track.album
                                                                        .cover_image_url
                                                                }
                                                                alt={
                                                                    track.album
                                                                        .title
                                                                }
                                                                fill
                                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                                <Music className="h-12 w-12 text-white" />
                                                            </div>
                                                        )}
                                                    </Link>

                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <Button
                                                            size="lg"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Check if this track is currently playing
                                                                if (
                                                                    currentTrack?.id ===
                                                                        track.id &&
                                                                    isPlaying
                                                                ) {
                                                                    // If playing, pause it
                                                                    togglePlayPause();
                                                                } else {
                                                                    // If not playing or different track, play it
                                                                    const albumTracks =
                                                                        filteredTracks.filter(
                                                                            (
                                                                                t,
                                                                            ) =>
                                                                                t
                                                                                    .album
                                                                                    .id ===
                                                                                track
                                                                                    .album
                                                                                    .id,
                                                                        );
                                                                    if (
                                                                        albumTracks.length >
                                                                        0
                                                                    ) {
                                                                        setTrackList(
                                                                            albumTracks,
                                                                        );
                                                                        setTimeout(
                                                                            () => {
                                                                                playTrack(
                                                                                    track,
                                                                                );
                                                                            },
                                                                            50,
                                                                        );
                                                                    } else {
                                                                        playTrack(
                                                                            track,
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-white text-purple-600 hover:bg-white/90 pointer-events-auto"
                                                        >
                                                            <Play className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardContent className="p-3">
                                                    <Link
                                                        href={`/album/${track.album.id}`}
                                                    >
                                                        <h3 className="font-semibold text-sm mb-1 truncate hover:underline cursor-pointer">
                                                            {track.album.title}
                                                        </h3>
                                                    </Link>
                                                    <Link
                                                        href={`/artist/${track.artist.id}`}
                                                    >
                                                        <p className="text-gray-600 dark:text-gray-400 truncate text-xs hover:underline cursor-pointer">
                                                            {track.artist.name}
                                                        </p>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </div>
                        </section>

                        {/* Artists Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    Artists
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {Array.from(
                                    new Set(
                                        filteredTracks.map(
                                            (track) => track.artist.id,
                                        ),
                                    ),
                                )
                                    .slice(0, 25)
                                    .map((artistId) => {
                                        const track = filteredTracks.find(
                                            (t) => t.artist.id === artistId,
                                        );
                                        const artistTracks = tracks.filter(
                                            (t) => t.artist.id === artistId,
                                        );
                                        if (!track) return null;

                                        return (
                                            <div
                                                key={track.artist.id}
                                                className="group cursor-pointer text-center"
                                            >
                                                <div className="aspect-square mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                                                    {track.artist
                                                        .profile_image_url ? (
                                                        <Image
                                                            src={
                                                                track.artist
                                                                    .profile_image_url
                                                            }
                                                            alt={
                                                                track.artist
                                                                    .name
                                                            }
                                                            fill
                                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="h-12 w-12 text-white" />
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/artist/${track.artist.id}`}
                                                >
                                                    <h3 className="font-semibold text-sm mb-1 truncate text-gray-900 dark:text-white hover:underline cursor-pointer">
                                                        {track.artist.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                    {artistTracks.length} songs
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>

                        {/* Featured Tracks */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    Featured Tracks
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                                {featuredTracks.slice(0, 10).map((track) => (
                                    <Card
                                        key={track.id}
                                        className="group hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                                    >
                                        <div className="relative aspect-square">
                                            {track.album.cover_image_url ? (
                                                <Image
                                                    src={
                                                        track.album
                                                            .cover_image_url
                                                    }
                                                    alt={track.album.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                    <Music className="h-16 w-16 text-white" />
                                                </div>
                                            )}

                                            {/* Play overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Button
                                                    size="lg"
                                                    onClick={() => {
                                                        if (
                                                            currentTrack?.id ===
                                                                track.id &&
                                                            isPlaying
                                                        ) {
                                                            togglePlayPause();
                                                        } else {
                                                            playTrack(track);
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full bg-white text-purple-600 hover:bg-white/90 transform group-hover:scale-110"
                                                >
                                                    {currentTrack?.id ===
                                                        track.id &&
                                                    isPlaying ? (
                                                        <Pause className="h-6 w-6" />
                                                    ) : (
                                                        <Play className="h-6 w-6" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Currently playing indicator */}
                                            {currentTrack?.id === track.id &&
                                                isPlaying && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                                                            <div className="flex items-end space-x-0.5 h-4">
                                                                <div
                                                                    className="w-0.5 bg-white animate-equalize-1"
                                                                    style={{
                                                                        height: "30%",
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className="w-0.5 bg-white animate-equalize-2"
                                                                    style={{
                                                                        height: "100%",
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className="w-0.5 bg-white animate-equalize-3"
                                                                    style={{
                                                                        height: "60%",
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>

                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-lg mb-1 truncate">
                                                {track.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 truncate text-sm">
                                                {track.artist.name}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {track.genre?.name ||
                                                        "Unknown"}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {formatDuration(
                                                            track.duration,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {currentView === "library" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <Headphones className="h-5 w-5 text-white" />
                                </div>
                                Music Library
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <Shuffle className="mr-2 h-4 w-4" />
                                    Shuffle All
                                </Button>
                                <Button>
                                    <Play className="mr-2 h-4 w-4" />
                                    Play All
                                </Button>
                            </div>
                        </div>

                        {/* Grid view for library */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredTracks.map((track) => (
                                <Card
                                    key={track.id}
                                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                                >
                                    <div className="relative aspect-square">
                                        {track.album.cover_image_url ? (
                                            <Image
                                                src={
                                                    track.album.cover_image_url
                                                }
                                                alt={track.album.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center rounded-t-lg">
                                                <Music className="h-16 w-16 text-white" />
                                            </div>
                                        )}

                                        {/* Play button overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center rounded-t-lg">
                                            <Button
                                                size="lg"
                                                onClick={() => {
                                                    if (
                                                        currentTrack?.id ===
                                                            track.id &&
                                                        isPlaying
                                                    ) {
                                                        togglePlayPause();
                                                    } else {
                                                        playTrack(track);
                                                    }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-white text-purple-600 hover:bg-white/90"
                                            >
                                                {currentTrack?.id ===
                                                    track.id && isPlaying ? (
                                                    <Pause className="h-6 w-6" />
                                                ) : (
                                                    <Play className="h-6 w-6" />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Currently playing indicator */}
                                        {currentTrack?.id === track.id &&
                                            isPlaying && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                                                        <div className="flex items-end space-x-0.5 h-4">
                                                            <div
                                                                className="w-0.5 bg-white animate-equalize-1"
                                                                style={{
                                                                    height: "30%",
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="w-0.5 bg-white animate-equalize-2"
                                                                style={{
                                                                    height: "100%",
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="w-0.5 bg-white animate-equalize-3"
                                                                style={{
                                                                    height: "60%",
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-base mb-1 truncate">
                                            {track.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 truncate text-sm mb-2">
                                            {track.artist.name}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-500 truncate text-xs mb-3">
                                            {track.album.title}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {track.genre?.name || "Unknown"}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatDuration(
                                                        track.duration,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="p-2"
                                                title="Add to playlist"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={`p-2 relative overflow-hidden ${isTrackDownloading(track.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                                                title="Download"
                                                onClick={() =>
                                                    downloadTrack(track)
                                                }
                                                disabled={isTrackDownloading(
                                                    track.id,
                                                )}
                                            >
                                                {isTrackDownloading(
                                                    track.id,
                                                ) ? (
                                                    <>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 animate-pulse"></div>
                                                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 animate-loading-bar"></div>
                                                        <Download className="h-4 w-4 text-blue-600 animate-bounce" />
                                                    </>
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="p-2"
                                                title="Like"
                                            >
                                                <Heart className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {currentView === "upload" && (
                    <div className="max-w-4xl mx-auto space-y-8 pt-12">
                        <div className="text-center">
                            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-white" />
                                </div>
                                Upload Your Music
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Share your creativity with the world. Upload
                                your tracks and reach new audiences.
                            </p>
                        </div>

                        <Card className="p-8 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                            <div className="text-center space-y-6">
                                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-12 hover:border-purple-400 transition-colors bg-purple-50/50 dark:bg-purple-900/20">
                                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Upload className="h-10 w-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        Drag & Drop Your Music Files
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Support for MP3, WAV, FLAC, and more
                                    </p>
                                    <Button
                                        onClick={handleUploadClick}
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        <Plus className="mr-2 h-5 w-5" />
                                        Choose Files
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-6 mt-8">
                                    <div className="text-center p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Music className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            High Quality
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Upload in lossless quality for the
                                            best listening experience
                                        </p>
                                    </div>
                                    <div className="text-center p-6 rounded-xl bg-green-50 dark:bg-green-900/20">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Share className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            Easy Sharing
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Share your music instantly with
                                            built-in social features
                                        </p>
                                    </div>
                                    <div className="text-center p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <TrendingUp className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            Analytics
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Track plays, likes, and audience
                                            engagement
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
