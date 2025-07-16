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
import { useRouter } from "next/navigation";
import AddToPlaylist from "@/components/playlist/add-to-playlist";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Component to handle upload page redirect
function UploadRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/upload");
    }, [router]);

    return (
        <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Redirecting to upload page...
            </p>
        </div>
    );
}

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
            (track.artist?.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (track.album?.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

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
                tracks
                    .filter((track) => track.album) // Filter out tracks without album
                    .map((track) => [
                        track.album!.id,
                        {
                            id: track.album!.id,
                            title: track.album!.title,
                            cover_image_url: track.album!.cover_image_url,
                            artist: track.artist,
                            tracksCount: tracks.filter(
                                (t) =>
                                    t.album && t.album.id === track.album!.id,
                            ).length,
                        },
                    ]),
            ).values(),
        );
    }, [tracks]);

    const uniqueArtists = useMemo(() => {
        return Array.from(
            new Map(
                tracks
                    .filter((track) => track.artist) // Filter out tracks without artist
                    .map((track) => [
                        track.artist!.id,
                        {
                            id: track.artist!.id,
                            name: track.artist!.name,
                            profile_image_url: track.artist!.profile_image_url,
                            custom_url: track.artist!.custom_url,
                            tracksCount: tracks.filter(
                                (t) =>
                                    t.artist &&
                                    t.artist.id === track.artist!.id,
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
                            • Connect with artist
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
                            <Link href="/upload">
                                <Button size="lg">
                                    <Upload className="mr-2 h-5 w-5" />
                                    Upload Music
                                </Button>
                            </Link>
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
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Music className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Albums
                                    </span>
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentView("library")}
                                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                >
                                    View All →
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {Array.from(
                                    new Set(
                                        filteredTracks
                                            .filter((track) => track.album)
                                            .map((track) => track.album!.id),
                                    ),
                                )
                                    .slice(0, 10)
                                    .map((albumId) => {
                                        const track = filteredTracks.find(
                                            (t) =>
                                                t.album &&
                                                t.album.id === albumId,
                                        );
                                        if (!track || !track.album) return null;

                                        return (
                                            <div key={track.album.id} className="group text-center">
                                                <div className="relative aspect-square mb-3">
                                                    <Link
                                                        href={`/album/${track.album.id}`}
                                                        prefetch={false}
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
                                                                className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center w-full h-full rounded-lg">
                                                                <Music className="h-12 w-12 text-white" />
                                                            </div>
                                                        )}
                                                    </Link>

                                                    {/* Play Album Button Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                                                        <Button
                                                            size="lg"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const albumTracks = filteredTracks.filter(t => t.album?.id === track.album.id);
                                                                if (albumTracks.length > 0) {
                                                                    setTrackList(albumTracks);
                                                                    playTrack(albumTracks[0]);
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm"
                                                        >
                                                            <Play className="h-6 w-6" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Link
                                                        href={`/album/${track.album.id}`}
                                                        prefetch={false}
                                                        className="block"
                                                    >
                                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                                            {track.album.title}
                                                        </h3>
                                                    </Link>
                                                    <Link
                                                        href={`/artist/${track.artist?.custom_url || track.artist?.id}`}
                                                        prefetch={false}
                                                        className="block"
                                                    >
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                                                            {track.artist?.name}
                                                        </p>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>

                        {/* Artists Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                        Artists
                                    </span>
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentView("library")}
                                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                >
                                    View All →
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {uniqueArtists.slice(0, 10).map((artist) => {
                                    return (
                                        <div
                                            key={artist.id}
                                            className="group cursor-pointer text-center"
                                        >
                                            <div className="aspect-square mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                                                {artist.profile_image_url ? (
                                                    <Image
                                                        src={artist.profile_image_url}
                                                        alt={artist.name}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Users className="h-12 w-12 text-white" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Link
                                                    href={`/artist/${artist.custom_url || artist.id}`}
                                                    className="block"
                                                >
                                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                                        {artist.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {artist.tracksCount} songs
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Featured Tracks */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <TrendingUp className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Featured Tracks
                                    </span>
                                </h2>
                                <Button variant="outline" className="hidden sm:flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                    <Shuffle className="h-4 w-4" />
                                    Shuffle
                                </Button>
                            </div>

                            {/* Featured track grid with new design */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                                {featuredTracks.slice(0, 8).map((track, index) => (
                                    <div
                                        key={track.id}
                                        className="group relative"
                                        style={{
                                            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
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
                                                        onClick={() => {
                                                            if (currentTrack?.id === track.id && isPlaying) {
                                                                togglePlayPause();
                                                            } else {
                                                                setTrackList(featuredTracks);
                                                                playTrack(track);
                                                            }
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full bg-white/95 text-purple-600 hover:bg-white hover:scale-125 shadow-2xl w-16 h-16 backdrop-blur-sm"
                                                    >
                                                        {currentTrack?.id === track.id && isPlaying ? (
                                                            <Pause className="h-8 w-8" />
                                                        ) : (
                                                            <Play className="h-8 w-8 ml-1" />
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
                                                <div className="absolute top-4 left-4">
                                                    <div className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                        {index + 1}
                                                    </div>
                                                </div>
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
                                                            {track.album?.title || "Unknown Album"}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <Badge 
                                                            variant="secondary" 
                                                            className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border-0"
                                                        >
                                                            {track.genre?.name || "Unknown"}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="font-mono">{formatDuration(track.duration)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                    <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                                                        <Button size="sm" variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900/30">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </AddToPlaylist>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => downloadTrack(track)}
                                                        className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900/30">
                                                        <Heart className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900/30">
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

                            {/* View all button */}
                            <div className="mt-12 text-center">
                                <Button 
                                    onClick={() => setCurrentView("library")}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Explore All Tracks
                                    <TrendingUp className="ml-2 h-5 w-5" />
                                </Button>
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
                                        {track.album?.cover_image_url ? (
                                            <Image
                                                src={
                                                    track.album.cover_image_url
                                                }
                                                alt={
                                                    track.album?.title ||
                                                    track.title
                                                }
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
                                            {track.artist?.name ||
                                                "Unknown Artist"}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-500 truncate text-xs mb-3">
                                            {track.album?.title ||
                                                "Unknown Album"}
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
                                            <AddToPlaylist
                                                trackId={track.id}
                                                trackTitle={track.title}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="p-2"
                                                    title="Add to playlist"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </AddToPlaylist>
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

                {currentView === "upload" && <UploadRedirect />}
            </div>
        </div>
    );
}