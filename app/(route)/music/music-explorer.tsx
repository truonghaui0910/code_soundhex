
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Upload, Music, Heart, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useCurrentUser } from "@/hooks/use-current-user";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Track } from "@/lib/definitions/Track";

interface MusicExplorerProps {
  initialTracks: Track[];
}

function UploadRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/music/upload');
    }, [router]);

    return (
        <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Redirecting to upload page...
            </p>
        </div>
    );
}

export function MusicExplorer({ initialTracks }: MusicExplorerProps) {
    const [tracks, setTracks] = useState<Track[]>(initialTracks);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'discover' | 'upload'>('discover');
    const { 
        currentTrack, 
        isPlaying, 
        play, 
        pause, 
        playTrack 
    } = useAudioPlayer();
    const { user, loading: userLoading } = useCurrentUser();
    const router = useRouter();

    const handleProtectedAction = (action: string) => {
        if (!user) {
            // Redirect to login if user is not authenticated
            const currentUrl = window.location.pathname;
            router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
            return;
        }
        // Handle the action if user is authenticated
        console.log(`Performing ${action} for authenticated user`);
    };

    const handlePlayPause = (track: Track) => {
        if (currentTrack?.id === track.id) {
            if (isPlaying) {
                pause();
            } else {
                play();
            }
        } else {
            playTrack(track);
        }
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (activeView === 'upload') {
        return <UploadRedirect />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                                Discover Music
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl">
                                Stream unlimited music from talented artists
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {user ? (
                                <Button
                                    onClick={() => setActiveView('upload')}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-300"
                                >
                                    <Upload className="mr-2 h-5 w-5" />
                                    Upload Music
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleProtectedAction('upload')}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-300"
                                >
                                    <Upload className="mr-2 h-5 w-5" />
                                    Upload Music
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                    </div>
                )}

                {/* Track Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {tracks.map((track) => (
                        <Card key={track.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <CardContent className="p-4">
                                {/* Album Art */}
                                <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                                    <Link href={`/album/${track.album_id}`}>
                                        {track.cover_url ? (
                                            <Image
                                                src={track.cover_url}
                                                alt={track.title}
                                                fill
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center rounded-t-lg">
                                                <Music className="h-16 w-16 text-white" />
                                            </div>
                                        )}
                                    </Link>
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Button
                                            size="lg"
                                            onClick={() => handlePlayPause(track)}
                                            className="rounded-full bg-white/90 hover:bg-white text-black shadow-lg transform scale-90 hover:scale-100 transition-transform duration-200"
                                        >
                                            {currentTrack?.id === track.id && isPlaying ? (
                                                <Pause className="h-6 w-6" />
                                            ) : (
                                                <Play className="h-6 w-6 ml-1" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Track Info */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {track.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        <Link 
                                            href={`/artist/${track.artist_id}`} 
                                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {track.artist}
                                        </Link>
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs">
                                            {formatDuration(track.duration || 0)}
                                        </Badge>
                                        <div className="flex space-x-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleProtectedAction('like')}
                                                className="h-8 w-8 p-0 hover:text-red-500 transition-colors"
                                            >
                                                <Heart className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleProtectedAction('add-to-playlist')}
                                                className="h-8 w-8 p-0 hover:text-blue-500 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleProtectedAction('download')}
                                                className="h-8 w-8 p-0 hover:text-green-500 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {tracks.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Music className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No tracks found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Be the first to upload some music!
                        </p>
                        {user ? (
                            <Button
                                onClick={() => setActiveView('upload')}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Music
                            </Button>
                        ) : (
                            <Button
                                onClick={() => handleProtectedAction('upload')}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Music
                            </Button>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading tracks...</p>
                    </div>
                )}
            </div>

            {/* Music Player */}
            <MusicPlayer />
        </div>
    );
}
