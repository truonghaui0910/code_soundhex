
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
    X,
    Loader2,
    Globe,
    HardDrive,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data types
interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    image: string;
    preview_url?: string;
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
    const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
    const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());
    const [uploadForm, setUploadForm] = useState<UploadFormData>({
        title: "",
        artist: "",
        album: "",
        genre: "",
        description: "",
        file: null,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock Spotify data
    const mockArtistData: SpotifyArtist = {
        id: "artist1",
        name: "The Weekend",
        image: "/images/artist-mock.jpg",
        albums: [
            {
                id: "album1",
                name: "After Hours",
                artist: "The Weekend",
                image: "/images/album1-mock.jpg",
                release_date: "2020-03-20",
                tracks: [
                    {
                        id: "track1",
                        name: "Blinding Lights",
                        artist: "The Weekend",
                        album: "After Hours",
                        duration: 200,
                        image: "/images/album1-mock.jpg",
                    },
                    {
                        id: "track2",
                        name: "In Your Eyes",
                        artist: "The Weekend",
                        album: "After Hours",
                        duration: 230,
                        image: "/images/album1-mock.jpg",
                    },
                ],
            },
            {
                id: "album2",
                name: "Beauty Behind The Madness",
                artist: "The Weekend",
                image: "/images/album2-mock.jpg",
                release_date: "2015-08-28",
                tracks: [
                    {
                        id: "track3",
                        name: "Can't Feel My Face",
                        artist: "The Weekend",
                        album: "Beauty Behind The Madness",
                        duration: 213,
                        image: "/images/album2-mock.jpg",
                    },
                ],
            },
        ],
    };

    const mockAlbumData: SpotifyAlbum = {
        id: "album1",
        name: "After Hours",
        artist: "The Weekend",
        image: "/images/album1-mock.jpg",
        release_date: "2020-03-20",
        tracks: [
            {
                id: "track1",
                name: "Blinding Lights",
                artist: "The Weekend",
                album: "After Hours",
                duration: 200,
                image: "/images/album1-mock.jpg",
            },
            {
                id: "track2",
                name: "In Your Eyes",
                artist: "The Weekend",
                album: "After Hours",
                duration: 230,
                image: "/images/album1-mock.jpg",
            },
        ],
    };

    const mockTrackData: SpotifyTrack = {
        id: "track1",
        name: "Blinding Lights",
        artist: "The Weekend",
        album: "After Hours",
        duration: 200,
        image: "/images/album1-mock.jpg",
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const detectSpotifyUrlType = (url: string) => {
        if (url.includes("/artist/")) return "artist";
        if (url.includes("/album/")) return "album";
        if (url.includes("/playlist/")) return "playlist";
        if (url.includes("/track/")) return "track";
        return null;
    };

    const handleSpotifySubmit = async () => {
        if (!spotifyUrl.trim()) return;

        setIsLoading(true);
        const urlType = detectSpotifyUrlType(spotifyUrl);

        // Simulate API call
        setTimeout(() => {
            switch (urlType) {
                case "artist":
                    setSpotifyData({ type: "artist", data: mockArtistData });
                    break;
                case "album":
                case "playlist":
                    setSpotifyData({ type: "album", data: mockAlbumData });
                    break;
                case "track":
                    setSpotifyData({ type: "track", data: mockTrackData });
                    setSelectedTracks(new Set([mockTrackData.id]));
                    break;
                default:
                    alert("Invalid Spotify URL");
            }
            setIsLoading(false);
        }, 1500);
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

    const toggleAlbumExpansion = (albumId: string) => {
        const newExpanded = new Set(expandedAlbums);
        if (newExpanded.has(albumId)) {
            newExpanded.delete(albumId);
        } else {
            newExpanded.add(albumId);
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
            alert("Please fill in all required fields");
            return;
        }
        console.log("Upload form data:", uploadForm);
        alert("Upload functionality will be implemented soon!");
    };

    const submitSpotifyTracks = () => {
        if (selectedTracks.size === 0) {
            alert("Please select at least one track");
            return;
        }
        console.log("Selected tracks:", Array.from(selectedTracks));
        alert(`${selectedTracks.size} track(s) will be processed for upload!`);
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
                            Import from Spotify or upload directly from your device
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
                                    <Label htmlFor="spotify-url">Spotify URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="spotify-url"
                                            placeholder="Paste Spotify artist, album, playlist, or track URL here..."
                                            value={spotifyUrl}
                                            onChange={(e) => setSpotifyUrl(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleSpotifySubmit}
                                            disabled={isLoading || !spotifyUrl.trim()}
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
                                    {spotifyData.type === "artist" && (
                                        <div className="space-y-6">
                                            {/* Artist Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">{spotifyData.data.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {spotifyData.data.albums.length} albums available
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Albums List */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">Select albums to import:</h4>
                                                {spotifyData.data.albums.map((album: SpotifyAlbum) => (
                                                    <div key={album.id} className="border rounded-lg p-4">
                                                        <div
                                                            className="flex items-center gap-4 cursor-pointer"
                                                            onClick={() => toggleAlbumExpansion(album.id)}
                                                        >
                                                            <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                                <Album className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold">{album.name}</h5>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {album.tracks.length} tracks • {album.release_date}
                                                                </p>
                                                            </div>
                                                            {expandedAlbums.has(album.id) ? (
                                                                <ChevronDown className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronRight className="h-5 w-5" />
                                                            )}
                                                        </div>

                                                        {expandedAlbums.has(album.id) && (
                                                            <div className="mt-4 space-y-2">
                                                                {album.tracks.map((track) => (
                                                                    <div
                                                                        key={track.id}
                                                                        className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                                            selectedTracks.has(track.id)
                                                                                ? "bg-purple-50 dark:bg-purple-900/20"
                                                                                : ""
                                                                        }`}
                                                                        onClick={() => toggleTrackSelection(track.id)}
                                                                    >
                                                                        <div className="w-6 h-6 rounded border-2 border-purple-400 flex items-center justify-center">
                                                                            {selectedTracks.has(track.id) && (
                                                                                <Check className="h-4 w-4 text-purple-600" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="font-medium">{track.name}</p>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {formatDuration(track.duration)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(spotifyData.type === "album" || spotifyData.type === "playlist") && (
                                        <div className="space-y-6">
                                            {/* Album/Playlist Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                    <Album className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">{spotifyData.data.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        by {spotifyData.data.artist} • {spotifyData.data.tracks.length} tracks
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tracks List */}
                                            <div className="space-y-2">
                                                <h4 className="font-semibold">Select tracks to import:</h4>
                                                {spotifyData.data.tracks.map((track: SpotifyTrack) => (
                                                    <div
                                                        key={track.id}
                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                            selectedTracks.has(track.id)
                                                                ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700"
                                                                : "border border-gray-200 dark:border-gray-700"
                                                        }`}
                                                        onClick={() => toggleTrackSelection(track.id)}
                                                    >
                                                        <div className="w-6 h-6 rounded border-2 border-purple-400 flex items-center justify-center">
                                                            {selectedTracks.has(track.id) && (
                                                                <Check className="h-4 w-4 text-purple-600" />
                                                            )}
                                                        </div>
                                                        <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                            <Music className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold">{track.name}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {track.artist} • {formatDuration(track.duration)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {spotifyData.type === "track" && (
                                        <div className="space-y-6">
                                            {/* Track Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                    <Music className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">{spotifyData.data.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        by {spotifyData.data.artist} • from {spotifyData.data.album}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Duration: {formatDuration(spotifyData.data.duration)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                                    <Check className="h-5 w-5" />
                                                    <span className="font-semibold">Track selected for import</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={submitSpotifyTracks}
                                            disabled={selectedTracks.size === 0}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        >
                                            Import {selectedTracks.size} Track{selectedTracks.size !== 1 ? "s" : ""}
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
                                    onClick={() => fileInputRef.current?.click()}
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
                                                    {(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-semibold">Drop your music file here</p>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Supports MP3, WAV, FLAC formats
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
                                            setUploadForm({ ...uploadForm, title: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="artist">Artist Name *</Label>
                                    <Input
                                        id="artist"
                                        placeholder="Enter artist name"
                                        value={uploadForm.artist}
                                        onChange={(e) =>
                                            setUploadForm({ ...uploadForm, artist: e.target.value })
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
                                            setUploadForm({ ...uploadForm, album: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="genre">Genre</Label>
                                    <select
                                        id="genre"
                                        value={uploadForm.genre}
                                        onChange={(e) =>
                                            setUploadForm({ ...uploadForm, genre: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select genre</option>
                                        <option value="pop">Pop</option>
                                        <option value="rock">Rock</option>
                                        <option value="hip-hop">Hip Hop</option>
                                        <option value="electronic">Electronic</option>
                                        <option value="jazz">Jazz</option>
                                        <option value="classical">Classical</option>
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
                                        setUploadForm({ ...uploadForm, description: e.target.value })
                                    }
                                />
                            </div>

                            {/* Upload Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleUploadSubmit}
                                    disabled={!uploadForm.file || !uploadForm.title || !uploadForm.artist}
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
