
import { notFound } from "next/navigation";
import { TracksController } from "@/lib/controllers/tracks";
import { ArtistsController } from "@/lib/controllers/artists";
import { AlbumsController } from "@/lib/controllers/albums";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Play, Clock, Music, Heart, Share, Users, Album } from "lucide-react";
import Link from "next/link";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default async function ArtistDetailPage({ params }: { params: { id: string } }) {
  const artistId = Number(params.id);
  if (!artistId) return notFound();

  // Lấy thông tin artist
  let artist, tracks, albums;
  try {
    artist = await ArtistsController.getArtistById(artistId);
    tracks = await TracksController.getTracksByArtist(artistId);
    const allAlbums = await AlbumsController.getAllAlbums();
    albums = allAlbums.filter(album => album.artist?.id === artistId);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Artist</h1>
          <p className="text-red-500">Cannot load artist information.</p>
        </div>
      </div>
    );
  }

  if (!artist) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              {artist.profile_image_url ? (
                <Image 
                  src={artist.profile_image_url} 
                  alt={artist.name} 
                  width={256} 
                  height={256} 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <Users className="h-20 w-20 text-white/60" />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <Badge className="bg-white/20 text-white border-white/30 w-fit mx-auto md:mx-0">
                Artist
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">{artist.name}</h1>
              {artist.bio && (
                <p className="text-lg text-purple-100 max-w-2xl">{artist.bio}</p>
              )}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                {albums && albums.length > 0 && (
                  <>
                    <span>{albums.length} album{albums.length > 1 ? 's' : ''}</span>
                    <span>•</span>
                  </>
                )}
                {tracks && tracks.length > 0 && (
                  <span>{tracks.length} songs</span>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                  <Play className="mr-2 h-5 w-5" />
                  Play All
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Heart className="mr-2 h-5 w-5" />
                  Follow
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Albums Section */}
        {albums && albums.length > 0 && (
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Album className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold">Albums</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albums.map((album) => (
                  <Link key={album.id} href={`/album/${album.id}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                      <CardContent className="p-0">
                        <div className="aspect-square w-full overflow-hidden">
                          {album.cover_image_url ? (
                            <Image
                              src={album.cover_image_url}
                              alt={album.title}
                              width={200}
                              height={200}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center w-full h-full">
                              <Music className="h-12 w-12 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="font-semibold truncate text-gray-900 dark:text-white group-hover:underline">
                            {album.title}
                          </div>
                          {album.release_date && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(album.release_date).getFullYear()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Tracks Section */}
        {tracks && tracks.length > 0 && (
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                  Popular Tracks
                </h2>
              </div>
              
              <div className="space-y-1">
                {tracks.slice(0, 10).map((track, idx) => (
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
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {track.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {track.album?.title}
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Music Player */}
      <div className="pb-32">
        <MusicPlayer />
      </div>
    </div>
  );
}
