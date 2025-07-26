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
    ChevronLeft,
    ChevronRight,
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
import { SearchSuggestions } from "@/components/music/SearchSuggestions";
import { AlbumGrid } from "@/components/music/album-grid";
import { ArtistGrid } from "@/components/music/artist-grid";
import { TrackGrid } from "@/components/music/track-grid";
import { MoodGrid } from "@/components/music/mood-grid";
import { MoodFilterModal } from "@/components/music/mood-filter-modal";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface FeaturedAlbum {
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

interface FeaturedArtist {
    id: number;
    name: string;
    profile_image_url: string | null;
    custom_url: string | null;
    tracksCount: number;
}

interface MusicExplorerUIProps {
    tracks: Track[];
    featuredTracks: Track[];
    featuredAlbums: FeaturedAlbum[];
    featuredArtists: FeaturedArtist[];
    libraryTracks: Track[];
    trendingTracks: Track[];
    uniqueAlbums: any[];
    uniqueArtists: any[];
    genres: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedGenre: string;
    setSelectedGenre: (genre: string) => void;
    selectedMoods: Set<string>;
    setSelectedMoods: (moods: Set<string>) => void;
    currentView: "featured" | "library" | "upload" | "albums" | "artists";
    setCurrentView: (
        view: "featured" | "library" | "upload" | "albums" | "artists",
    ) => void;
    isLoadingFeatured: boolean;
    onSearchKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isSearching?: boolean;
    onSearchTrigger?: () => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalPages: number;
    totalTracks: number;
    // Albums pagination
    allAlbums: FeaturedAlbum[];
    albumsCurrentPage: number;
    setAlbumsCurrentPage: (page: number) => void;
    albumsTotalPages: number;
    totalAlbums: number;
    isLoadingAlbums: boolean;
    // Artists pagination
    allArtists: FeaturedArtist[];
    artistsCurrentPage: number;
    setArtistsCurrentPage: (page: number) => void;
    artistsTotalPages: number;
    totalArtists: number;
    isLoadingArtists: boolean;
}

export function MusicExplorerUI({
    tracks,
    featuredTracks,
    featuredAlbums,
    featuredArtists,
    libraryTracks,
    trendingTracks,
    uniqueAlbums,
    uniqueArtists,
    genres,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedMoods,
    setSelectedMoods,
    currentView,
    setCurrentView,
    isLoadingFeatured,
    onSearchKeyPress,
    isSearching = false,
    onSearchTrigger,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    totalTracks,
    // Albums pagination
    allAlbums,
    albumsCurrentPage,
    setAlbumsCurrentPage,
    albumsTotalPages,
    totalAlbums,
    isLoadingAlbums,
    // Artists pagination
    allArtists,
    artistsCurrentPage,
    setArtistsCurrentPage,
    artistsTotalPages,
    totalArtists,
    isLoadingArtists,
}: MusicExplorerUIProps) {
    const {
        currentTrack,
        isPlaying,
        playTrack,
        setTrackList,
        togglePlayPause,
    } = useAudioPlayer();
    const { downloadTrack, isTrackDownloading } = useDownload();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMoodModal, setShowMoodModal] = useState(false);

    const handleMoodFilterApply = (moods: Set<string>) => {
        setSelectedMoods(moods);
        // Auto switch to library view when moods are applied
        if (moods.size > 0) {
            setCurrentView("library");
        }
    };

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
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                            <Input
                                placeholder="Search songs, artists, albums..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        setShowSuggestions(false);
                                    }
                                    onSearchKeyPress?.(e);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="pl-12 pr-12 h-14 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60 rounded-2xl"
                            />
                            {/* Clear button - show when there's text and not searching */}
                            {searchQuery && !isSearching && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setShowSuggestions(false);
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white transition-colors z-10"
                                    title="Clear search"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                            {/* Loading spinner */}
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                </div>
                            )}

                            {/* Search Suggestions Dropdown */}
                            <SearchSuggestions
                                query={searchQuery}
                                isVisible={showSuggestions}
                                onSuggestionClick={(suggestion) => {
                                    setSearchQuery(suggestion);
                                    setShowSuggestions(false);
                                    // Trigger search
                                    onSearchTrigger?.();
                                }}
                                onTrackPlay={(track) => {
                                    setTrackList([track]);
                                    playTrack(track);
                                    setShowSuggestions(false);
                                }}
                                onClose={() => setShowSuggestions(false)}
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
                                onClick={() => setCurrentView("albums")}
                                className={`${currentView === "albums" ? "bg-white text-purple-600 hover:bg-red-500 hover:text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Album className="mr-2 h-5 w-5" />
                                All Albums
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("artists")}
                                className={`${currentView === "artists" ? "bg-white text-purple-600 hover:bg-red-500 hover:text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Users className="mr-2 h-5 w-5" />
                                All Artists
                            </Button>
                            {/* Removed Upload Music button as requested */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Genre Filter */}
                            <select
                                value={selectedGenre}
                                onChange={(e) => {
                                    setSelectedGenre(e.target.value);
                                    // Tự động chuyển sang view library khi chọn genre
                                    if (e.target.value !== "all") {
                                        setCurrentView("library");
                                    }
                                }}
                                className="px-4 py-2 rounded-full border bg-white dark:bg-gray-800 text-sm font-medium"
                            >
                                <option value="all">All Genres</option>
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>

                            {/* Moods Filter Button */}
                            <Button
                                variant="outline"
                                onClick={() => setShowMoodModal(true)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    selectedMoods.size > 0
                                        ? "bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                        : ""
                                }`}
                            >
                                <Music className="mr-2 h-4 w-4" />
                                Moods
                                {selectedMoods.size > 0 && (
                                    <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {selectedMoods.size}
                                    </span>
                                )}
                            </Button>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {currentView === "featured"
                                ? `${featuredTracks.length} featured tracks`
                                : currentView === "library"
                                  ? `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalTracks)}-${Math.min(currentPage * itemsPerPage, totalTracks)} of ${totalTracks} tracks${searchQuery ? ` for "${searchQuery}"` : ""}`
                                  : currentView === "albums"
                                    ? `Showing ${Math.min((albumsCurrentPage - 1) * itemsPerPage + 1, totalAlbums)}-${Math.min(albumsCurrentPage * itemsPerPage, totalAlbums)} of ${totalAlbums} albums`
                                    : currentView === "artists"
                                      ? `Showing ${Math.min((artistsCurrentPage - 1) * itemsPerPage + 1, totalArtists)}-${Math.min(artistsCurrentPage * itemsPerPage, totalArtists)} of ${totalArtists} artists`
                                      : `${libraryTracks.length} tracks found${searchQuery ? ` for "${searchQuery}"` : ""}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 pb-32 space-y-8 sm:space-y-16 pt-8 sm:pt-12">
                {currentView === "featured" && (
                    <div className="space-y-16">
                        {/* Featured Tracks */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Featured Tracks
                                    </span>
                                </h2>
                                <Button
                                    onClick={() => {
                                        if (featuredTracks.length > 0) {
                                            // Shuffle the featured tracks array
                                            const shuffledTracks = [
                                                ...featuredTracks,
                                            ].sort(() => Math.random() - 0.5);
                                            setTrackList(shuffledTracks);
                                            playTrack(shuffledTracks[0]);
                                        }
                                    }}
                                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Shuffle className="h-4 w-4" />
                                    Shuffle Play
                                </Button>
                            </div>

                            <TrackGrid
                                tracks={featuredTracks}
                                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                            />

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

                        {/* Albums Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Music className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Albums
                                    </span>
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentView("albums")}
                                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium dark:hover:bg-white/10"
                                >
                                    View All →
                                </Button>
                            </div>

                            <AlbumGrid albums={featuredAlbums} />
                        </section>

                        {/* Artists Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                        Artists
                                    </span>
                                </h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentView("artists")}
                                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium dark:hover:bg-white/10"
                                >
                                    View All →
                                </Button>
                            </div>

                            <ArtistGrid artists={featuredArtists} />
                        </section>
                    </div>
                )}

                {currentView === "library" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Headphones className="h-5 w-5 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Music Library
                                </span>
                            </h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        if (libraryTracks.length > 0) {
                                            // Shuffle the library tracks array
                                            const shuffledTracks = [
                                                ...libraryTracks,
                                            ].sort(() => Math.random() - 0.5);
                                            setTrackList(shuffledTracks);
                                            playTrack(shuffledTracks[0]);
                                        }
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Shuffle className="mr-2 h-4 w-4" />
                                    Shuffle Page
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (libraryTracks.length > 0) {
                                            setTrackList([libraryTracks[0]]);
                                            playTrack(libraryTracks[0]);
                                        }
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Play Page
                                </Button>
                            </div>
                        </div>

                        {/* Grid view for library */}
                        {libraryTracks.length === 0 && !isSearching ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Music className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {searchQuery
                                        ? "No tracks found"
                                        : "No tracks available"}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
                                    {searchQuery
                                        ? `We couldn't find any tracks matching "${searchQuery}"${selectedGenre !== "all" ? ` in ${selectedGenre} genre` : ""}.`
                                        : selectedGenre !== "all"
                                          ? `No tracks available in ${selectedGenre} genre.`
                                          : "No tracks are available in the library at the moment."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {searchQuery && (
                                        <Button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedGenre("all");
                                            }}
                                            variant="outline"
                                            className="px-6 py-3 rounded-2xl"
                                        >
                                            Clear Search & Filters
                                        </Button>
                                    )}
                                    {selectedGenre !== "all" &&
                                        !searchQuery && (
                                            <Button
                                                onClick={() =>
                                                    setSelectedGenre("all")
                                                }
                                                variant="outline"
                                                className="px-6 py-3 rounded-2xl"
                                            >
                                                Show All Genres
                                            </Button>
                                        )}
                                    <Button
                                        onClick={() =>
                                            setCurrentView("featured")
                                        }
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl"
                                    >
                                        Explore Featured
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <TrackGrid
                                key={`library-${currentPage}`}
                                tracks={libraryTracks}
                            />
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <Button
                                    variant="ghost_bg"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.max(1, currentPage - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 h-10"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {/* First page */}
                                    {currentPage > 3 && (
                                        <>
                                            <Button
                                                variant={
                                                    1 === currentPage
                                                        ? "default"
                                                        : "ghost_bg"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(1)
                                                }
                                                className="w-10 h-10 "
                                            >
                                                1
                                            </Button>
                                            {currentPage > 4 && (
                                                <span className="text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {/* Page numbers around current page */}
                                    {Array.from(
                                        { length: Math.min(5, totalPages) },
                                        (_, i) => {
                                            const pageNumber =
                                                Math.max(
                                                    1,
                                                    Math.min(
                                                        totalPages - 4,
                                                        currentPage - 2,
                                                    ),
                                                ) + i;
                                            if (pageNumber > totalPages)
                                                return null;

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={
                                                        pageNumber ===
                                                        currentPage
                                                            ? "default"
                                                            : "ghost_bg"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            pageNumber,
                                                        )
                                                    }
                                                    className="w-10 h-10"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        },
                                    )}

                                    {/* Last page */}
                                    {currentPage < totalPages - 2 && (
                                        <>
                                            {currentPage < totalPages - 3 && (
                                                <span className="text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                            <Button
                                                variant={
                                                    totalPages === currentPage
                                                        ? "default"
                                                        : "ghost_bg"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(totalPages)
                                                }
                                                className="w-10 h-10"
                                            >
                                                {totalPages}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <Button
                                    variant="ghost_bg"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(
                                                totalPages,
                                                currentPage + 1,
                                            ),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 h-10"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                {currentView === "albums" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Album className="h-5 w-5 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    All Albums
                                </span>
                            </h2>
                        </div>

                        {/* Grid view for albums */}
                        {isLoadingAlbums ? (
                            <AlbumGrid
                                albums={[]}
                                isLoading={true}
                                loadingCount={6}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8"
                            />
                        ) : allAlbums.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Album className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {searchQuery
                                        ? "No albums found"
                                        : "No albums available"}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
                                    {searchQuery
                                        ? `We couldn't find any albums matching "${searchQuery}"${selectedGenre !== "all" ? ` in ${selectedGenre} genre` : ""}.`
                                        : selectedGenre !== "all"
                                          ? `No albums available in ${selectedGenre} genre.`
                                          : "No albums are available in the library at the moment."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {searchQuery && (
                                        <Button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedGenre("all");
                                            }}
                                            variant="outline"
                                            className="px-6 py-3 rounded-2xl"
                                        >
                                            Clear Search & Filters
                                        </Button>
                                    )}
                                    {selectedGenre !== "all" &&
                                        !searchQuery && (
                                            <Button
                                                onClick={() =>
                                                    setSelectedGenre("all")
                                                }
                                                variant="outline"
                                                className="px-6 py-3 rounded-2xl"
                                            >
                                                Show All Genres
                                            </Button>
                                        )}
                                    <Button
                                        onClick={() =>
                                            setCurrentView("featured")
                                        }
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl"
                                    >
                                        Explore Featured
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <AlbumGrid
                                key={`albums-${allAlbums.length}-${searchQuery}-${albumsCurrentPage}`}
                                albums={allAlbums}
                            />
                        )}

                        {/* Pagination Controls for Albums */}
                        {albumsTotalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setAlbumsCurrentPage(
                                            Math.max(1, albumsCurrentPage - 1),
                                        )
                                    }
                                    disabled={albumsCurrentPage === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {/* First page */}
                                    {albumsCurrentPage > 3 && (
                                        <>
                                            <Button
                                                variant={
                                                    1 === albumsCurrentPage
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setAlbumsCurrentPage(1)
                                                }
                                                className="w-10 h-10"
                                            >
                                                1
                                            </Button>
                                            {albumsCurrentPage > 4 && (
                                                <span className="text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {/* Page numbers around current page */}
                                    {Array.from(
                                        {
                                            length: Math.min(
                                                5,
                                                albumsTotalPages,
                                            ),
                                        },
                                        (_, i) => {
                                            const pageNumber =
                                                Math.max(
                                                    1,
                                                    Math.min(
                                                        albumsTotalPages - 4,
                                                        albumsCurrentPage - 2,
                                                    ),
                                                ) + i;
                                            if (pageNumber > albumsTotalPages)
                                                return null;

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={
                                                        pageNumber ===
                                                        albumsCurrentPage
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setAlbumsCurrentPage(
                                                            pageNumber,
                                                        )
                                                    }
                                                    className="w-10 h-10"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        },
                                    )}

                                    {/* Last page */}
                                    {albumsCurrentPage <
                                        albumsTotalPages - 2 && (
                                        <>
                                            {albumsCurrentPage <
                                                albumsTotalPages - 3 && (
                                                <span className="text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                            <Button
                                                variant={
                                                    albumsTotalPages ===
                                                    albumsCurrentPage
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setAlbumsCurrentPage(
                                                        albumsTotalPages,
                                                    )
                                                }
                                                className="w-10 h-10"
                                            >
                                                {albumsTotalPages}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setAlbumsCurrentPage(
                                            Math.min(
                                                albumsTotalPages,
                                                albumsCurrentPage + 1,
                                            ),
                                        )
                                    }
                                    disabled={
                                        albumsCurrentPage === albumsTotalPages
                                    }
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                {currentView === "artists" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    All Artists
                                </span>
                            </h2>
                        </div>

                        {/* Grid view for artists */}
                        {isLoadingArtists ? (
                            <ArtistGrid
                                artists={[]}
                                isLoading={true}
                                loadingCount={6}
                            />
                        ) : allArtists.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {searchQuery
                                        ? "No artists found"
                                        : "No artists available"}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
                                    {searchQuery
                                        ? `We couldn't find any artists matching "${searchQuery}"${selectedGenre !== "all" ? ` in ${selectedGenre} genre` : ""}.`
                                        : selectedGenre !== "all"
                                          ? `No artists available in ${selectedGenre} genre.`
                                          : "No artists are available in the library at the moment."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {searchQuery && (
                                        <Button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedGenre("all");
                                            }}
                                            variant="outline"
                                            className="px-6 py-3 rounded-2xl"
                                        >
                                            Clear Search & Filters
                                        </Button>
                                    )}
                                    {selectedGenre !== "all" &&
                                        !searchQuery && (
                                            <Button
                                                onClick={() =>
                                                    setSelectedGenre("all")
                                                }
                                                variant="outline"
                                                className="px-6 py-3 rounded-2xl"
                                            >
                                                Show All Genres
                                            </Button>
                                        )}
                                    <Button
                                        onClick={() =>
                                            setCurrentView("featured")
                                        }
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl"
                                    >
                                        Explore Featured
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <ArtistGrid
                                key={`artists-${allArtists.length}-${searchQuery}-${artistsCurrentPage}`}
                                artists={allArtists}
                            />
                        )}

                        {/* Pagination Controls for Artists */}
                        {artistsTotalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setArtistsCurrentPage(
                                            Math.max(1, artistsCurrentPage - 1),
                                        )
                                    }
                                    disabled={artistsCurrentPage === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {/* First page */}
                                    {artistsCurrentPage > 3 && (
                                        <>
                                            <Button
                                                variant={
                                                    1 === artistsCurrentPage
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setArtistsCurrentPage(1)
                                                }
                                                className="w-10 h-10"
                                            >
                                                1
                                            </Button>
                                            {artistsCurrentPage > 4 && (
                                                <span className="text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                        </>
                                    )}

                                    {/* Page numbers around current page */}
                                    {Array.from(
                                        {
                                            length: Math.min(
                                                5,
                                                artistsTotalPages,
                                            ),
                                        },
                                        (_, i) => {
                                            const pageNumber =
                                                Math.max(
                                                    1,
                                                    Math.min(
                                                        artistsTotalPages - 4,
                                                        artistsCurrentPage - 2,
                                                    ),
                                                ) + i;
                                            if (pageNumber > artistsTotalPages)
                                                return null;

                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={
                                                        pageNumber ===
                                                        artistsCurrentPage
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setArtistsCurrentPage(
                                                            pageNumber,
                                                        )
                                                    }
                                                    className="w-10 h-10"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            );
                                        },
                                    )}

                                    {/* Last page */}
                                    {artistsCurrentPage <
                                        artistsTotalPages - 2 && (
                                        <>
                                            {artistsCurrentPage <
                                                artistsTotalPages - 3 && (
                                                <span className="text-gray-500">
                                                    ...
                                                </span>
                                            )}
                                            <Button
                                                variant={
                                                    artistsTotalPages ===
                                                    artistsCurrentPage
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setArtistsCurrentPage(
                                                        artistsTotalPages,
                                                    )
                                                }
                                                className="w-10 h-10"
                                            >
                                                {artistsTotalPages}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setArtistsCurrentPage(
                                            Math.min(
                                                artistsTotalPages,
                                                artistsCurrentPage + 1,
                                            ),
                                        )
                                    }
                                    disabled={
                                        artistsCurrentPage === artistsTotalPages
                                    }
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {currentView === "upload" && <UploadRedirect />}
            </div>

            {/* Mood Filter Modal */}
            <MoodFilterModal
                isOpen={showMoodModal}
                onClose={() => setShowMoodModal(false)}
                selectedMoods={selectedMoods}
                onApply={handleMoodFilterApply}
            />
        </div>
    );
}
