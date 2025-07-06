
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { 
  Play, 
  Pause, 
  Clock, 
  Music, 
  Heart, 
  Share, 
  Download,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { useDownload } from "@/hooks/use-download";
import { toast } from "sonner";

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  track_count: number;
}

interface PlaylistTrack {
  id: number;
  playlist_id: number;
  track_id: number;
  added_at: string;
  track: Track;
}

// Helper function to format time
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentTrack, isPlaying, playTrack, setTrackList, togglePlayPause } = useAudioPlayer();
  const { downloadTrack, isTrackDownloading } = useDownload();

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch playlist info
      const playlistResponse = await fetch(`/api/playlists/${playlistId}`);
      if (!playlistResponse.ok) {
        throw new Error("Failed to fetch playlist");
      }
      const playlistData = await playlistResponse.json();
      setPlaylist(playlistData);

      // Fetch playlist tracks
      const tracksResponse = await fetch(`/api/playlists/${playlistId}/tracks`);
      if (!tracksResponse.ok) {
        throw new Error("Failed to fetch tracks");
      }
      const tracksData = await tracksResponse.json();
      setTracks(tracksData);
    } catch (error) {
      console.error("Error fetching playlist details:", error);
      toast.error("Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPlaylist = () => {
    if (tracks && tracks.length > 0) {
      const trackList = tracks.map(pt => pt.track);
      setTrackList(trackList);
      setTimeout(() => {
        playTrack(trackList[0]);
      }, 50);
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      togglePlayPause();
      return;
    }

    const trackList = tracks.map(pt => pt.track);
    setTrackList(trackList);
    setTimeout(() => {
      playTrack(track);
    }, 50);
  };

  const handleRemoveFromPlaylist = async (playlistTrackId: number) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistTrackId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove track");
      }

      setTracks(tracks.filter(pt => pt.id !== playlistTrackId));
      toast.success("Track removed from playlist");
    } catch (error) {
      console.error("Error removing track:", error);
      toast.error("Failed to remove track");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Playlist not found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <Button
            variant="ghost"
            className="mb-4 text-white hover:bg-white/20"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Playlists
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              {playlist.cover_image_url ? (
                <Image
                  src={playlist.cover_image_url}
                  alt={playlist.name}
                  width={256}
                  height={256}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Music className="h-20 w-20 text-white/60" />
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <Badge className="bg-white/20 text-white border-white/30 w-fit mx-auto md:mx-0">
                Playlist
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-lg text-purple-100 max-w-2xl">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <span>{tracks.length} songs</span>
                <span>•</span>
                <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={handlePlayPlaylist}
                  disabled={tracks.length === 0}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Play Playlist
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Like
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="container mx-auto px-6 py-12">
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
                Songs
              </h2>
            </div>

            {tracks.length > 0 ? (
              <div className="space-y-1">
                {tracks.map((playlistTrack, idx) => {
                  const track = playlistTrack.track;
                  return (
                    <div
                      key={playlistTrack.id}
                      className="group flex items-center gap-4 p-4 hover:bg-white/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer border-b border-gray-100/50 dark:border-gray-700/30 last:border-b-0"
                    >
                      <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <div className="flex items-center justify-center">
                            <div className="flex items-end space-x-0.5 h-4">
                              <div className="w-0.5 bg-rose-600 animate-equalize-1" style={{ height: '30%' }}></div>
                              <div className="w-0.5 bg-rose-600 animate-equalize-2" style={{ height: '100%' }}></div>
                              <div className="w-0.5 bg-rose-600 animate-equalize-3" style={{ height: '60%' }}></div>
                            </div>
                          </div>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 hidden group-hover:flex rounded-full"
                        onClick={() => handlePlayTrack(track)}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                        {track.album?.cover_image_url ? (
                          <Image
                            src={track.album.cover_image_url}
                            alt={track.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Music className="h-5 w-5 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {track.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {track.artist?.name}
                        </div>
                      </div>

                      <div className="hidden md:block">
                        {track.genre ? (
                          <Badge variant="outline" className="text-xs">
                            {track.genre.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">
                          {formatDuration(track.duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className={`p-2 relative overflow-hidden ${isTrackDownloading(track.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          title="Download"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadTrack(track);
                          }}
                          disabled={isTrackDownloading(track.id)}
                        >
                          {isTrackDownloading(track.id) ? (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 animate-pulse"></div>
                              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 animate-loading-bar"></div>
                              <Download className="h-4 w-4 text-blue-600 animate-bounce" />
                            </>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="p-2">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveFromPlaylist(playlistTrack.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove from playlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Songs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This playlist is empty. Add some songs to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Music Player */}
      <div className="pb-32">
        <MusicPlayer />
      </div>
    </div>
  );
}
