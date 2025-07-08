"use client";

import { useState, useRef, useEffect } from "react";
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
    ChevronUp,
    ImageIcon,
} from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    showImportSuccess,
    showError,
    showInfo,
    showProcessing,
    dismissNotifications,
} from "@/lib/services/notification-service";
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
    artists?: { id: string; name: string }[];
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

interface UserAlbum {
    id: number;
    title: string;
    cover_image_url: string | null;
    artist: {
        id: number;
        name: string;
    };
}

interface UserArtist {
    id: number;
    name: string;
    profile_image_url: string | null;
}

interface FileUploadData {
    title: string;
    genre: string;
    album: string;
    artist: string;
    description: string;
    file: File;
    isNewAlbum: boolean;
    isNewArtist: boolean;
    albumImage?: File;
    artistImage?: File;
}

interface Track {
    id: number;
    title: string;
    file_url: string;
    duration: number;
    audio_file_url: string;
    artist: {
        id: number;
        name: string;
    };
    album: {
        id: number;
        title: string;
        cover_image_url: string | null;
    };
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

    // Multiple file upload state
    const [uploadFiles, setUploadFiles] = useState<FileUploadData[]>([]);
    const [userAlbums, setUserAlbums] = useState<UserAlbum[]>([]);
    const [userArtists, setUserArtists] = useState<UserArtist[]>([]);
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
    const [loadingUserData, setLoadingUserData] = useState(false);

    // Recently uploaded tracks state
    const [recentlyUploaded, setRecentlyUploaded] = useState<Track[]>([]);
    const [recentlyImported, setRecentlyImported] = useState<Track[]>([]);

