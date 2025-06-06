
<old_str>import { notFound } from "next/navigation";
import { TracksController } from "@/lib/controllers/tracks";
import { AlbumsController } from "@/lib/controllers/albums";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export default async function AlbumDetailPage({ params }: Readonly<{ params: { id: string } }>) {
  const albumId = Number(params.id);
  if (!albumId) return notFound();

  // Lấy thông tin album và danh sách bài hát
  let album, tracks;
  try {
    const albums = await AlbumsController.getAllAlbums();
    album = albums.find((a) => a.id === albumId);
    tracks = await TracksController.getTracksByAlbum(albumId);
  } catch (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">Album</h1>
        <p className="text-red-500">Không thể tải thông tin album.</p>
      </div>
    );
  }
  if (!album) return notFound();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-end mb-8">
        <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {album.cover_image_url ? (
            <Image src={album.cover_image_url} alt={album.title} width={192} height={192} className="object-cover w-full h-full" />
          ) : (
            <span className="text-muted-foreground text-6xl">🎵</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <span className="uppercase text-xs font-semibold text-muted-foreground">Album</span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">{album.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{album.artist?.name || "Unknown Artist"}</span>
            {album.release_date && <span>· {new Date(album.release_date).getFullYear()}</span>}
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="py-3 px-4 text-left w-12">#</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Artist</th>
                <th className="py-3 px-4 text-left">Genre</th>
                <th className="py-3 px-4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {tracks && tracks.length > 0 ? tracks.map((track, idx) => (
                <tr key={track.id} className="border-b hover:bg-muted/50 cursor-pointer">
                  <td className="py-3 px-4 text-center">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium">{track.title}</td>
                  <td className="py-3 px-4">{track.artist?.name}</td>
                  <td className="py-3 px-4">
                    {track.genre ? <Badge variant="outline">{track.genre.name}</Badge> : <span className="text-muted-foreground">--</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}` : "--:--"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No tracks in this album.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="mt-8">
        <MusicPlayer />
      </div>
    </div>
  );
}</old_str>
<new_str>"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { TracksController } from "@/lib/controllers/tracks";
import { AlbumsController } from "@/lib/controllers/albums";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { Album } from "@/lib/controllers/albums";
import {
    Music,
    Play,
    Pause,
    Clock,
    Shuffle,
    Heart,
    Share,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function AlbumDetailPage({ params }: Readonly<{ params: { id: string } }>) {
  const albumId = Number(params.id);
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, isPlaying, playTrack } = useAudioPlayer();

  useEffect(() => {
    const loadData = async () => {
      if (!albumId) {
        setError("Invalid album ID");
        setLoading(false);
        return;
      }

      try {
        const [albums, albumTracks] = await Promise.all([
          AlbumsController.getAllAlbums(),
          TracksController.getTracksByAlbum(albumId)
        ]);
        
        const foundAlbum = albums.find((a) => a.id === albumId);
        if (!foundAlbum) {
          setError("Album not found");
          setLoading(false);
          return;
        }

        setAlbum(foundAlbum);
        setTracks(albumTracks);
      } catch (err) {
        setError("Không thể tải thông tin album.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [albumId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="animate-pulse">
          <div className="h-96 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-16"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Album</h1>
          <p className="text-red-500">{error || "Album not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link href="/music">
              <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Music
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
              <div className="w-64 h-64 rounded-lg overflow-hidden bg-muted flex items-center justify-center shadow-2xl">
                {album.cover_image_url ? (
                  <Image 
                    src={album.cover_image_url} 
                    alt={album.title} 
                    width={256} 
                    height={256} 
                    className="object-cover w-full h-full" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Music className="h-24 w-24 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
                <span className="uppercase text-sm font-semibold text-purple-200">Album</span>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">{album.title}</h1>
                <div className="flex items-center gap-2 text-purple-100 justify-center md:justify-start">
                  <span className="text-lg">{album.artist?.name || "Unknown Artist"}</span>
                  {album.release_date && (
                    <>
                      <span>•</span>
                      <span>{new Date(album.release_date).getFullYear()}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{tracks.length} bài hát</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                  <Button
                    size="lg"
                    onClick={() => tracks.length > 0 && playTrack(tracks[0])}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Play Album
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Shuffle className="mr-2 h-5 w-5" />
                    Shuffle
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Like
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    <Share className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="container mx-auto px-6 py-12">
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardContent className="p-0">
            {tracks && tracks.length > 0 ? (
              <div className="overflow-hidden rounded-lg">
                {tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center gap-4 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors border-b last:border-b-0 ${
                      currentTrack?.id === track.id && isPlaying
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : ""
                    }`}
                  >
                    {/* Track Number */}
                    <div className="w-8 text-center text-sm text-gray-600 dark:text-gray-400">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-end space-x-0.5 h-4">
                            <div className="w-0.5 bg-purple-600 animate-equalize-1" style={{ height: "30%" }}></div>
                            <div className="w-0.5 bg-purple-600 animate-equalize-2" style={{ height: "100%" }}></div>
                            <div className="w-0.5 bg-purple-600 animate-equalize-3" style={{ height: "60%" }}></div>
                          </div>
                        </div>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Album Cover (small) */}
                    <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {album.cover_image_url ? (
                        <Image
                          src={album.cover_image_url}
                          alt={album.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Music className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate text-gray-900 dark:text-white">
                        {track.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 truncate text-sm">
                        {track.artist?.name}
                      </p>
                    </div>

                    {/* Genre */}
                    <div className="hidden md:block">
                      {track.genre ? (
                        <Badge variant="outline" className="text-xs">
                          {track.genre.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">--</span>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 min-w-[60px] justify-end">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{formatDuration(track.duration)}</span>
                    </div>

                    {/* Play Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <Music className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No tracks in this album.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}</new_str>
