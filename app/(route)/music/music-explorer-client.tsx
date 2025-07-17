
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
        "featured" | "library" | "upload"
    >("featured");
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
    const [loading, setLoading] = useState(true);
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
        const shuffled = [...filteredTracks].sort((a, b) => {
            const seedA = a.id * 9301 + 49297;
            const seedB = b.id * 9301 + 49297;
            return (seedA % 233280) - (seedB % 233280);
        });
        return shuffled.slice(0, 12);
    }, [filteredTracks]);

    // Function to fetch featured data
    const fetchFeaturedData = async () => {
        setIsLoadingFeatured(true);
        try {
            const genreParam = selectedGenre !== "all" ? `genre=${encodeURIComponent(selectedGenre)}&` : "";

            // Fetch featured tracks
            const tracksResponse = await fetch(`/api/tracks?${genreParam}limit=10`);
            if (tracksResponse.ok) {
                const tracksData = await tracksResponse.json();
                setFeaturedTracks(tracksData.slice(0, 10));
            }

            // Fetch featured albums
            const albumsResponse = await fetch(`/api/albums?limit=10`);
            if (albumsResponse.ok) {
                const albumsData = await albumsResponse.json();
                setFeaturedAlbums(albumsData);
            }

            // Fetch featured artists
            const artistsResponse = await fetch(`/api/artists?limit=10`);
            if (artistsResponse.ok) {
                const artistsData = await artistsResponse.json();
                const artistsWithCount = artistsData.map((artist: any) => ({
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
        return null; // Let the loading component handle this
    }

    return (
        <MusicExplorerUI
            tracks={tracks}
            featuredTracks={featuredTracks}
            featuredAlbums={featuredAlbums}
            featuredArtists={featuredArtists}
            filteredTracks={filteredTracks}
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
        />
    );
}
