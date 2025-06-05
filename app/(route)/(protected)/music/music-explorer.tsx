"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
    Music,
    Search,
    Upload,
    Play,
    Heart,
    Share,
    TrendingUp,
    Clock,
    Headphones,
    Filter,
    Plus,
    Shuffle,
    SkipForward
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Track } from "@/lib/definitions/Track";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";


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
    const [selectedMood, setSelectedMood] = useState<string>("all");
    const [currentView, setCurrentView] = useState<"featured" | "library" | "upload">("featured");

    const { currentTrack, isPlaying, playTrack } = useAudioPlayer();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get unique genres from tracks
    const genres = Array.from(new Set(tracks.map(track => track.genre?.name).filter(Boolean)));

    // Mock moods data
    const moods = ["Chill", "Energetic", "Romantic", "Focus", "Party", "Sad", "Happy"];

    // Filter tracks based on search and filters
    const filteredTracks = tracks.filter((track) => {
        const matchesSearch = !searchQuery || 
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.album.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre = selectedGenre === "all" || track.genre?.name === selectedGenre;

        return matchesSearch && matchesGenre;
    });

    // Get featured tracks (first 6)
    const featuredTracks = filteredTracks.slice(0, 6);

    // Get trending tracks (random selection)
    const trendingTracks = [...filteredTracks].sort(() => 0.5 - Math.random()).slice(0, 8);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // TODO: Implement file upload logic
            console.log("Files selected:", files);
            alert("Upload functionality will be implemented soon!");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-6 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            Discover Music
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-purple-100">
                            Stream unlimited music for free • Upload your tracks • Connect with artists
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto mb-8">
                            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
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
                                className={`${currentView === "featured" ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Music className="mr-2 h-5 w-5" />
                                Explore Music
                            </Button>
                            <Button 
                                size="lg" 
                                onClick={() => setCurrentView("library")}
                                className={`${currentView === "library" ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Headphones className="mr-2 h-5 w-5" />
                                Full Library
                            </Button>
                            <Button 
                                size="lg" 
                                onClick={() => setCurrentView("upload")}
                                className={`${currentView === "upload" ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Music
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="container mx-auto px-6 py-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">Filters:</span>
                    </div>

                    {/* Genre Filter */}
                    <select 
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800"
                    >
                        <option value="all">All Genres</option>
                        {genres.map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>

                    {/* Mood Filter */}
                    <select 
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800"
                    >
                        <option value="all">All Moods</option>
                        {moods.map(mood => (
                            <option key={mood} value={mood}>{mood}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 pb-32">
                {currentView === "featured" && (
                    <div className="space-y-12">
                        {/* Featured Tracks */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold flex items-center gap-2">
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                    Featured Today
                                </h2>
                                <Button variant="outline" onClick={() => setCurrentView("library")}>
                                    View All
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredTracks.map((track) => (
                                    <Card key={track.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                                        <div className="relative aspect-square">
                                            {track.album.cover_image_url ? (
                                                <Image
                                                    src={track.album.cover_image_url}
                                                    alt={track.album.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                    <Music className="h-16 w-16 text-white" />
                                                </div>
                                            )}

                                            {/* Play overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                <Button
                                                    size="lg"
                                                    onClick={() => playTrack(track)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-white text-purple-600 hover:bg-white/90"
                                                >
                                                    <Play className="h-6 w-6" />
                                                </Button>
                                            </div>
                                        </div>

                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-lg mb-1 truncate">{track.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 truncate">{track.artist.name}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <Badge variant="secondary">{track.genre?.name || "Unknown"}</Badge>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm">{formatDuration(track.duration)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Trending Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold flex items-center gap-2">
                                    <TrendingUp className="h-8 w-8 text-pink-600" />
                                    Trending Now
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {trendingTracks.map((track, index) => (
                                    <Card key={track.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl font-bold text-purple-600">#{index + 1}</div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium truncate">{track.title}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist.name}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => playTrack(track)}
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
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
                            <h2 className="text-3xl font-bold">Music Library</h2>
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

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Artist</TableHead>
                                            <TableHead>Album</TableHead>
                                            <TableHead>Genre</TableHead>
                                            <TableHead className="text-right">Duration</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTracks.map((track, index) => (
                                            <TableRow 
                                                key={track.id} 
                                                className={`cursor-pointer hover:bg-muted/50 ${currentTrack?.id === track.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
                                                onClick={() => playTrack(track)}
                                            >
                                                <TableCell className="text-center">
                                                    {currentTrack?.id === track.id && isPlaying ? (
                                                        <div className="w-5 h-5 flex items-center justify-center">
                                                            <div className="flex items-end space-x-0.5 h-4">
                                                                <div className="w-0.5 bg-rose-600 animate-equalize-1" style={{ height: '30%' }}></div>
                                                                <div className="w-0.5 bg-rose-600 animate-equalize-2" style={{ height: '100%' }}></div>
                                                                <div className="w-0.5 bg-rose-600 animate-equalize-3" style={{ height: '60%' }}></div>
                                                                <div className="w-0.5 bg-rose-600 animate-equalize-4" style={{ height: '80%' }}></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {track.album.cover_image_url ? (
                                                            <Image
                                                                src={track.album.cover_image_url}
                                                                alt={track.album.title}
                                                                width={40}
                                                                height={40}
                                                                className="rounded"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                                <Music className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium">{track.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{track.artist.name}</TableCell>
                                                <TableCell>{track.album.title}</TableCell>
                                                <TableCell>
                                                    {track.genre ? (
                                                        <Badge variant="outline">{track.genre.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">--</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">{formatDuration(track.duration)}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="ghost">
                                                        <Heart className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {currentView === "upload" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-4">Upload Your Music</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Share your creativity with the world. Upload your tracks and reach new audiences.
                            </p>
                        </div>

                        <Card className="p-8">
                            <div className="text-center space-y-6">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 hover:border-purple-400 transition-colors">
                                    <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">Drag & Drop Your Music Files</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Support for MP3, WAV, FLAC, and more
                                    </p>
                                    <Button onClick={handleUploadClick} size="lg">
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
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Music className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold mb-2">High Quality</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload in lossless quality for the best listening experience</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Share className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold mb-2">Easy Sharing</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Share your music instantly with built-in social features</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <TrendingUp className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold mb-2">Analytics</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Track plays, likes, and audience engagement</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Music Player */}

        </div>
    );
}