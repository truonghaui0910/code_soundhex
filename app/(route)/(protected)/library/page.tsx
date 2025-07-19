
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Heart, 
  Play, 
  Users, 
  List, 
  Album as AlbumIcon, 
  ChevronRight,
  Plus,
  UserPlus
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { Track } from "@/lib/definitions/Track";

interface FollowedArtist {
  id: number;
  name: string;
  profile_image_url?: string;
}

interface LikedTrack {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
    profile_image_url?: string;
  };
  album?: {
    id: number;
    title: string;
    cover_image_url?: string;
  };
  duration?: number;
  file_url?: string;
}

interface LikedAlbum {
  id: number;
  title: string;
  cover_image_url?: string;
  artist: {
    id: number;
    name: string;
  };
  release_date?: string;
}

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count?: number;
  created_at: string;
}

export default function YourLibraryPage() {
  const { user } = useCurrentUser();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudioPlayer();
  
  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [likedAlbums, setLikedAlbums] = useState<LikedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLibraryData();
    }
  }, [user]);

  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      // Fetch playlists
      const playlistsResponse = await fetch("/api/playlists");
      const playlistsData = await playlistsResponse.json();
      setPlaylists(playlistsData || []);

      // Fetch followed artists
      const artistsResponse = await fetch("/api/user/followed-artists");
      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json();
        setFollowedArtists(artistsData || []);
      }

      // Fetch liked tracks
      const tracksResponse = await fetch("/api/user/liked-tracks");
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setLikedTracks(tracksData || []);
      }

      // Fetch liked albums
      const albumsResponse = await fetch("/api/user/liked-albums");
      if (albumsResponse.ok) {
        const albumsData = await albumsResponse.json();
        setLikedAlbums(albumsData || []);
      }
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPlay = (track: LikedTrack) => {
    const trackToPlay: Track = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      file_url: track.file_url,
      created_at: new Date().toISOString(),
      source_type: "uploaded",
      view_count: 0
    };

    if (currentTrack?.id === track.id && isPlaying) {
      togglePlayPause();
    } else {
      playTrack(trackToPlay);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải thư viện...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
            <Music className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Thư viện</h1>
          <Play className="h-6 w-6 ml-2" />
        </div>

        {/* Followed Artists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Nghệ sĩ đã theo dõi</h2>
              <UserPlus className="h-5 w-5 text-purple-300" />
            </div>
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
              Xem tất cả
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {followedArtists.slice(0, 8).map((artist) => (
              <div key={artist.id} className="flex-shrink-0 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2 border-2 border-purple-400">
                  <AvatarImage src={artist.profile_image_url} alt={artist.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500">
                    {artist.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium max-w-[80px] truncate">{artist.name}</p>
              </div>
            ))}
            {followedArtists.length === 0 && (
              <div className="text-center py-8 w-full">
                <UserPlus className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">Chưa theo dõi nghệ sĩ nào</p>
              </div>
            )}
          </div>
        </section>

        {/* Playlists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">PLAYLIST</h2>
              <Plus className="h-5 w-5 text-purple-300" />
            </div>
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
              TẤT CẢ
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {playlists.slice(0, 5).map((playlist) => (
              <Card key={playlist.id} className="bg-white/10 backdrop-blur-sm border-0 hover:bg-white/20 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 relative overflow-hidden">
                    {playlist.cover_image_url ? (
                      <img 
                        src={playlist.cover_image_url} 
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <List className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate mb-1">{playlist.name}</h3>
                  <p className="text-xs text-purple-300">{playlist.track_count || 0} bài hát</p>
                </CardContent>
              </Card>
            ))}
            {playlists.length === 0 && (
              <div className="col-span-full text-center py-8">
                <List className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">Chưa có playlist nào</p>
              </div>
            )}
          </div>
        </section>

        {/* Liked Tracks Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Bài hát đã thích</h2>
              <Heart className="h-5 w-5 text-red-400" />
            </div>
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
              Xem tất cả
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {likedTracks.slice(0, 5).map((track, index) => (
              <div 
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                onClick={() => handleTrackPlay(track)}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {track.album?.cover_image_url ? (
                    <img 
                      src={track.album.cover_image_url} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="h-6 w-6 text-white" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-purple-300 truncate">{track.artist.name}</p>
                </div>
                <div className="text-right">
                  <Heart className="h-4 w-4 text-red-400 fill-current" />
                </div>
              </div>
            ))}
            {likedTracks.length === 0 && (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">Chưa có bài hát yêu thích nào</p>
              </div>
            )}
          </div>
        </section>

        {/* Liked Albums Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Album đã thích</h2>
              <AlbumIcon className="h-5 w-5 text-purple-300" />
            </div>
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
              Xem tất cả
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {likedAlbums.slice(0, 6).map((album) => (
              <Card key={album.id} className="bg-white/10 backdrop-blur-sm border-0 hover:bg-white/20 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 relative overflow-hidden">
                    {album.cover_image_url ? (
                      <img 
                        src={album.cover_image_url} 
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <AlbumIcon className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Heart className="h-4 w-4 text-red-400 fill-current" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm truncate mb-1">{album.title}</h3>
                  <p className="text-xs text-purple-300 truncate">{album.artist.name}</p>
                </CardContent>
              </Card>
            ))}
            {likedAlbums.length === 0 && (
              <div className="col-span-full text-center py-8">
                <AlbumIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">Chưa có album yêu thích nào</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
