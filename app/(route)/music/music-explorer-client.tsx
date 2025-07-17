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
import { MusicExplorerUI } from "./music-explorer-ui";

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

interface MusicExplorerClientProps {
    initialTracks: Track[];
}

export function MusicExplorerClient({ initialTracks }: MusicExplorerClientProps) {
    const [tracks] = useState<Track[]>(initialTracks);
    const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
    const [featuredAlbums, setFeaturedAlbums] = useState<FeaturedAlbum[]>([]);
    const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<string>("all");
    const [currentView, setCurrentView] = useState<
        "featured" | "library" | "albums" | "artists"
    >("featured");
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    // Get unique genres from tracks
    const genres = Array.from(
        new Set(tracks.map((track) => track.genre?.name).filter(Boolean)),
    );

    // State for library tracks (server-side pagination)
    const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [totalTracks, setTotalTracks] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [totalPages, setTotalPages] = useState(0);

    // Albums view state
    const [allAlbums, setAllAlbums] = useState<FeaturedAlbum[]>([]);
    const [albumsCurrentPage, setAlbumsCurrentPage] = useState(1);
    const [albumsTotalPages, setAlbumsTotalPages] = useState(0);
    const [totalAlbums, setTotalAlbums] = useState(0);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

    // Artists view state  
    const [allArtists, setAllArtists] = useState<FeaturedArtist[]>([]);
    const [artistsCurrentPage, setArtistsCurrentPage] = useState(1);
    const [artistsTotalPages, setArtistsTotalPages] = useState(0);
    const [totalArtists, setTotalArtists] = useState(0);
    const [isLoadingArtists, setIsLoadingArtists] = useState(false);

    

    // Memoize unique albums and artists to prevent re-renders
    const uniqueAlbums = useMemo(() => {
        return Array.from(
            new Map(
                tracks
                    .filter((track) => track.album)
                    .map((track) => [
                        track.album!.id,
                        {
                            id: track.album!.id,
                            title: track.album!.title,
                            cover_image_url: track.album!.cover_image_url,
                            custom_url: track.album!.custom_url,
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
                    .filter((track) => track.artist)
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
        const shuffled = [...tracks].sort((a, b) => {
            const seedA = a.id * 9301 + 49297;
            const seedB = b.id * 9301 + 49297;
            return (seedA % 233280) - (seedB % 233280);
        });
        return shuffled.slice(0, 12);
    }, [tracks]);

    // Function to fetch albums with pagination
    const fetchAllAlbums = useCallback(async (page: number = 1, resetPage: boolean = false) => {
        if (currentView !== "albums") return;

        setIsLoadingAlbums(true);
        try {
            const params = new URLSearchParams({
                page: resetPage ? '1' : page.toString(),
                limit: itemsPerPage.toString(),
            });

            const response = await fetch(`/api/albums?${params}`);
            if (response.ok) {
                const data = await response.json();
                if (data.albums && Array.isArray(data.albums)) {
                    setAllAlbums(data.albums);
                    setTotalAlbums(data.total || 0);
                    setAlbumsTotalPages(data.totalPages || 0);
                    if (resetPage) {
                        setAlbumsCurrentPage(1);
                    }
                } else {
                    setAllAlbums([]);
                    setTotalAlbums(0);
                    setAlbumsTotalPages(0);
                    if (resetPage) {
                        setAlbumsCurrentPage(1);
                    }
                }
            } else {
                setAllAlbums([]);
                setTotalAlbums(0);
                setAlbumsTotalPages(0);
                setAlbumsCurrentPage(1);
            }
        } catch (error) {
            console.error("Error fetching albums:", error);
            setAllAlbums([]);
            setTotalAlbums(0);
            setAlbumsTotalPages(0);
            setAlbumsCurrentPage(1);
        } finally {
            setIsLoadingAlbums(false);
        }
    }, [currentView, itemsPerPage]);

    // Function to fetch artists with pagination
    const fetchAllArtists = useCallback(async (page: number = 1, resetPage: boolean = false) => {
        if (currentView !== "artists") return;

        setIsLoadingArtists(true);
        try {
            const params = new URLSearchParams({
                page: resetPage ? '1' : page.toString(),
                limit: itemsPerPage.toString(),
            });

            const response = await fetch(`/api/artists?${params}`);
            if (response.ok) {
                const data = await response.json();
                if (data.artists && Array.isArray(data.artists)) {
                    // Add tracks count for each artist
                    const artistsWithCount = data.artists.map(artist => ({
                        ...artist,
                        tracksCount: tracks.filter(t => t.artist?.id === artist.id).length
                    }));
                    
                    setAllArtists(artistsWithCount);
                    setTotalArtists(data.total || 0);
                    setArtistsTotalPages(data.totalPages || 0);
                    if (resetPage) {
                        setArtistsCurrentPage(1);
                    }
                } else {
                    setAllArtists([]);
                    setTotalArtists(0);
                    setArtistsTotalPages(0);
                    if (resetPage) {
                        setArtistsCurrentPage(1);
                    }
                }
            } else {
                setAllArtists([]);
                setTotalArtists(0);
                setArtistsTotalPages(0);
                setArtistsCurrentPage(1);
            }
        } catch (error) {
            console.error("Error fetching artists:", error);
            setAllArtists([]);
            setTotalArtists(0);
            setArtistsTotalPages(0);
            setArtistsCurrentPage(1);
        } finally {
            setIsLoadingArtists(false);
        }
    }, [currentView, itemsPerPage, tracks]);

    // Function to fetch library tracks with pagination, search and filters
    const fetchLibraryTracks = useCallback(async (page: number = 1, resetPage: boolean = false) => {
        if (currentView !== "library") return;

        // Only show loading if it's a fresh search or view change, not pagination
        if (resetPage || page === 1) {
            setIsSearching(true);
        }
        try {
            const params = new URLSearchParams({
                page: resetPage ? '1' : page.toString(),
                limit: itemsPerPage.toString(),
                genre: selectedGenre,
            });

            if (searchQuery.trim()) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`/api/tracks?${params}`);

            if (response.ok) {
                const data = await response.json();
                if (data.tracks && Array.isArray(data.tracks)) {
                    setLibraryTracks(data.tracks);
                    setTotalTracks(data.total || 0);
                    setTotalPages(data.totalPages || 0);
                    if (resetPage) {
                        setCurrentPage(1);
                    }
                } else {
                    setLibraryTracks([]);
                    setTotalTracks(0);
                    setTotalPages(0);
                    if (resetPage) {
                        setCurrentPage(1);
                    }
                }
            } else {
                // If error response, reset everything and go back to page 1
                setLibraryTracks([]);
                setTotalTracks(0);
                setTotalPages(0);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Error fetching library tracks:", error);
            setLibraryTracks([]);
            setTotalTracks(0);
            setTotalPages(0);
            setCurrentPage(1);
        } finally {
            setIsSearching(false);
        }
    }, [currentView, searchQuery, selectedGenre, itemsPerPage]);

    // State for search trigger
    const [shouldSearch, setShouldSearch] = useState(false);

    // Search effect when triggered
    useEffect(() => {
        if (shouldSearch) {
            // Auto switch to library view when searching
            if (searchQuery.trim()) {
                setCurrentView("library");
            }
            fetchLibraryTracks(1, true);
            setShouldSearch(false);
        }
    }, [shouldSearch, fetchLibraryTracks, searchQuery]);

    // Handle Enter key press
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setShouldSearch(true);
        }
    };

    // Fetch library tracks when view or genre changes (but not page changes)
    useEffect(() => {
        if (currentView === "library") {
            fetchLibraryTracks(1, true); // Reset to page 1 when view/genre changes
        }
    }, [currentView, selectedGenre, fetchLibraryTracks]);

    // Separate effect for page changes to avoid duplicate calls
    useEffect(() => {
        if (currentView === "library" && totalPages > 0 && currentPage <= totalPages) {
            fetchLibraryTracks(currentPage, false);
        }
    }, [currentPage, totalPages]);

    // Fetch albums when albums view is active
    useEffect(() => {
        if (currentView === "albums") {
            fetchAllAlbums(1, true); // Reset to page 1 when view changes
        }
    }, [currentView]);

    // Separate effect for albums page changes
    useEffect(() => {
        if (currentView === "albums" && albumsCurrentPage >= 1) {
            fetchAllAlbums(albumsCurrentPage, false);
        }
    }, [albumsCurrentPage]);

    // Fetch artists when artists view is active
    useEffect(() => {
        if (currentView === "artists") {
            fetchAllArtists(1, true); // Reset to page 1 when view changes
        }
    }, [currentView]);

    // Separate effect for artists page changes
    useEffect(() => {
        if (currentView === "artists" && artistsCurrentPage >= 1) {
            fetchAllArtists(artistsCurrentPage, false);
        }
    }, [artistsCurrentPage]);

    // Reset search when query is cleared
    useEffect(() => {
        if (!searchQuery.trim() && currentView === "library") {
            fetchLibraryTracks(1, true);
        }
    }, [searchQuery, currentView, fetchLibraryTracks]);

    // Function to fetch featured data
    const fetchFeaturedData = async () => {
        setIsLoadingFeatured(true);
        try {
            const genreParam = selectedGenre !== "all" ? `genre=${encodeURIComponent(selectedGenre)}&` : "";

            // Fetch featured tracks
            const tracksResponse = await fetch(`/api/tracks?${genreParam}limit=10`);
            if (tracksResponse.ok) {
                const tracksData = await tracksResponse.json();
                const tracksArray = Array.isArray(tracksData) ? tracksData : tracksData.tracks || [];
                setFeaturedTracks(tracksArray.slice(0, 10));
            }

            // Fetch featured albums using pagination API
            const albumsResponse = await fetch(`/api/albums?page=1&limit=10`);
            if (albumsResponse.ok) {
                const albumsData = await albumsResponse.json();
                setFeaturedAlbums(albumsData.albums || []);
            }

            // Fetch featured artists using pagination API
            const artistsResponse = await fetch(`/api/artists?page=1&limit=10`);
            if (artistsResponse.ok) {
                const artistsData = await artistsResponse.json();
                const artistsWithCount = (artistsData.artists || []).map((artist: any) => ({
                    ...artist,
                    tracksCount: tracks.filter(t => t.artist?.id === artist.id).length
                }));
                setFeaturedArtists(artistsWithCount);
            }
        } catch (error) {
            console.error("Error fetching featured data:", error);
        } finally {
            setIsLoadingFeatured(false);
            setLoading(false);
        }
    };

    // Fetch featured data when genre changes or component mounts
    useEffect(() => {
        if (currentView === "featured") {
            fetchFeaturedData();
        } else {
            setLoading(false);
        }
    }, [selectedGenre, currentView]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "upload") {
            setCurrentView("upload");
            window.history.replaceState({}, "", "/music");
        }
    }, [searchParams]);

    // Show loading if still loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
                {/* Hero Section Skeleton */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative container mx-auto px-6 py-20">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="h-8 bg-white/20 rounded-lg mb-8 animate-pulse"></div>

                            {/* Search Bar Skeleton */}
                            <div className="relative max-w-2xl mx-auto mb-8">
                                <div className="h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg animate-pulse flex items-center px-4">
                                    <Search className="h-5 w-5 text-white/40 mr-3" />
                                    <div className="h-5 bg-white/20 rounded flex-1 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Action Buttons Skeleton */}
                            <div className="flex flex-wrap gap-4 justify-center">
                                <div className="h-12 w-40 bg-white/20 rounded-lg animate-pulse"></div>
                                <div className="h-12 w-36 bg-white/20 rounded-lg animate-pulse"></div>
                                <div className="h-12 w-40 bg-white/20 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Skeleton */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="container mx-auto px-4 sm:px-6 pb-32 space-y-16 pt-12">
                    {/* Featured Tracks Skeleton */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                                <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="group relative">
                                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/30">
                                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                        <div className="p-6 space-y-3">
                                            <div className="space-y-2">
                                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Albums Skeleton */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="group text-center">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse"></div>
                                    <div className="space-y-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mx-auto"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Artists Skeleton */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="group text-center">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-full mb-3 animate-pulse"></div>
                                    <div className="space-y-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mx-auto"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <MusicExplorerUI
            tracks={tracks}
            featuredTracks={featuredTracks}
            featuredAlbums={featuredAlbums}
            featuredArtists={featuredArtists}
            libraryTracks={libraryTracks}
            trendingTracks={trendingTracks}
            uniqueAlbums={uniqueAlbums}
            uniqueArtists={uniqueArtists}
            genres={genres}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            currentView={currentView}
            setCurrentView={setCurrentView}
            isLoadingFeatured={isLoadingFeatured}
            onSearchKeyPress={handleSearchKeyPress}
            isSearching={isSearching}
            onSearchTrigger={() => setShouldSearch(true)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            totalTracks={totalTracks}
            allAlbums={allAlbums}
            allArtists={allArtists}
            albumsCurrentPage={albumsCurrentPage}
            setAlbumsCurrentPage={setAlbumsCurrentPage}
            albumsTotalPages={albumsTotalPages}
            totalAlbums={totalAlbums}
            artistsCurrentPage={artistsCurrentPage}
            setArtistsCurrentPage={setArtistsCurrentPage}
            artistsTotalPages={artistsTotalPages}
            totalArtists={totalArtists}
            isLoadingAlbums={isLoadingAlbums}
            isLoadingArtists={isLoadingArtists}
        />
    );
}