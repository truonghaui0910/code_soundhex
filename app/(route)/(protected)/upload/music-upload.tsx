"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
    Upload,
    Link,
    Music,
    Search,
    Download,
    Plus,
    Check,
    Album,
    Users,
    List,
    Play,
    Pause,
    X,
    Loader2,
    Globe,
    HardDrive,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { showImportSuccess, showError, showInfo, showProcessing, dismissNotifications } from "@/lib/services/notification-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Updated types based on real Spotify API response
interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    image: string;
    isrc?: string | null;
    preview_url?: string;
    artists?: {id: string, name: string}[];
    album_id?: string;
    artist_id?: string;
    release_date?: string;
}

interface SpotifyAlbum {
    id: string;
    name: string;
    artist: string;
    image: string;
    tracks: SpotifyTrack[];
    release_date: string;
}

interface SpotifyArtist {
    id: string;
    name: string;
    image: string;
    albums: SpotifyAlbum[];
}

interface UploadFormData {
    title: string;
    artist: string;
    album: string;
    genre: string;
    description: string;
    file: File | null;
}

export function MusicUpload() {
    const [activeTab, setActiveTab] = useState<"spotify" | "upload">("spotify");
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [spotifyData, setSpotifyData] = useState<any>(null);
    const [selectedTracks, setSelectedTracks] = useState<Set<string>>(
        new Set(),
    );
    const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(
        new Set(),
    );
    const [loadingAlbums, setLoadingAlbums] = useState<Set<string>>(new Set());
    const [uploadForm, setUploadForm] = useState<UploadFormData>({
        title: "",
        artist: "",
        album: "",
        genre: "",
        description: "",
        file: null,
    });
    const [fileInputRef] = useState<any>(useRef(null));
    const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);

    // Audio player context
    const {
        currentTrack,
        isPlaying,
        playTrack,
        togglePlayPause,
        setTrackList,
    } = useAudioPlayer();

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSpotifySubmit = async () => {
        if (!spotifyUrl.trim()) {
            showError("📝 Please enter a Spotify URL");
            return;
        }

        setIsLoading(true);
        setSpotifyData(null);
        setSelectedTracks(new Set());

        try {
            const response = await fetch("/api/spotify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ spotifyUrl }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch Spotify data");
            }

            const data = await response.json();
            console.log("Spotify data:", data);
            setSpotifyData(data);

            // Auto-select all tracks for album, playlist, and single track
            if (data.type === "album" || data.type === "playlist") {
                const trackIds = new Set<string>(
                    data.data.tracks.map((track: SpotifyTrack) =>
                        String(track.id),
                    ),
                );
                setSelectedTracks(trackIds);
            } else if (data.type === "track") {
                setSelectedTracks(new Set([String(data.data.id)]));
            }
        } catch (error) {
            console.error("Error:", error);
            showError({
                title: "❌ Spotify Data Error",
                message: "Cannot fetch information from Spotify. Please check the URL and try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadAlbumTracks = async (albumId: string) => {
        if (loadingAlbums.has(albumId)) return;

        setLoadingAlbums((prev) => new Set(prev).add(albumId));

        try {
            const response = await fetch("/api/spotify/album-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ albumId }),
            });

            if (!response.ok) {
                throw new Error("Failed to load album tracks");
            }

            const { data } = await response.json();
            console.log("Album data:", data);

            // Update the album with tracks
            setSpotifyData((prev: any) => ({
                ...prev,
                data: {
                    ...prev.data,
                    albums: prev.data.albums.map((album: SpotifyAlbum) =>
                        album.id === albumId
                            ? { ...album, tracks: data.tracks }
                            : album,
                    ),
                },
            }));

            // Auto-select all tracks from this album
            setSelectedTracks((prev) => {
                const newSelected = new Set(prev);
                data.tracks.forEach((track: SpotifyTrack) => {
                    newSelected.add(track.id);
                });
                return newSelected;
            });
        } catch (error) {
            console.error("Error loading album tracks:", error);
            showError({
                title: "❌ Album Tracks Error",
                message: "Cannot load track list from album. Please try again."
            });
        } finally {
            setLoadingAlbums((prev) => {
                const newSet = new Set(prev);
                newSet.delete(albumId);
                return newSet;
            });
        }
    };

    const toggleTrackSelection = (trackId: string) => {
        const newSelection = new Set(selectedTracks);
        if (newSelection.has(trackId)) {
            newSelection.delete(trackId);
        } else {
            newSelection.add(trackId);
        }
        setSelectedTracks(newSelection);
    };

    const toggleAlbumExpansion = async (albumId: string) => {
        const newExpanded = new Set(expandedAlbums);
        if (newExpanded.has(albumId)) {
            newExpanded.delete(albumId);
        } else {
            newExpanded.add(albumId);
            // Load tracks if not already loaded
            const album = spotifyData?.data?.albums?.find(
                (a: SpotifyAlbum) => a.id === albumId,
            );
            if (album && (!album.tracks || album.tracks.length === 0)) {
                await loadAlbumTracks(albumId);
            }
        }
        setExpandedAlbums(newExpanded);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadForm({ ...uploadForm, file });
        }
    };

    const handleUploadSubmit = () => {
        if (!uploadForm.file || !uploadForm.title || !uploadForm.artist) {
            showError("📝 Vui lòng điền đầy đủ các trường bắt buộc");
            return;
        }
        console.log("Upload form data:", uploadForm);
        showInfo("🚧 Tính năng upload file sẽ được triển khai sớm!");
    };

    const submitSpotifyTracks = async () => {
        if (selectedTracks.size === 0) {
            showError("🎵 Please select at least one song to import");
            return;
        }

        setIsLoading(true);

        try {
            // Get selected track data
            const selectedTrackData: SpotifyTrack[] = [];

            if (spotifyData.type === "track") {
                selectedTrackData.push(spotifyData.data);
            } else if (
                spotifyData.type === "album" ||
                spotifyData.type === "playlist"
            ) {
                spotifyData.data.tracks.forEach((track: SpotifyTrack) => {
                    if (selectedTracks.has(track.id)) {
                        selectedTrackData.push(track);
                    }
                });
            } else if (spotifyData.type === "artist") {
                spotifyData.data.albums.forEach((album: SpotifyAlbum) => {
                    album.tracks?.forEach((track: SpotifyTrack) => {
                        if (selectedTracks.has(track.id)) {
                            selectedTrackData.push(track);
                        }
                    });
                });
            }
            const tracksToImport = selectedTrackData.map((track) => ({
                                                        id: track.id,
                                                        name: track.name,
                                                        artist: track.artist,
                                                        album: track.album,
                                                        duration: track.duration,
                                                        image: track.image,
                                                        isrc: track.isrc,
                                                        preview_url: track.preview_url,
                                                        artists: track.artists || [{ 
                                                            id: track.artist_id || `artist_${track.id}`,
                                                            name: track.artist 
                                                        }],
                                                        album_data: {
                                                            id: track.album_id || `album_${track.id}`,
                                                            release_date: track.release_date,
                                                            description: null,
                                                        }
                                                    }));
            // Call import API
            const response = await fetch("/api/import-music", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tracks: tracksToImport }),
            });

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                console.error("Failed to parse response:", parseError);
                throw new Error("Invalid server response");
            }

            if (!response.ok) {
                const errorMessage = result?.error || result?.message || "Failed to import tracks";
                throw new Error(errorMessage);
            }

            // Parse the results properly from the API response
            const successCount = result?.success || 0;
            const failedCount = result?.failed || 0;
            const totalTracks = tracksToImport.length;
            
            // Show beautiful notification after processing all tracks
            showImportSuccess({
                totalTracks,
                successCount,
                failedCount,
                albumName: spotifyData.type === "album" ? spotifyData.data.name : undefined,
                artistName: spotifyData.type === "artist" ? spotifyData.data.name : undefined
            });

            // Reset form
            setSpotifyData(null);
            setSelectedTracks(new Set());
            setSpotifyUrl("");
            setOwnershipConfirmed(false);

        } catch (error) {
            console.error("Import error:", error);
            showError({
                title: "❌ Import Failed",
                message: `Cannot import tracks: ${error instanceof Error ? error.message : "Unknown error"}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayTrack = (track: SpotifyTrack) => {
        if (!track.preview_url) {
            showError('🔇 Không có bản preview cho bài hát này');
            return;
        }

        // Convert SpotifyTrack to Track format similar to music/music-upload.tsx
        const trackToPlay = {
            id: `spotify-${track.id}`,
            title: track.name,
            file_url: track.preview_url ? `/api/proxy-audio?url=${encodeURIComponent(track.preview_url)}` : "",
            duration: track.duration,
            audio_file_url: track.preview_url ? `/api/proxy-audio?url=${encodeURIComponent(track.preview_url)}` : "",
            artist: {
                id: "spotify-artist",
                name: track.artist,
            },
            album: {
                id: `spotify-${track.id}`,
                title: track.album,
                cover_image_url: track.image,
            },
        };

        // Create track list for navigation
        let allTracks: any[] = [];

        if (spotifyData?.type === "track") {
            allTracks = [trackToPlay];
        } else if (spotifyData?.type === "album" || spotifyData?.type === "playlist") {
            allTracks = spotifyData.data.tracks
                .filter((t: SpotifyTrack) => t.preview_url)
                .map((t: SpotifyTrack) => ({
                    id: `spotify-${t.id}`,
                    title: t.name,
                    file_url: t.preview_url ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}` : "",
                    duration: t.duration,
                    audio_file_url: t.preview_url ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}` : "",
                    artist: {
                        id: "spotify-artist",
                        name: t.artist,
                    },
                    album: {
                        id: `spotify-${t.id}`,
                        title: t.album,
                        cover_image_url: t.image,
                    },
                }));
        } else if (spotifyData?.type === "artist") {
            allTracks = [];
            spotifyData.data.albums.forEach((album: SpotifyAlbum) => {
                if (album.tracks) {
                    album.tracks
                        .filter((t: SpotifyTrack) => t.preview_url)
                        .forEach((t: SpotifyTrack) => {
                            allTracks.push({
                                id: `spotify-${t.id}`,
                                title: t.name,
                                file_url: t.preview_url ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}` : "",
                                duration: t.duration,
                                audio_file_url: t.preview_url ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}` : "",
                                artist: {
                                    id: "spotify-artist",
                                    name: t.artist,
                                },
                                album: {
                                    id: `spotify-${album.id}`,
                                    title: album.name,
                                    cover_image_url: t.image || album.image,
                                },
                            });
                        });
                }
            });
        }

        setTrackList(allTracks);

        if (currentTrack?.id === `spotify-${track.id}` && isPlaying) {
            togglePlayPause();
        } else {
            playTrack(trackToPlay);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative container mx-auto px-6 py-16">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Upload Your Music
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-purple-100">
                            Import from Spotify or upload directly from your
                            device
                        </p>

                        {/* Tab Buttons */}
                        <div className="flex gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => setActiveTab("spotify")}
                                className={`${
                                    activeTab === "spotify"
                                        ? "bg-white text-purple-600 hover:bg-white/90"
                                        : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                            >
                                <Globe className="mr-2 h-5 w-5" />
                                Spotify Import
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setActiveTab("upload")}
                                className={`${
                                    activeTab === "upload"
                                        ? "bg-white text-purple-600 hover:bg-white/90"
                                        : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                            >
                                <HardDrive className="mr-2 h-5 w-5" />
                                File Upload
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
                {activeTab === "spotify" && (
                    <div className="space-y-8">
                        {/* Spotify URL Input */}
                        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                        <Link className="h-4 w-4 text-white" />
                                    </div>
                                    Import from Spotify
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="spotify-url">
                                        Spotify URL
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="spotify-url"
                                            placeholder="Paste Spotify artist, album, playlist, or track URL here..."
                                            value={spotifyUrl}
                                            onChange={(e) =>
                                                setSpotifyUrl(e.target.value)
                                            }
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleSpotifySubmit}
                                            disabled={
                                                isLoading || !spotifyUrl.trim()
                                            }
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>Artist URLs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Album className="h-4 w-4" />
                                        <span>Album URLs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <List className="h-4 w-4" />
                                        <span>Playlist URLs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Music className="h-4 w-4" />
                                        <span>Track URLs</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Spotify Results */}
                        {spotifyData && (
                            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <Download className="h-4 w-4 text-white" />
                                            </div>
                                            Import Results
                                        </CardTitle>
                                        <Button
                                            onClick={() => setSpotifyData(null)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Single Track */}
                                    {spotifyData.type === "track" && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <div className="relative">
                                                    <Image
                                                        src={spotifyData.data.image || "/images/soundhex.png"}
                                                        alt={spotifyData.data.name}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-lg object-cover"
                                                    />
                                                    {spotifyData.data.preview_url && (
                                                        <Button
                                                            size="sm"
                                                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full p-0"
                                                            onClick={() => handlePlayTrack(spotifyData.data)}
                                                        >
                                                            {currentTrack?.id === `spotify-${spotifyData.data.id}` && isPlaying ? (
                                                                <Pause className="h-3 w-3" />
                                                            ) : (
                                                                <Play className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{spotifyData.data.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400">{spotifyData.data.artist}</p>
                                                    <p className="text-sm text-gray-500">{spotifyData.data.album}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span>{formatDuration(spotifyData.data.duration)}</span>
                                                        {spotifyData.data.isrc && <span>ISRC: {spotifyData.data.isrc}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={selectedTracks.has(spotifyData.data.id) ? "default" : "secondary"}>
                                                        {selectedTracks.has(spotifyData.data.id) ? "Selected" : "Not Selected"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Album or Playlist */}
                                    {(spotifyData.type === "album" || spotifyData.type === "playlist") && (
                                        <div className="space-y-6">
                                            {/* Album/Playlist Header */}
                                            <div className="flex items-start gap-6">
                                                <Image
                                                    src={spotifyData.data.image || "/images/soundhex.png"}
                                                    alt={spotifyData.data.name}
                                                    width={160}
                                                    height={160}
                                                    className="rounded-lg shadow-lg object-cover"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <Badge variant="outline" className="mb-2">
                                                        {spotifyData.type === "album" ? "Album" : "Playlist"}
                                                    </Badge>
                                                    <h3 className="text-2xl font-bold">{spotifyData.data.name}</h3>
                                                    <p className="text-lg text-gray-600 dark:text-gray-400">{spotifyData.data.artist}</p>
                                                    {spotifyData.data.release_date && (
                                                        <p className="text-sm text-gray-500">Released: {spotifyData.data.release_date}</p>
                                                    )}
                                                    <p className="text-sm text-gray-500">{spotifyData.data.tracks?.length || 0} tracks</p>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Track Selection */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">Select tracks to import:</h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const allTrackIds = spotifyData.data.tracks.map((t: SpotifyTrack) => t.id);
                                                            if (selectedTracks.size === allTrackIds.length) {
                                                                setSelectedTracks(new Set());
                                                            } else {
                                                                setSelectedTracks(new Set(allTrackIds));
                                                            }
                                                        }}
                                                    >
                                                        {selectedTracks.size === spotifyData.data.tracks?.length ? "Deselect All" : "Select All"}
                                                    </Button>
                                                </div>

                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {spotifyData.data.tracks?.map((track: SpotifyTrack, index: number) => (
                                                        <div
                                                            key={track.id}
                                                            className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                                selectedTracks.has(track.id)
                                                                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                                                                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            }`}
                                                            onClick={() => toggleTrackSelection(track.id)}
                                                        >
                                                            <div className="w-6 h-6 flex items-center justify-center">
                                                                {selectedTracks.has(track.id) ? (
                                                                    <Check className="h-4 w-4 text-purple-600" />
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">{index + 1}</span>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Image
                                                                    src={track.image || spotifyData.data.image || "/images/soundhex.png"}
                                                                    alt={track.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="rounded object-cover"
                                                                />
                                                                {track.preview_url && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handlePlayTrack(track);
                                                                        }}
                                                                    >
                                                                        {currentTrack?.id === `spotify-${track.id}` && isPlaying ? (
                                                                            <Pause className="h-2 w-2" />
                                                                        ) : (
                                                                            <Play className="h-2 w-2" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium truncate">{track.name}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span>{formatDuration(track.duration)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Artist */}
                                    {spotifyData.type === "artist" && (
                                        <div className="space-y-6">
                                            {/* Artist Header */}
                                            <div className="flex items-start gap-6">
                                                <Image
                                                    src={spotifyData.data.image || "/images/soundhex.png"}
                                                    alt={spotifyData.data.name}
                                                    width={160}
                                                    height={160}
                                                    className="rounded-lg shadow-lg object-cover"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <Badge variant="outline" className="mb-2">Artist</Badge>
                                                    <h3 className="text-2xl font-bold">{spotifyData.data.name}</h3>
                                                    <p className="text-sm text-gray-500">{spotifyData.data.albums?.length || 0} albums</p>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Albums List */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">Select albums to import:</h4>
                                                {spotifyData.data.albums.map((album: SpotifyAlbum) => (
                                                    <div key={album.id} className="border rounded-lg p-4">
                                                        <div
                                                            className="flex items-center gap-4 cursor-pointer"
                                                            onClick={() => toggleAlbumExpansion(album.id)}
                                                        >
                                                            <Image
                                                                src={album.image || "/images/soundhex.png"}
                                                                alt={album.name}
                                                                width={64}
                                                                height={64}
                                                                className="rounded object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <h5 className="font-medium">{album.name}</h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{album.artist}</p>
                                                                <p className="text-xs text-gray-500">{album.release_date}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {loadingAlbums.has(album.id) ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : expandedAlbums.has(album.id) ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {expandedAlbums.has(album.id) && album.tracks && album.tracks.length > 0 && (
                                                            <div className="mt-4 space-y-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                        Select tracks from this album:
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const allAlbumTrackIds = album.tracks.map((t: SpotifyTrack) => t.id);
                                                                            const allSelected = allAlbumTrackIds.every(id => selectedTracks.has(id));

                                                                            if (allSelected) {
                                                                                // Deselect all tracks from this album
                                                                                const newSelection = new Set(selectedTracks);
                                                                                allAlbumTrackIds.forEach(id => newSelection.delete(id));
                                                                                setSelectedTracks(newSelection);
                                                                            } else {
                                                                                // Select all tracks from this album
                                                                                const newSelection = new Set(selectedTracks);
                                                                                allAlbumTrackIds.forEach(id => newSelection.add(id));
                                                                                setSelectedTracks(newSelection);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {album.tracks.every((t: SpotifyTrack) => selectedTracks.has(t.id)) ? "Deselect All" : "Select All"}
                                                                    </Button>
                                                                </div>

                                                                <div className="space-y-2 max-h-64 overflow-y-auto pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                                                    {album.tracks.map((track: SpotifyTrack, index: number) => (
                                                                        <div
                                                                            key={track.id}
                                                                            className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                                                selectedTracks.has(track.id)
                                                                                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                                                                                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                            }`}
                                                                            onClick={() => toggleTrackSelection(track.id)}
                                                                        >
                                                                            <div className="w-6 h-6 flex items-center justify-center">
                                                                                {selectedTracks.has(track.id) ? (
                                                                                    <Check className="h-4 w-4 text-purple-600" />
                                                                                ) : (
                                                                                    <span className="text-sm text-gray-400">{index + 1}</span>
                                                                                )}
                                                                            </div>                                                                            <div className="relative">
                                                                                <Image
                                                                                    src={track.image || album.image || "/images/soundhex.png"}
                                                                                    alt={track.name}
                                                                                    width={48}
                                                                                    height={48}
                                                                                    className="rounded object-cover"
                                                                                />
                                                                                {track.preview_url && (
                                                                                    <Button
                                                                                        size="sm"
                                                                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handlePlayTrack(track);
                                                                                        }}
                                                                                    >
                                                                                        {currentTrack?.id === `spotify-${track.id}` && isPlaying ? (
                                                                                            <Pause className="h-2 w-2" />
                                                                                        ) : (
                                                                                            <Play className="h-2 w-2" />
                                                                                        )}
                                                                                    </Button>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium truncate">{track.name}</p>
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
                                                                            </div>

                                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                                <span>{formatDuration(track.duration)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ownership Confirmation */}
                                    <div className="border-t pt-6">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                id="ownership-confirmation"
                                                checked={ownershipConfirmed}
                                                onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                                                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="ownership-confirmation" className="text-sm text-gray-700 dark:text-gray-300">
                                                <span className="font-medium">Ownership Confirmation:</span> I hereby confirm that I am the rightful owner or have proper authorization to upload and distribute the selected music tracks. I understand that uploading copyrighted material without permission is prohibited and may result in legal consequences. I take full responsibility for ensuring all uploaded content complies with copyright laws and licensing requirements.
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={submitSpotifyTracks}
                                            disabled={selectedTracks.size === 0 || !ownershipConfirmed || isLoading}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    Import {selectedTracks.size} Track
                                                    {selectedTracks.size !== 1 ? "s" : ""}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === "upload" && (
                    <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <Upload className="h-4 w-4 text-white" />
                                </div>
                                Upload Music File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="music-file">Audio File *</Label>
                                <div
                                    className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 hover:border-purple-400 transition-colors bg-purple-50/50 dark:bg-purple-900/20 cursor-pointer"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                                            <Upload className="h-8 w-8 text-white" />
                                        </div>
                                        {uploadForm.file ? (
                                            <div>
                                                <p className="font-semibold text-green-600 dark:text-green-400">
                                                    {uploadForm.file.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(
                                                        uploadForm.file.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-semibold">
                                                    Drop your music file here
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Supports MP3, WAV, FLAC
                                                    formats
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            <Separator />

                            {/* Track Information */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Track Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter track title"
                                        value={uploadForm.title}
                                        onChange={(e) =>
                                            setUploadForm({
                                                ...uploadForm,
                                                title: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="artist">
                                        Artist Name *
                                    </Label>
                                    <Input
                                        id="artist"
                                        placeholder="Enter artist name"
                                        value={uploadForm.artist}
                                        onChange={(e) =>
                                            setUploadForm({
                                                ...uploadForm,
                                                artist: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="album">Album</Label>
                                    <Input
                                        id="album"
                                        placeholder="Enter album name"
                                        value={uploadForm.album}
                                        onChange={(e) =>
                                            setUploadForm({
                                                ...uploadForm,
                                                album: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="genre">Genre</Label>
                                    <select
                                        id="genre"
                                        value={uploadForm.genre}
                                        onChange={(e) =>
                                            setUploadForm({
                                                ...uploadForm,
                                                genre: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select genre</option>
                                        <option value="pop">Pop</option>
                                        <option value="rock">Rock</option>
                                        <option value="hip-hop">Hip Hop</option>
                                        <option value="electronic">
                                            Electronic
                                        </option>
                                        <option value="jazz">Jazz</option>
                                        <option value="classical">
                                            Classical
                                        </option>
                                        <option value="country">Country</option>
                                        <option value="r&b">R&B</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell us about your track..."
                                    rows={4}
                                    value={uploadForm.description}
                                    onChange={(e) =>
                                        setUploadForm({
                                            ...uploadForm,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Upload Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleUploadSubmit}
                                    disabled={
                                        !uploadForm.file ||
                                        !uploadForm.title ||
                                        !uploadForm.artist
                                    }
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Track
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}