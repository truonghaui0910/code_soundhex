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
  Trash2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { ArtistGrid } from "@/components/music/artist-grid";
import { AlbumGrid } from "@/components/music/album-grid";
import { PlaylistGrid } from "@/components/music/playlist-grid";
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
  const [editPlaylistOpen, setEditPlaylistOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (user && playlists.length === 0 && followedArtists.length === 0 && likedTracks.length === 0 && likedAlbums.length === 0) {
      fetchLibraryData();
    }
  }, [user, playlists.length, followedArtists.length, likedTracks.length, likedAlbums.length]);

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

  const openEditDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setEditFormData({
      name: playlist.name,
      description: playlist.description || "",
    });
    setEditPlaylistOpen(true);
  };

  const handleEditPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist || !editFormData.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/playlists/${selectedPlaylist.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          description: editFormData.description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update playlist");
      }

      const updatedPlaylist = await response.json();

      // Update local state
      setPlaylists(
        playlists.map((p) =>
          p.id === selectedPlaylist.id ? { ...p, ...updatedPlaylist } : p,
        ),
      );

      // Reset form and close dialog
      setEditPlaylistOpen(false);
      setSelectedPlaylist(null);
      setEditFormData({ name: "", description: "" });

      toast.success(`"${updatedPlaylist.name}" updated successfully!`);
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const openDeleteConfirm = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (playlistToDelete) {
      handleDeletePlaylist(playlistToDelete);
      setDeleteConfirmOpen(false);
      setPlaylistToDelete(null);
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    setIsDeleting(playlist.id);

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/playlists/${playlist.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete playlist");
        }

        // Remove from local state
        setPlaylists(playlists.filter((p) => p.id !== playlist.id));
        resolve(`"${playlist.name}" has been deleted successfully!`);
      } catch (error) {
        console.error("Error deleting playlist:", error);
        reject(new Error("Failed to delete playlist. Please try again."));
      } finally {
        setIsDeleting(null);
      }
    });

    toast.promise(deletePromise, {
      loading: `Deleting "${playlist.name}"...`,
      success: (message) => message as string,
      error: (err) => err.message,
    });
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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

          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <List className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300">No playlists yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <PlaylistGrid
                playlists={playlists.slice(0, 5)}
                onPlaylistEdit={openEditDialog}
                onPlaylistDelete={openDeleteConfirm}
                className="contents"
              />

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
            </div>
          )}
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
            {/* <Link href="/library/liked-albums">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link> */}
          </div>

          {likedAlbums.length === 0 ? (
            <div className="text-center py-8">
              <AlbumIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300">No liked albums yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <AlbumGrid
                albums={likedAlbums.slice(0, 5).map((album) => ({
                  id: album.id,
                  title: album.title,
                  cover_image_url: album.cover_image_url || null,
                  custom_url: album.custom_url || null,
                  artist: {
                    id: album.artist.id,
                    name: album.artist.name,
                    custom_url: album.artist.custom_url || null,
                  },
                }))}
                className="contents"
              />

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
            </div>
          )}
        </section>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        open={createPlaylistOpen}
        onOpenChange={setCreatePlaylistOpen}
        onPlaylistCreated={handlePlaylistCreated}
      />

      {/* Edit Playlist Dialog */}
      <Dialog open={editPlaylistOpen} onOpenChange={setEditPlaylistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
            <DialogDescription>
              Update your playlist information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPlaylist}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Playlist Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter playlist description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditPlaylistOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{playlistToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting === playlistToDelete?.id}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting === playlistToDelete?.id}
            >
              {isDeleting === playlistToDelete?.id ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pb-32"></div>
    </div>
  );
}
