"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  UserPlus,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { ArtistGrid } from "@/components/music/artist-grid";
import { AlbumGrid } from "@/components/music/album-grid";
import TracksListLight from "@/components/music/tracks-list-light";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { CreatePlaylistModal } from "@/components/playlist/create-playlist-modal";
import LibraryLoadingSkeleton from "./loading";

interface FollowedArtist {
  id: number;
  name: string;
  profile_image_url: string | null;
  custom_url: string | null;
  tracksCount: number;
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
  custom_url?: string;
  artist: {
    id: number;
    name: string;
    custom_url?: string;
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
  const { playTrack, currentTrack, isPlaying, togglePlayPause, setTrackList } =
    useAudioPlayer();
  const { toggleAlbumLike, getAlbumLikeStatus } = useLikesFollows();

  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [likedAlbums, setLikedAlbums] = useState<LikedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<number | null>(
    null,
  );

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



  const handlePlaylistCreated = (newPlaylist: any) => {
    setPlaylists([newPlaylist, ...playlists]);
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    if (playlist.track_count === 0) {
      toast.error("This playlist is empty");
      return;
    }

    setLoadingPlaylistId(playlist.id);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/tracks`);
      if (!response.ok) {
        throw new Error("Failed to fetch playlist tracks");
      }

      const tracksData = await response.json();

      if (tracksData.length === 0) {
        toast.error("This playlist is empty");
        return;
      }

      let tracks: Track[];
      if (tracksData[0]?.track) {
        tracks = tracksData.map((pt: any) => pt.track);
      } else {
        tracks = tracksData;
      }

      const processedTracks = tracks.map((track) => ({
        ...track,
        file_url: track.file_url || track.audio_file_url,
        audio_file_url: track.audio_file_url || track.file_url,
      }));

      const validTracks = processedTracks.filter(
        (track) =>
          track &&
          track.id &&
          track.title &&
          (track.file_url || track.audio_file_url),
      );

      if (validTracks.length === 0) {
        toast.error("No valid tracks found in playlist");
        return;
      }

      setTrackList(validTracks);

      setTimeout(() => {
        playTrack(validTracks[0]);
      }, 50);

      toast.success(
        `Playing "${playlist.name}" - ${validTracks.length} tracks`,
      );
    } catch (error) {
      console.error("Error playing playlist:", error);
      toast.error("Failed to play playlist");
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  const handleAlbumPlay = async (album: LikedAlbum) => {
    try {
      const response = await fetch(`/api/albums/${album.id}/tracks`);
      if (response.ok) {
        const data = await response.json();
        const tracksArray = data.tracks || (Array.isArray(data) ? data : []);

        if (Array.isArray(tracksArray) && tracksArray.length > 0) {
          setTrackList(tracksArray);
          playTrack(tracksArray[0]);
        } else {
          toast.error("No tracks found in this album");
        }
      } else {
        toast.error("Failed to load album tracks");
      }
    } catch (error) {
      console.error("Error loading album tracks:", error);
      toast.error("Failed to load album tracks");
    }
  };

  const handleAlbumLike = async (albumId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleAlbumLike(albumId);
  };

  if (isLoading) {
    return <LibraryLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Followed Artists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Followed Artists</h2>
              <UserPlus className="h-5 w-5 text-purple-300" />
            </div>
          </div>

          {followedArtists.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300">No followed artists yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <ArtistGrid
                artists={followedArtists.slice(0, 5)}
                className="contents"
              />
              {followedArtists.length > 5 && (
                <Link href="/library/artists">
                  <div className="group cursor-pointer text-center">
                    <div className="aspect-square mx-auto mb-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center relative group-hover:bg-white/20 transition-all duration-300 border-2 border-dashed border-purple-400">
                      <ChevronRight className="h-8 w-8 text-purple-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-purple-300 group-hover:text-white transition-colors">
                        View All
                      </h3>
                      <p className="text-sm text-purple-400">
                        {followedArtists.length - 5} more
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Playlists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Playlists</h2>
              <Button
                onClick={() => setCreatePlaylistOpen(true)}
                size="sm"
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 p-0"
              >
                <Plus className="h-4 w-4 text-purple-300" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {playlists.slice(0, 5).map((playlist) => (
              <div
                key={playlist.id}
                className="group cursor-pointer text-center"
              >
                <div className="relative aspect-square mb-3">
                  <Link href={`/playlists/${playlist.id}`}>
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg relative overflow-hidden">
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
                    </div>
                  </Link>

                  <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlayPlaylist(playlist);
                      }}
                      disabled={loadingPlaylistId === playlist.id}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm"
                    >
                      {loadingPlaylistId === playlist.id ? (
                        <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link href={`/playlists/${playlist.id}`} className="block">
                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                      {playlist.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-purple-300 truncate">
                    {playlist.track_count || 0} songs
                  </p>
                </div>
              </div>
            ))}

            {playlists.length > 5 && (
              <Link href="/library/playlists">
                <div className="group cursor-pointer text-center">
                  <div className="aspect-square mx-auto mb-3 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center relative group-hover:bg-white/20 transition-all duration-300 border-2 border-dashed border-purple-400">
                    <ChevronRight className="h-8 w-8 text-purple-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-purple-300 group-hover:text-white transition-colors">
                      View All
                    </h3>
                    <p className="text-sm text-purple-400">
                      {playlists.length - 5} more
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {playlists.length === 0 && (
              <div className="col-span-full text-center py-8">
                <List className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">No playlists yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Liked Tracks Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Liked Songs</h2>
              <Heart className="h-5 w-5 text-red-400" />
            </div>
            <Link href="/library/liked-songs">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <TracksListLight tracks={likedTracks.slice(0, 5)} />
        </section>

        {/* Liked Albums Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Liked Albums</h2>
              <AlbumIcon className="h-5 w-5 text-purple-300" />
            </div>
            <Link href="/library/liked-albums">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {likedAlbums.slice(0, 5).map((album) => (
              <div key={album.id} className="group text-center">
                <div className="relative aspect-square mb-3">
                  <Link href={`/album/${album.custom_url || album.id}`}>
                    {album.cover_image_url ? (
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-300">
                        <AlbumIcon className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </Link>

                  <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => handleAlbumLike(album.id, e)}
                        className={`opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm ${
                          getAlbumLikeStatus(album.id).isLiked
                            ? "bg-red-500/90 text-white hover:bg-red-600"
                            : "bg-white/90 text-red-500 hover:bg-white"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${getAlbumLikeStatus(album.id).isLiked ? "fill-current" : ""}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAlbumPlay(album);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/album/${album.custom_url || album.id}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                      {album.title}
                    </h3>
                  </Link>
                  <Link
                    href={`/artist/${album.artist?.custom_url || album.artist?.id}`}
                    className="block"
                  >
                    <p className="text-sm text-purple-300 hover:text-white transition-colors truncate">
                      {album.artist?.name}
                    </p>
                  </Link>
                </div>
              </div>
            ))}

            {likedAlbums.length > 5 && (
              <Link href="/library/liked-albums">
                <div className="group cursor-pointer text-center">
                  <div className="aspect-square mx-auto mb-3 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center relative group-hover:bg-white/20 transition-all duration-300 border-2 border-dashed border-purple-400">
                    <ChevronRight className="h-8 w-8 text-purple-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-purple-300 group-hover:text-white transition-colors">
                      View All
                    </h3>
                    <p className="text-sm text-purple-400">
                      {likedAlbums.length - 5} more
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {likedAlbums.length === 0 && (
              <div className="col-span-full text-center py-8">
                <AlbumIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-300">No liked albums yet</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        open={createPlaylistOpen}
        onOpenChange={setCreatePlaylistOpen}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <div className="pb-32"></div>
    </div>
  );
}
