import { notFound } from "next/navigation";
import { TracksController } from "@/lib/controllers/tracks";
import { AlbumsController } from "@/lib/controllers/albums";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Play, Clock, Music, Heart, Share } from "lucide-react";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default async function AlbumDetailPage({
  params,
}: Readonly<{ params: { id: string } }>) {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Album</h1>
          <p className="text-red-500">Không thể tải thông tin album.</p>
        </div>
      </div>
    );
  }
  if (!album) return notFound();

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
                <span className="font-medium">
                  {album.artist?.name || "Unknown Artist"}
                </span>
                {album.release_date && (
                  <>
                    <span>•</span>
                    <span>{new Date(album.release_date).getFullYear()}</span>
                  </>
                )}
                {tracks && tracks.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{tracks.length} bài hát</span>
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button
                  size="lg"
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
                Song list
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
                      {idx + 1}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 h-8 p-0 hidden group-hover:flex rounded-full"
                    >
                      <Play className="h-4 w-4" />
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
                      <Button size="sm" variant="ghost" className="p-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2">
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
                  Không có bài hát
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Album này hiện chưa có bài hát nào.
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
