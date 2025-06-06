
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Play, Pause, Clock, Music, Heart, Share, Download, Plus } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface AlbumDetailClientProps {
  album: any;
  tracks: Track[];
}

export function AlbumDetailClient({ album, tracks }: AlbumDetailClientProps) {
  const { setTrackList, playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const handlePlayAlbum = () => {
    if (tracks && tracks.length > 0) {
      // Always update trackList when playing a new album
      setTrackList(tracks);
      // Small delay to ensure trackList is updated before playing
      setTimeout(() => {
        playTrack(tracks[0]); // Play the first track
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              {album.cover_image_url ? (
                <Image
                  src={album.cover_image_url}
                  alt={album.title}
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
                Album
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {album.title}
              </h1>
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <Link
                  href={`/artist/${album.artist?.id}`}
                  className="font-medium hover:underline"
                >
                  {album.artist?.name || "Unknown Artist"}
                </Link>
                {album.release_date && (
                  <>
                    <span>•</span>
                    <span>{new Date(album.release_date).getFullYear()}</span>
                  </>
                )}
                {tracks && tracks.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{tracks.length} songs</span>
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={handlePlayAlbum}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Play Album
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Save
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
                Track List
              </h2>
            </div>

            {tracks && tracks.length > 0 ? (
              <div className="space-y-1">
                {tracks.map((track, idx) => (
                  <div
                    key={track.id}
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
                      onClick={() => {
                        // Always update trackList first
                        setTrackList(tracks);
                        // Small delay to ensure trackList is updated
                        setTimeout(() => {
                          playTrack(track);
                        }, 50);
                      }}
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
                      <div className="font-semibold text-gray-900 dark:text-white truncate hover:underline cursor-pointer">
                        {track.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate hover:underline cursor-pointer">
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
                      <Button size="sm" variant="ghost" className="p-2" title="Add to playlist">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2" title="Like">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2" title="Share">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Songs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This album currently has no songs.
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
