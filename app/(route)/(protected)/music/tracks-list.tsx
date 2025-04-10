"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Music,
    Clock,
    Search,
    Volume2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Track } from "@/lib/definitions/Track";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { MusicPlayer } from "@/components/music/MusicPlayer";

// Helper function to format time in minutes:seconds
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface TracksListProps {
    initialTracks: Track[];
}

export function TracksList({ initialTracks }: TracksListProps) {
    const [tracks] = useState<Track[]>(initialTracks);
    const [searchQuery, setSearchQuery] = useState("");

    // Use hook to get playback state and playTrack method
    const { currentTrack, isPlaying, playTrack, error } = useAudioPlayer();

    // Filter tracks based on search query
    const filteredTracks = tracks.filter((track) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            track.title.toLowerCase().includes(query) ||
            track.artist.name.toLowerCase().includes(query) ||
            track.album.title.toLowerCase().includes(query) ||
            (track.genre?.name.toLowerCase().includes(query) || false)
        );
    });

    return (
        <div className="space-y-6 pb-24">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title, artist, album or genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-96"
                />
            </div>

            {/* Tracks table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Album</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead className="text-right">
                                    <Clock className="ml-auto h-4 w-4" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {error ? (
                                // Error state
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-red-500">
                                        Error loading tracks: {error}
                                    </TableCell>
                                </TableRow>
                            ) : filteredTracks.length === 0 ? (
                                // Empty or no search results
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        {searchQuery ? "No tracks matching your search." : "No tracks available."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // Tracks list
                                filteredTracks.map((track, index) => (
                                    <TableRow
                                        key={track.id}
                                        onClick={() => playTrack(track)}
                                        className={`cursor-pointer hover:bg-muted/50 ${currentTrack?.id === track.id ? 'bg-muted' : ''}`}
                                    >
                                        <TableCell>
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
                                                        alt={`Album ${track.album.title}`}
                                                        width={48}
                                                        height={48}
                                                        className="rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-12 w-12 rounded bg-muted">
                                                        <Music className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{track.title}</div>
                                                    {track.description && (
                                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                            {track.description}
                                                        </div>
                                                    )}
                                                </div>
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
                                        <TableCell className="text-right font-mono">
                                            {formatDuration(track.duration)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Use MusicPlayer on this page */}
            <MusicPlayer />
        </div>
    );
}