    const [fileInputRef] = useState<any>(useRef(null));
    const [albumImageInputRef] = useState<any>(useRef(null));
    const [artistImageInputRef] = useState<any>(useRef(null));
    const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);

    // Audio player context
    const {
        currentTrack,
        isPlaying,
        playTrack,
        togglePlayPause,
        setTrackList,
    } = useAudioPlayer();

    // Load user albums and artists when upload tab is active
    useEffect(() => {
        if (activeTab === "upload") {
            loadUserData();
        }
    }, [activeTab]);

    const loadUserData = async () => {
        setLoadingUserData(true);
        try {
            // Load user albums
            const albumsResponse = await fetch("/api/albums/user");
            if (albumsResponse.ok) {
                const albumsData = await albumsResponse.json();
                setUserAlbums(
                    albumsData.filter((album: any) => !album.from_spotify),
                );
            }

            // Load user artists
            const artistsResponse = await fetch("/api/artists/user");
            if (artistsResponse.ok) {
                const artistsData = await artistsResponse.json();
                setUserArtists(
                    artistsData.filter((artist: any) => !artist.from_spotify),
                );
            }

            // Load genres
            const genresResponse = await fetch("/api/genres");
            if (genresResponse.ok) {
                const genresData = await genresResponse.json();
                setGenres(genresData);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            showError("Failed to load albums, artists and genres");
        } finally {
            setLoadingUserData(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const validateImage = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = document.createElement("img");
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                if (img.width === 1400 && img.height === 1400) {
                    resolve(true);
                } else {
                    showError("Image must be exactly 1400x1400 pixels");
                    resolve(false);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                showError("Invalid image file");
                resolve(false);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleMultipleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            alert("Upload functionality will be implemented soon!");
        }
    };

    const updateFileData = (
        index: number,
        field: keyof FileUploadData,
        value: any,
    ) => {
        setUploadFiles((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const removeFile = (index: number) => {
        setUploadFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAlbumImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        fileIndex: number,
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const isValid = await validateImage(file);
            if (isValid) {
                updateFileData(fileIndex, "albumImage", file);
            }
        }
    };

    const handleArtistImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        fileIndex: number,
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const isValid = await validateImage(file);
            if (isValid) {
                updateFileData(fileIndex, "artistImage", file);
            }
        }
    };

    const handleSpotifySubmit = async () => {
        if (!spotifyUrl.trim()) {
            showError("Please enter a Spotify URL");
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
            if (data.type === "album") {
                // For albums, we need to fetch detailed track info
                const tracks = await fetchAlbumTracks(data.data.id);
                setSpotifyData((prev) => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        tracks: tracks,
                    },
                }));

                // Auto-select all tracks from this album
                setSelectedTracks((prev) => {
                    const newSelected = new Set(prev);
                    tracks.forEach((track: any) => {
                        newSelected.add(track.id);
                    });
                    return newSelected;
                });
            } else if (data.type === "playlist") {
                // For playlists, tracks are already included in the response
                // Auto-select all tracks from this playlist
                setSelectedTracks((prev) => {
                    const newSelected = new Set(prev);
                    data.data.tracks?.forEach((track: any) => {
                        newSelected.add(track.id);
                    });
                    return newSelected;
                });
            } else if (data.type === "track") {
                setSelectedTracks(new Set([String(data.data.id)]));
            }
        } catch (error) {
            console.error("Error:", error);
            showError({
                title: "Spotify Data Error",
                message:
                    "Cannot fetch information from Spotify. Please check the URL and try again.",
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
                title: "Album Tracks Error",
                message: "Cannot load track list from album. Please try again.",
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
        if (expandedAlbums.has(albumId)) {
            setExpandedAlbums((prev) => {
                const newSet = new Set(prev);
                newSet.delete(albumId);
                return newSet;
            });
            return;
        }

        setLoadingAlbums((prev) => new Set(prev).add(albumId));

        try {
            const response = await fetch("/api/spotify/album-tracks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ albumId }),
            });

            if (!response.ok) throw new Error("Failed to fetch album tracks");

            const { tracks } = await response.json();

            // Update the album with tracks in spotifyData
            setSpotifyData((prev: any) => {
                if (!prev || prev.type !== "artist") return prev;

                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        albums: prev.data.albums.map((album: any) =>
                            album.id === albumId 
                                ? { 
                                    ...album, 
                                    tracks: tracks.map((track: any) => ({
                                        ...track,
                                        artist_id: album.artist_id, // Use album's artist ID
                                        album_id: albumId, // Use album's Spotify ID
                                    }))
                                  } 
                                : album,
                        ),
                    },
                };
            });

            // Auto-select all tracks from this album
            setSelectedTracks((prev) => {
                const newSelected = new Set(prev);
                tracks.forEach((track: any) => {
                    newSelected.add(track.id);
                });
                return newSelected;
            });

            setExpandedAlbums((prev) => new Set(prev).add(albumId));
        } catch (error) {
            console.error("Error fetching album tracks:", error);
            showError("Failed to load album tracks");
        } finally {
            setLoadingAlbums((prev) => {
                const newSet = new Set(prev);
                newSet.delete(albumId);
                return newSet;
            });
        }
    };

    const handleUploadSubmit = async () => {
        if (uploadFiles.length === 0) {
            showError("Please select at least one audio file");
            return;
        }

        // Validate required fields for all files
        for (let i = 0; i < uploadFiles.length; i++) {
            const file = uploadFiles[i];
            if (!file.title || !file.genre || !file.album || !file.artist) {
                showError(
                    `Please fill all required fields for file ${i + 1}: ${file.file.name}`,
                );
                return;
            }

            if (file.isNewAlbum && !file.albumImage) {
                showError(
                    `Please upload album image for file ${i + 1}: ${file.file.name}`,
                );
                return;
            }

            if (file.isNewArtist && !file.artistImage) {
                showError(
                    `Please upload artist image for file ${i + 1}: ${file.file.name}`,
                );
                return;
            }
        }

        setIsLoading(true);
        // showProcessing("Uploading your music files...");

        try {
            const uploadedTracks: any[] = [];

            for (const fileData of uploadFiles) {
                const formData = new FormData();
                formData.append("audioFile", fileData.file);
                formData.append("title", fileData.title);
                formData.append("genre", fileData.genre);
                formData.append("album", fileData.album);
                formData.append("artist", fileData.artist);
                formData.append("description", fileData.description);
                formData.append("isNewAlbum", fileData.isNewAlbum.toString());
                formData.append("isNewArtist", fileData.isNewArtist.toString());

                if (fileData.albumImage) {
                    formData.append("albumImage", fileData.albumImage);
                }

                if (fileData.artistImage) {
                    formData.append("artistImage", fileData.artistImage);
                }

                const response = await fetch("/api/upload-music", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();

                    // Handle duplicate file error specifically
                    if (response.status === 409 && errorData.duplicate) {
                        toast.error("Duplicate File Detected", {
                            description: `This audio file is already uploaded as "${errorData.duplicate.title}" by ${errorData.duplicate.artist}`,
                            duration: 8000,
                        });
                        return; // Don't continue with upload
                    }

                    throw new Error(errorData.error || "Upload failed");
                }

                const result = await response.json();
                if (result.track) {
                    uploadedTracks.push(result.track);
                }
            }

            dismissNotifications();
            showInfo("All music files uploaded successfully!");

            // Load complete track info for recently uploaded tracks
            if (uploadedTracks.length > 0) {
                const trackIds = uploadedTracks.map(track => track.id);
                try {
                    const tracksResponse = await fetch(`/api/tracks?ids=${trackIds.join(',')}`);
                    if (tracksResponse.ok) {
                        const completeTracksData = await tracksResponse.json();
                        // Append new tracks to existing recently uploaded list
                        setRecentlyUploaded(prev => [...prev, ...completeTracksData]);
                    } else {
                        // Fallback to basic track info if detailed fetch fails
                        setRecentlyUploaded(prev => [...prev, ...uploadedTracks]);
                    }
                } catch (error) {
                    console.error("Error fetching complete track data:", error);
                    setRecentlyUploaded(prev => [...prev, ...uploadedTracks]);
                }
            }

            // Reload albums and artists lists
            await loadUserData();

            setUploadFiles([]);
            setOwnershipConfirmed(false);
        } catch (error) {
            dismissNotifications();
            console.error("Upload error:", error);
            showError({
                title: "Upload Failed",
                message: `Cannot upload files: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const submitSpotifyTracks = async () => {
        if (selectedTracks.size === 0) {
            showError("Please select at least one song to import");
            return;
        }

        setIsLoading(true);

        try {
            console.log("🎵 SUBMIT_SPOTIFY_TRACKS_START:", {
                spotifyDataType: spotifyData?.type,
                selectedTracksCount: selectedTracks.size,
                selectedTrackIds: Array.from(selectedTracks)
            });

            // Get selected track data
            const selectedTrackData: SpotifyTrack[] = [];

            if (spotifyData.type === "track") {
                console.log("📀 PROCESSING_SINGLE_TRACK:", spotifyData.data);
                selectedTrackData.push(spotifyData.data);
            } else if (
                spotifyData.type === "album" ||
                spotifyData.type === "playlist"
            ) {
                console.log("💿 PROCESSING_ALBUM_OR_PLAYLIST:", {
                    type: spotifyData.type,
                    totalTracks: spotifyData.data.tracks?.length || 0,
                    albumData: spotifyData.data
                });

                spotifyData.data.tracks.forEach((track: SpotifyTrack) => {
                    if (selectedTracks.has(track.id)) {
                        console.log("✅ ADDING_TRACK_FROM_ALBUM/PLAYLIST:", {
                            trackId: track.id,
                            trackName: track.name,
                            artist: track.artist,
                            album: track.album,
                            artist_id: track.artist_id,
                            album_id: track.album_id
                        });
                        selectedTrackData.push(track);
                    }
                });
            } else if (spotifyData.type === "artist") {
                console.log("🎤 PROCESSING_ARTIST:", {
                    artistName: spotifyData.data.name,
                    albumsCount: spotifyData.data.albums?.length || 0,
                    artistData: spotifyData.data
                });

                spotifyData.data.albums.forEach((album: SpotifyAlbum) => {
                    console.log("💿 PROCESSING_ALBUM_FROM_ARTIST:", {
                        albumId: album.id,
                        albumName: album.name,
                        tracksCount: album.tracks?.length || 0,
                        albumData: album
                    });

                    album.tracks?.forEach((track: SpotifyTrack) => {
                        if (selectedTracks.has(track.id)) {
                            console.log("✅ ADDING_TRACK_FROM_ARTIST_ALBUM:", {
                                trackId: track.id,
                                trackName: track.name,
                                artist: track.artist,
                                album: track.album,
                                artist_id: track.artist_id,
                                album_id: track.album_id,
                                albumFromArtist: album
                            });
                            selectedTrackData.push(track);
                        }
                    });
                });
            }

            console.log("🎯 SELECTED_TRACK_DATA_COLLECTED:", {
                count: selectedTrackData.length,
                tracks: selectedTrackData
            });
            const tracksToImport = selectedTrackData.map((track) => {
                console.log("🔄 MAPPING_TRACK:", {
                    originalTrack: track,
                    spotifyDataType: spotifyData.type,
                    spotifyDataArtistId: spotifyData.data.artist_id,
                    spotifyDataId: spotifyData.data.id
                });

                const mappedTrack = {
                    id: track.id,
                    name: track.name,
                    artist: track.artist,
                    album: track.album,
                    duration: track.duration,
                    image: track.image,
                    isrc: track.isrc,
                    preview_url: track.preview_url,
                    artists: track.artists || [
                        {
                            // Use real Spotify artist ID if available, otherwise use generated ID
                            id: track.artist_id && !track.artist_id.startsWith('artist_') 
                                ? track.artist_id 
                                : (spotifyData.type === "album" || spotifyData.type === "playlist") 
                                    ? spotifyData.data.artist_id || `artist_${track.id}`
                                    : `artist_${track.id}`,
                            name: track.artist,
                            // Pass artist genres for artist imports
                            genres: spotifyData.type === "artist" ? spotifyData.data.genres : undefined,
                        },
                    ],
                    album_data: {
                        // Use real Spotify album ID if available, otherwise use generated ID
                        id: track.album_id && !track.album_id.startsWith('album_') 
                            ? track.album_id 
                            : (spotifyData.type === "album") 
                                ? spotifyData.data.id 
                                : track.album_id || `album_${track.id}`,
                        release_date: track.release_date || 
                                     (spotifyData.type === "album" ? spotifyData.data.release_date : null) ||
                                     (spotifyData.type === "playlist" ? null : null),
                        description: null,
                    },
                };

                console.log("✅ MAPPED_TRACK_RESULT:", {
                    trackId: track.id,
                    trackName: track.name,
                    artistId: mappedTrack.artists[0].id,
                    albumId: mappedTrack.album_data.id,
                    fullMappedTrack: mappedTrack
                });

                return mappedTrack;
            });

            console.log("🚀 FINAL_TRACKS_TO_IMPORT:", {
                count: tracksToImport.length,
                tracks: tracksToImport
            });
            // Call import API
            console.log("📡 CALLING_IMPORT_API:", {
                endpoint: "/api/import-music",
                tracksCount: tracksToImport.length,
                requestBody: { tracks: tracksToImport }
            });

            const response = await fetch("/api/import-music", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tracks: tracksToImport }),
            });

            console.log("📨 API_RESPONSE_STATUS:", {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            let result;
            try {
                result = await response.json();
                console.log("📝 RAW_API_RESPONSE:", result);
                console.log("Response structure:", {
                    hasResults: !!result?.results,
                    resultsKeys: result?.results
                        ? Object.keys(result.results)
                        : "No results object",
                    directSuccess: result?.success,
                    directFailed: result?.failed,
                    nestedSuccess: result?.results?.success,
                    nestedFailed: result?.results?.failed,
                    errors: result?.results?.errors || result?.errors,
                });
            } catch (parseError) {
                console.error("Failed to parse response:", parseError);
                throw new Error("Invalid server response");
            }

            if (!response.ok) {
                const errorMessage =
                    result?.error ||
                    result?.message ||
                    "Failed to import tracks";
                throw new Error(errorMessage);
            }

            // Parse the results properly from the API response with defensive programming
            let successCount = 0;
            let failedCount = 0;

            // Handle different possible response structures
            if (result?.results && typeof result.results === "object") {
                // Nested structure: {results: {success: 1, failed: 0}}
                successCount = result.results.success || 0;
                failedCount = result.results.failed || 0;
            } else if (result && typeof result.success !== "undefined") {
                // Direct structure: {success: 1, failed: 0}
                successCount = result.success || 0;
                failedCount = result.failed || 0;
            } else {
                console.warn("Unexpected response structure:", result);
                // Fallback: assume all failed
                failedCount = tracksToImport.length;
            }

            const totalTracks = tracksToImport.length;

            console.log("Final parsed counts:", {
                successCount,
                failedCount,
                totalTracks,
            });

            // Show beautiful notification after processing all tracks
            showImportSuccess({
                totalTracks,
                successCount,
                failedCount,
                albumName:
                    spotifyData.type === "album"
                        ? spotifyData.data.name
                        : undefined,
                artistName:
                    spotifyData.type === "artist"
                        ? spotifyData.data.name
                        : undefined,
            });

             // Load complete track info for recently uploaded tracks
             if (tracksToImport.length > 0) {
                // Convert SpotifyTrack to Track format
                const importedTracks = tracksToImport.map(track => ({
                    id: stringToHash(`spotify-${track.id}`),
                    title: track.name,
                    file_url: track.preview_url
                        ? `/api/proxy-audio?url=${encodeURIComponent(track.preview_url)}`
                        : "",
                    duration: track.duration,
                    audio_file_url: track.preview_url
                        ? `/api/proxy-audio?url=${encodeURIComponent(track.preview_url)}`
                        : "",
                    artist: {
                        id: "spotify-artist",
                        name: track.artist,
                    },
                    album: {
                        id: stringToHash(track.id),
                        title: track.album,
                        cover_image_url: track.image,
                    },
                }));
                setRecentlyImported(prev => [...prev, ...importedTracks]);
            }

            // Reset form
            setSpotifyData(null);
            setSelectedTracks(new Set());
            setSpotifyUrl("");
            setOwnershipConfirmed(false);
        } catch (error) {
            console.error("Import error:", error);
            showError({
                title: "Import Failed",
                message: `Cannot import tracks: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const stringToHash = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    const handlePlayTrack = (track: SpotifyTrack) => {
        if (!track.preview_url) {
            showError("Không có bản preview cho bài hát này");
            return;
        }

        // Convert SpotifyTrack to Track format similar to music/music-upload.tsx
        const trackToPlay = {
            id: stringToHash(`spotify-${track.id}`),
            title: track.name,
            file_url: track.preview_url
                ? `/api/proxy-audio?url=${encodeURIComponent(track.preview_url)}`
                : "",
            duration: track.duration,
            audio_file_url: track.preview_url
                ? `/api/proxy-audio?url=${encodeURIComponent(track.preview_url)}`
                : "",
            artist: {
                id: "spotify-artist",
                name: track.artist,
            },
            album: {
                id: stringToHash(track.id),
                title: track.album,
                cover_image_url: track.image,
            },
        };

        // Create track list for navigation
        let allTracks: any[] = [];

        if (spotifyData?.type === "track") {
            allTracks = [trackToPlay];
        } else if (
            spotifyData?.type === "album" ||
            spotifyData?.type === "playlist"
        ) {
            allTracks = spotifyData.data.tracks
                .filter((t: SpotifyTrack) => t.preview_url)
                .map((t: SpotifyTrack) => ({
                    id: `spotify-${t.id}`,
                    title: t.name,
                    file_url: t.preview_url
                        ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}`
                        : "",
                    duration: t.duration,
                    audio_file_url: t.preview_url
                        ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}`
                        : "",
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
                                file_url: t.preview_url
                                    ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}`
                                    : "",
                                duration: t.duration,
                                audio_file_url: t.preview_url
                                    ? `/api/proxy-audio?url=${encodeURIComponent(t.preview_url)}`
                                    : "",
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
        const currentTrackId = currentTrack?.id;
        const newTrackId = stringToHash(`spotify-${track.id}`);
        if (currentTrackId === newTrackId && isPlaying) {
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
                                        <span>ArtistURLs</span>
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
                                                        src={
                                                            spotifyData.data
                                                                .image ||
                                                            "/images/soundhex.png"
                                                        }
                                                        alt={
                                                            spotifyData.data
                                                                .name
                                                        }
                                                        width={80}
                                                        height={80}
                                                        className="rounded-lg object-cover"
                                                    />
                                                    {spotifyData.data
                                                        .preview_url && (
                                                        <Button
                                                            size="sm"
                                                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full p-0"
                                                            onClick={() =>
                                                                handlePlayTrack(
                                                                    spotifyData.data,
                                                                )
                                                            }
                                                        >
                                                            {currentTrack?.id ===
                                                                stringToHash(
                                                                    `spotify-${spotifyData.data.id}`,
                                                                ) &&
                                                            isPlaying ? (
                                                                <Pause className="h-3 w-3" />
                                                            ) : (
                                                                <Play className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">
                                                        {spotifyData.data.name}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {
                                                            spotifyData.data
                                                                .artist
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {spotifyData.data.album}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span>
                                                            {formatDuration(
                                                                spotifyData.data
                                                                    .duration,
                                                            )}
                                                        </span>
                                                        {spotifyData.data
                                                            .isrc && (
                                                            <span>
                                                                ISRC:{" "}
                                                                {
                                                                    spotifyData
                                                                        .data
                                                                        .isrc
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            selectedTracks.has(
                                                                spotifyData.data
                                                                    .id,
                                                            )
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {selectedTracks.has(
                                                            spotifyData.data.id,
                                                        )
                                                            ? "Selected"
                                                            : "Not Selected"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Album or Playlist */}
                                    {(spotifyData.type === "album" ||
                                        spotifyData.type === "playlist") && (
                                        <div className="space-y-6">
                                            {/* Album/Playlist Header */}
                                            <div className="flex items-start gap-6">
                                                <Image
                                                    src={
                                                        spotifyData.data
                                                            .image ||
                                                        "/images/soundhex.png"
                                                    }
                                                    alt={spotifyData.data.name}
                                                    width={160}
                                                    height={160}
                                                    className="rounded-lg shadow-lg object-cover"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="mb-2"
                                                    >
                                                        {spotifyData.type ===
                                                        "album"
                                                            ? "Album"
                                                            : "Playlist"}
                                                    </Badge>
                                                    <h3 className="text-2xl font-bold">
                                                        {spotifyData.data.name}
                                                    </h3>
                                                    <p className="text-lg text-gray-600 dark:text-gray-400">
                                                        {
                                                            spotifyData.data
                                                                .artist
                                                        }
                                                    </p>
                                                    {spotifyData.data
                                                        .release_date && (
                                                        <p className="text-sm text-gray-500">
                                                            Released:{" "}
                                                            {
                                                                spotifyData.data
                                                                    .release_date
                                                            }
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500">
                                                        {spotifyData.data.tracks
                                                            ?.length || 0}{" "}
                                                        tracks
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Track Selection */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">
                                                        Select tracks to import:
                                                    </h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const allTrackIds =
                                                                spotifyData.data.tracks.map(
                                                                    (
                                                                        t: SpotifyTrack,
                                                                    ) => t.id,
                                                                );
                                                            if (
                                                                selectedTracks.size ===
                                                                allTrackIds.length
                                                            ) {
                                                                setSelectedTracks(
                                                                    new Set(),
                                                                );
                                                            } else {
                                                                setSelectedTracks(
                                                                    new Set(
                                                                        allTrackIds,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {selectedTracks.size ===
                                                        spotifyData.data.tracks
                                                            ?.length
                                                            ? "Deselect All"
                                                            : "Select All"}
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    {spotifyData.data.tracks?.map(
                                                        (
                                                            track: SpotifyTrack,
                                                            index: number,
                                                        ) => (
                                                            <div
                                                                key={track.id}
                                                                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                                    selectedTracks.has(
                                                                        track.id,
                                                                    )
                                                                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                                                                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                }`}
                                                                onClick={() =>
                                                                    toggleTrackSelection(
                                                                        track.id,
                                                                    )
                                                                }
                                                            >
                                                                <div className="w-6 h-6 flex items-center justify-center">
                                                                    {selectedTracks.has(
                                                                        track.id,
                                                                    ) ? (
                                                                        <Check className="h-4 w-4 text-purple-600" />
                                                                    ) : (
                                                                        <span className="text-sm text-gray-400">
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="relative">
                                                                    <Image
                                                                        src={
                                                                            track.image ||
                                                                            spotifyData
                                                                                .data
                                                                                .image ||
                                                                            "/images/soundhex.png"
                                                                        }
                                                                        alt={
                                                                            track.name
                                                                        }
                                                                        width={
                                                                            48
                                                                        }
                                                                        height={
                                                                            48
                                                                        }
                                                                        className="rounded object-cover"
                                                                    />
                                                                    {track.preview_url && (
                                                                        <Button
                                                                            size="sm"
                                                                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                handlePlayTrack(
                                                                                    track,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {currentTrack?.id ===
                                                                                stringToHash(
                                                                                    `spotify-${spotifyData.data.id}`,
                                                                                ) &&
                                                                            isPlaying ? (
                                                                                <Pause className="h-2 w-2" />
                                                                            ) : (
                                                                                <Play className="h-2 w-2" />
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium truncate">
                                                                        {
                                                                            track.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                        {
                                                                            track.artist
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                    <span>
                                                                        {formatDuration(
                                                                            track.duration,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
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
                                                    src={
                                                        spotifyData.data
                                                            .image ||
                                                        "/images/soundhex.png"
                                                    }
                                                    alt={spotifyData.data.name}
                                                    width={160}
                                                    height={160}
                                                    className="rounded-lg shadow-lg object-cover"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="mb-2"
                                                    >
                                                        Artist
                                                    </Badge>
                                                    <h3 className="text-2xl font-bold">
                                                        {spotifyData.data.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {spotifyData.data.albums
                                                            ?.length || 0}{" "}
                                                        albums
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Albums List */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">
                                                    Select albums to import:
                                                </h4>
                                                {spotifyData.data.albums.map(
                                                    (album: SpotifyAlbum) => (
                                                        <div
                                                            key={album.id}
                                                            className="border rounded-lg p-4"
                                                        >
                                                            <div
                                                                className="flex items-center gap-4 cursor-pointer"
                                                                onClick={() =>
                                                                    toggleAlbumExpansion(
                                                                        album.id,
                                                                    )
                                                                }
                                                            >
                                                                <Image
                                                                    src={
                                                                        album.image ||
                                                                        "/images/soundhex.png"
                                                                    }
                                                                    alt={
                                                                        album.name
                                                                    }
                                                                    width={64}
                                                                    height={64}
                                                                    className="rounded object-cover"
                                                                />
                                                                <div className="flex-1">
                                                                    <h5 className="font-medium">
                                                                        {
                                                                            album.name
                                                                        }
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {
                                                                            album.artist
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            album.release_date
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {loadingAlbums.has(
                                                                        album.id,
                                                                    ) ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : expandedAlbums.has(
                                                                          album.id,
                                                                      ) ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {expandedAlbums.has(
                                                                album.id,
                                                            ) &&
                                                                album.tracks &&
                                                                album.tracks
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-4 space-y-2">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                                Select
                                                                                tracks
                                                                                from
                                                                                this
                                                                                album:
                                                                            </span>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    const allAlbumTrackIds =
                                                                                        album.tracks.map(
                                                                                            (
                                                                                                t: SpotifyTrack,
                                                                                            ) =>
                                                                                                t.id,
                                                                                        );
                                                                                    const allSelected =
                                                                                        allAlbumTrackIds.every(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                selectedTracks.has(
                                                                                                    id,
                                                                                                ),
                                                                                        );

                                                                                    if (
                                                                                        allSelected
                                                                                    ) {
                                                                                        // Deselect all tracks from this album
                                                                                        const newSelection =
                                                                                            new Set(
                                                                                                selectedTracks,
                                                                                            );
                                                                                        allAlbumTrackIds.forEach(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                newSelection.delete(
                                                                                                    id,
                                                                                                ),
                                                                                        );
                                                                                        setSelectedTracks(
                                                                                            newSelection,
                                                                                        );
                                                                                    } else {
                                                                                        // Select all tracks from this album
                                                                                        const newSelection =
                                                                                            new Set(
                                                                                                selectedTracks,
                                                                                            );
                                                                                        allAlbumTrackIds.forEach(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                newSelection.add(
                                                                                                    id,
                                                                                                ),
                                                                                        );
                                                                                        setSelectedTracks(
                                                                                            newSelection,
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {album.tracks.every(
                                                                                    (
                                                                                        t: SpotifyTrack,
                                                                                    ) =>
                                                                                        selectedTracks.has(
                                                                                            t.id,
                                                                                        ),
                                                                                )
                                                                                    ? "Deselect All"
                                                                                    : "Select All"}
                                                                            </Button>
                                                                        </div>

                                                                        <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                                                            {album.tracks.map(
                                                                                (
                                                                                    track: SpotifyTrack,
                                                                                    index: number,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            track.id
                                                                                        }
                                                                                        className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                                                            selectedTracks.has(
                                                                                                track.id,
                                                                                            )
                                                                                                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                                                                                                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                                        }`}
                                                                                        onClick={() =>
                                                                                            toggleTrackSelection(
                                                                                                track.id,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                                                            {selectedTracks.has(
                                                                                                track.id,
                                                                                            ) ? (
                                                                                                <Check className="h-4 w-4 text-purple-600" />
                                                                                            ) : (
                                                                                                <span className="text-sm text-gray-400">
                                                                                                    {index +
                                                                                                        1}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>{" "}
                                                                                        <div className="relative">
                                                                                            <Image
                                                                                                src={
                                                                                                    track.image ||
                                                                                                    album.image ||
                                                                                                    "/images/soundhex.png"
                                                                                                }
                                                                                                alt={
                                                                                                    track.name
                                                                                                }
                                                                                                width={
                                                                                                    48
                                                                                                }
                                                                                                height={
                                                                                                    48
                                                                                                }
                                                                                                className="rounded object-cover"
                                                                                            />
                                                                                            {track.preview_url && (
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0"
                                                                                                    onClick={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        e.stopPropagation();
                                                                                                        handlePlayTrack(
                                                                                                            track,
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    {currentTrack?.id ===
                                                                                                        stringToHash(
                                                                                                            `spotify-${spotifyData.data.id}`,
                                                                                                        ) &&
                                                                                                    isPlaying ? (
                                                                                                        <Pause className="h-2 w-2" />
                                                                                                    ) : (
                                                                                                        <Play className="h-2 w-2" />
                                                                                                    )}
                                                                                                </Button>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="font-medium truncate">
                                                                                                {
                                                                                                    track.name
                                                                                                }
                                                                                            </p>
                                                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                                                {
                                                                                                    track.artist
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                                            <span>
                                                                                                {formatDuration(
                                                                                                    track.duration,
                                                                                                )}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ownership Confirmation */}
                                    <div className="border-t pt-6">
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-purple-700">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            id="ownership-confirmation"
                                                            checked={
                                                                ownershipConfirmed
                                                            }
                                                            onChange={(e) =>
                                                                setOwnershipConfirmed(
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                            className="sr-only"
                                                        />
                                                        <label
                                                            htmlFor="ownership-confirmation"
                                                            className={`flex items-center justify-center w-6 h-6 rounded-md border-2 cursor-pointer transition-all duration-200 ${
                                                                ownershipConfirmed
                                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-600 text-white shadow-lg"
                                                                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                                                            }`}
                                                        >
                                                            {ownershipConfirmed && (
                                                                <Check className="h-4 w-4 text-white" />
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor="ownership-confirmation"
                                                        className="cursor-pointer"
                                                    >
                                                        <div className="mb-3">
                                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                                Copyright &
                                                                Ownership
                                                                Declaration
                                                            </span>
                                                        </div>
                                                        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                                By checking this
                                                                box, I hereby
                                                                confirm and
                                                                declare that:
                                                            </p>
                                                            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <li className="flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span>
                                                                        I am the
                                                                        rightful
                                                                        owner or
                                                                        have
                                                                        proper
                                                                        legal
                                                                        authorization
                                                                        to
                                                                        upload
                                                                        and
                                                                        distribute
                                                                        the
                                                                        selected
                                                                        music
                                                                        tracks
                                                                    </span>
                                                                </li>
                                                                <li className="flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span>
                                                                        I
                                                                        understand
                                                                        that
                                                                        uploading
                                                                        copyrighted
                                                                        material
                                                                        without
                                                                        permission
                                                                        is
                                                                        strictly
                                                                        prohibited
                                                                        and may
                                                                        result
                                                                        in legal
                                                                        consequences
                                                                    </span>
                                                                </li>
                                                                <li className="flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span>
                                                                        I take
                                                                        full
                                                                        responsibility
                                                                        for
                                                                        ensuring
                                                                        all
                                                                        uploaded
                                                                        content
                                                                        complies
                                                                        with
                                                                        copyright
                                                                        laws and
                                                                        licensing
                                                                        requirements
                                                                    </span>
                                                                </li>
                                                                <li className="flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span>
                                                                        I
                                                                        acknowledge
                                                                        that
                                                                        false
                                                                        declarations
                                                                        may
                                                                        result
                                                                        in
                                                                        account
                                                                        suspension
                                                                        and
                                                                        legal
                                                                        action
                                                                    </span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={submitSpotifyTracks}
                                            disabled={
                                                selectedTracks.size === 0 ||
                                                !ownershipConfirmed ||
                                                isLoading
                                            }
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    Import {selectedTracks.size}{" "}
                                                    Track
                                                    {selectedTracks.size !== 1
                                                        ? "s"
                                                        : ""}
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
                                Upload Music Files
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Multiple File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="music-files">
                                    Audio Files{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div
                                    className="border border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 hover:border-purple-400 transition-colors bg-purple-50/50 dark:bg-purple-900/20 cursor-pointer"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items```python
-center justify-center mx-auto">
                                            <Upload className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                Drop your music files here or
                                                click to browse
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Supports MP3, WAV, FLAC formats
                                                • Multiple files allowed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    multiple
                                    onChange={handleMultipleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            {uploadFiles.length > 0 && (
                                <>
                                    <Separator />

                                    {/* Uploaded Files List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">
                                                Uploaded Files (
                                                {uploadFiles.length})
                                            </h3>
                                            {loadingUserData && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading albums & artists...
                                                </div>
                                            )}
                                        </div>

                                        {uploadFiles.map((fileData, index) => (
                                            <div
                                                key={index}
                                                className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800/50"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Music className="h-5 w-5 text-purple-600" />
                                                        <div>
                                                            <h4 className="font-medium">
                                                                {
                                                                    fileData
                                                                        .file
                                                                        .name
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {(
                                                                    fileData
                                                                        .file
                                                                        .size /
                                                                    (1024 *
                                                                        1024)
                                                                ).toFixed(
                                                                    2,
                                                                )}{" "}
                                                                MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeFile(index)
                                                        }
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {/* Track Title */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`title-${index}`}
                                                        >
                                                            Track Title{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id={`title-${index}`}
                                                            placeholder="Enter track title"
                                                            value={
                                                                fileData.title
                                                            }
                                                            onChange={(e) =>
                                                                updateFileData(
                                                                    index,
                                                                    "title",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {/* Genre */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`genre-${index}`}
                                                        >
                                                            Genre{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <select
                                                            id={`genre-${index}`}
                                                            value={
                                                                fileData.genre
                                                            }
                                                            onChange={(e) =>
                                                                updateFileData(
                                                                    index,
                                                                    "genre",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                                        >
                                                            <option value="">
                                                                Select genre
                                                            </option>
                                                            {genres.map(
                                                                (genre) => (
                                                                    <option
                                                                        key={
                                                                            genre.id
                                                                        }
                                                                        value={
                                                                            genre.name
                                                                        }
                                                                    >
                                                                        {
                                                                            genre.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* Album */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`album-${index}`}
                                                        >
                                                            Album{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <div className="space-y-3">
                                                            {/* Custom Album Selector */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Select
                                                                    existing
                                                                    album:
                                                                </Label>
                                                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
                                                                    {userAlbums.map(
                                                                        (
                                                                            album,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    album.id
                                                                                }
                                                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                                                                    !fileData.isNewAlbum &&
                                                                                    fileData.album ===
                                                                                        album.title
                                                                                        ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-600"
                                                                                        : "hover:bg-white dark:hover:bg-gray-700 border border-transparent"
                                                                                }`}
                                                                                onClick={() => {
                                                                                    updateFileData(
                                                                                        index,
                                                                                        "isNewAlbum",
                                                                                        false,
                                                                                    );
                                                                                    updateFileData(
                                                                                        index,
                                                                                        "album",
                                                                                        album.title,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                                                    {album.cover_image_url ? (
                                                                                        <Image
                                                                                            src={
                                                                                                album.cover_image_url
                                                                                            }
                                                                                            alt={
                                                                                                album.title
                                                                                            }
                                                                                            width={
                                                                                                40
                                                                                            }
                                                                                            height={
                                                                                                40
                                                                                            }
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                                                            <Album className="h-4 w-4 text-white" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-sm truncate">
                                                                                        {
                                                                                            album.title
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 truncate">
                                                                                        {
                                                                                            album
                                                                                                .artist
                                                                                                .name
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                {!fileData.isNewAlbum &&
                                                                                    fileData.album ===
                                                                                        album.title && (
                                                                                        <Check className="h-4 w-4 text-purple-600" />
                                                                                    )}
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Create New Album Option */}
                                                            <div
                                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-dashed ${
                                                                    fileData.isNewAlbum
                                                                        ? "border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                                                        : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                                                                }`}
                                                                onClick={() => {
                                                                    updateFileData(
                                                                        index,
                                                                        "isNewAlbum",
                                                                        true,
                                                                    );
                                                                    updateFileData(
                                                                        index,
                                                                        "album",
                                                                        "",
                                                                    );
                                                                }}
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0">
                                                                    <Plus className="h-4 w-4 text-white" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-sm">
                                                                        Create
                                                                        new
                                                                        album
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Add a
                                                                        new
                                                                        album to
                                                                        your
                                                                        library
                                                                    </p>
                                                                </div>
                                                                {fileData.isNewAlbum && (
                                                                    <Check className="h-4 w-4 text-purple-600" />
                                                                )}
                                                            </div>

                                                            {fileData.isNewAlbum && (
                                                                <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                                                    <Input
                                                                        placeholder="Enter new album name"
                                                                        value={
                                                                            fileData.album
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateFileData(
                                                                                index,
                                                                                "album",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Album Cover Upload */}
                                                                    <div className="space-y-3">
                                                                        <Label>
                                                                            Album
                                                                            Cover
                                                                            (1400x1400px){" "}
                                                                            <span className="text-red-500">
                                                                                *
                                                                            </span>
                                                                        </Label>
                                                                        <div
                                                                            className="w-32 h-32 rounded-lg overflow-hidden border border-dashed border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors mx-auto"
                                                                            onClick={() =>
                                                                                albumImageInputRef.current?.click()
                                                                            }
                                                                        >
                                                                            {fileData.albumImage ? (
                                                                                <Image
                                                                                    src={URL.createObjectURL(
                                                                                        fileData.albumImage,
                                                                                    )}
                                                                                    alt="Album cover preview"
                                                                                    width={
                                                                                        128
                                                                                    }
                                                                                    height={
                                                                                        128
                                                                                    }
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                                                                    <ImageIcon className="h-8 w-8 text-purple-400 mb-2" />
                                                                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                                                        Click
                                                                                        to
                                                                                        upload
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        1400x1400px
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <input
                                                                            ref={
                                                                                albumImageInputRef
                                                                            }
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleAlbumImageUpload(
                                                                                    e,
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="hidden"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Artist */}
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`artist-${index}`}
                                                        >
                                                            Artist{" "}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <div className="space-y-3">
                                                            {/* Custom Artist Selector */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Select
                                                                    existing
                                                                    artist:
                                                                </Label>
                                                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
                                                                    {userArtists.map(
                                                                        (
                                                                            artist,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    artist.id
                                                                                }
                                                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                                                                    !fileData.isNewArtist &&
                                                                                    fileData.artist ===
                                                                                        artist.name
                                                                                        ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600"
                                                                                        : "hover:bg-white dark:hover:bg-gray-700 border border-transparent"
                                                                                }`}
                                                                                onClick={() => {
                                                                                    updateFileData(
                                                                                        index,
                                                                                        "isNewArtist",
                                                                                        false,
                                                                                    );
                                                                                    updateFileData(
                                                                                        index,
                                                                                        "artist",
                                                                                        artist.name,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                                                                    {artist.profile_image_url ? (
                                                                                        <Image
                                                                                            src={
                                                                                                artist.profile_image_url
                                                                                            }
                                                                                            alt={
                                                                                                artist.name
                                                                                            }
                                                                                            width={
                                                                                                40
                                                                                            }
                                                                                            height={
                                                                                                40
                                                                                            }
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                                                                                            <Users className="h-4 w-4 text-white" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-sm truncate">
                                                                                        {
                                                                                            artist.name
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        Artist
                                                                                    </p>
                                                                                </div>
                                                                                {!fileData.isNewArtist &&
                                                                                    fileData.artist ===
                                                                                        artist.name && (
                                                                                        <Check className="h-4 w-4 text-blue-600" />
                                                                                    )}
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Create New Artist Option */}
                                                            <div
                                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-dashed ${
                                                                    fileData.isNewArtist
                                                                        ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                                                        : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                                                                }`}
                                                                onClick={() => {
                                                                    updateFileData(
                                                                        index,
                                                                        "isNewArtist",
                                                                        true,
                                                                    );
                                                                    updateFileData(
                                                                        index,
                                                                        "artist",
                                                                        "",
                                                                    );
                                                                }}
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0">
                                                                    <Plus className="h-4 w-4 text-white" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-sm">
                                                                        Create
                                                                        new
                                                                        artist
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Add a
                                                                        new
                                                                        artist
                                                                        to your
                                                                        library
                                                                    </p>
                                                                </div>
                                                                {fileData.isNewArtist && (
                                                                    <Check className="h-4 w-4 text-blue-600" />
                                                                )}
                                                            </div>

                                                            {fileData.isNewArtist && (
                                                                <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                                                    <Input
                                                                        placeholder="Enter new artist name"
                                                                        value={
                                                                            fileData.artist
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateFileData(
                                                                                index,
                                                                                "artist",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />

                                                                    {/* Artist Photo Upload */}
                                                                    <div className="space-y-3">
                                                                        <Label>
                                                                            Artist
                                                                            Photo
                                                                            (1400x1400px){" "}
                                                                            <span className="text-red-500">
                                                                                *
                                                                            </span>
                                                                        </Label>
                                                                        <div
                                                                            className="w-32 h-32 rounded-full overflow-hidden border border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors mx-auto"
                                                                            onClick={() =>
                                                                                artistImageInputRef.current?.click()
                                                                            }
                                                                        >
                                                                            {fileData.artistImage ? (
                                                                                <Image
                                                                                    src={URL.createObjectURL(
                                                                                        fileData.artistImage,
                                                                                    )}
                                                                                    alt="Artist photo preview"
                                                                                    width={
                                                                                        128
                                                                                    }
                                                                                    height={
                                                                                        128
                                                                                    }
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                                                                    <Users className="h-8 w-8 text-blue-400 mb-2" />
                                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                                        Click
                                                                                        to
                                                                                        upload
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        1400x1400px
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <input
                                                                            ref={
                                                                                artistImageInputRef
                                                                            }
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleArtistImageUpload(
                                                                                    e,
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="hidden"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="mt-4 space-y-2">
                                                    <Label
                                                        htmlFor={`description-${index}`}
                                                    >
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id={`description-${index}`}
                                                        placeholder="Tell us about your track..."
                                                        rows={3}
                                                        value={
                                                            fileData.description
                                                        }
                                                        onChange={(e) =>
                                                            updateFileData(
                                                                index,
                                                                "description",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Ownership Confirmation */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-purple-700">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id="upload-ownership-confirmation"
                                                        checked={
                                                            ownershipConfirmed
                                                        }
                                                        onChange={(e) =>
                                                            setOwnershipConfirmed(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />
                                                    <label
                                                        htmlFor="upload-ownership-confirmation"
                                                        className={`flex items-center justify-center w-6 h-6 rounded-md border-2 cursor-pointer transition-all duration-200 ${
                                                            ownershipConfirmed
                                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-600 text-white shadow-lg"
                                                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                                                        }`}
                                                    >
                                                        {ownershipConfirmed && (
                                                            <Check className="h-4 w-4 text-white" />
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <label
                                                    htmlFor="upload-ownership-confirmation"
                                                    className="cursor-pointer"
                                                >
                                                    <div className="mb-3">
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                            Copyright &
                                                            Ownership
                                                            Declaration
                                                        </span>
                                                    </div>
                                                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            By checking this
                                                            box, I confirm that
                                                            I own all rights to
                                                            the uploaded music
                                                            files.
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={handleUploadSubmit}
                                            disabled={
                                                uploadFiles.length === 0 ||
                                                !ownershipConfirmed ||
                                                isLoading
                                            }
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload {uploadFiles.length}{" "}
                                                    Track
                                                    {uploadFiles.length !== 1
                                                        ? "s"
                                                        : ""}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Recently Uploaded Tracks */}
                {recentlyUploaded.length > 0 && (
                    <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                    <Music className="h-4 w-4 text-white" />
                                </div>
                                Recently Uploaded Tracks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {recentlyUploaded.map((track, index) => (
                                    <div
                                        key={track.id || index}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                {track.album?.cover_image_url ? (
                                                    <Image
                                                        src={track.album.cover_image_url}
                                                        alt={track.album.title || "Album cover"}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <Music className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">
                                                {track.title || "Unknown Title"}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {track.artist?.name || "Unknown Artist"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {track.album?.title || "Unknown Album"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{formatDuration(track.duration)}</span>
                                            <Badge variant="outline" className="text-xs">
                                                Just uploaded
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recently Imported Tracks */}
                {recentlyImported.length > 0 && (
                    <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Download className="h-4 w-4 text-white" />
                                </div>
                                Recently Imported from Spotify
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {recentlyImported.map((track, index) => (
                                    <div
                                        key={track.id || index}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                {track.album?.cover_image_url ? (
                                                    <Image
                                                        src={track.album.cover_image_url}
                                                        alt={track.album.title || "Album cover"}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <Music className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">
                                                {track.title || "Unknown Title"}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {track.artist?.name || "Unknown Artist"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {track.album?.title || "Unknown Album"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{formatDuration(track.duration)}</span>
                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                Imported from Spotify
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

async function fetchAlbumTracks(albumId: string): Promise<any[]> {
    try {
        const response = await fetch("/api/spotify/album-tracks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ albumId }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch album tracks");
        }

        const { tracks } = await response.json();
        return tracks;
    } catch (error) {
        console.error("Error fetching album tracks:", error);
        return [];
    }
}

async function fetchPlaylistTracks(playlistId: string): Promise<any[]> {
    try {
        const response = await fetch("/api/spotify/playlist-tracks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playlistId }),
});

        if (!response.ok) {
            throw new Error("Failed to fetch playlist tracks");
        }

        const { tracks } = await response.json();
        return tracks;
    } catch (error) {
        console.error("Error fetching playlist tracks:", error);
        return [];
    }
}