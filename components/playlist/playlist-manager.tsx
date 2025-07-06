
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Music,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Clock,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count: number;
  created_at: string;
}

import React from "react";

function PlaylistManager() {
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    setTrackList, 
    togglePlayPause,
    trackList
  } = useAudioPlayer();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [loadingPlaylist, setLoadingPlaylist] = useState<number | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/playlists");
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast.error("Failed to load playlists");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create playlist");
      }

      const newPlaylist = await response.json();
      setPlaylists([newPlaylist, ...playlists]);
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
      toast.success("Playlist created successfully!");
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist || !formData.name.trim()) {
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
          name: formData.name.trim(),
          description: formData.description.trim(),
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
          p.id === selectedPlaylist.id ? { ...p, ...updatedPlaylist } : p
        )
      );
      
      // Reset form and close dialog
      setEditDialogOpen(false);
      setSelectedPlaylist(null);
      setFormData({ name: "", description: "" });
      
      toast.success(`"${updatedPlaylist.name}" updated successfully!`);
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
    } finally {
      setIsEditing(false);
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

  const openDeleteConfirm = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setDeleteConfirmOpen(true);
    setOpenDropdownId(null); // Close dropdown
  };

  const confirmDelete = () => {
    if (playlistToDelete) {
      handleDeletePlaylist(playlistToDelete);
      setDeleteConfirmOpen(false);
      setPlaylistToDelete(null);
    }
  };

  const openEditDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || "",
    });
    setEditDialogOpen(true);
    setOpenDropdownId(null); // Close dropdown
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    if (playlist.track_count === 0) {
      toast.error("This playlist is empty");
      return;
    }

    setLoadingPlaylist(playlist.id);
    try {
      // Fetch tracks from the playlist
      const response = await fetch(`/api/playlists/${playlist.id}/tracks`);
      if (!response.ok) {
        throw new Error("Failed to fetch playlist tracks");
      }

      // API might return PlaylistTrack[] or Track[] depending on context
      const tracksData = await response.json();
      
      if (tracksData.length === 0) {
        toast.error("This playlist is empty");
        return;
      }

      console.log("Raw API response:", tracksData);

      // Handle both PlaylistTrack[] and Track[] responses
      let tracks: Track[];
      if (tracksData[0]?.track) {
        // PlaylistTrack[] format (like in detail page)
        tracks = tracksData.map((pt: any) => pt.track);
      } else {
        // Direct Track[] format  
        tracks = tracksData;
      }

      // Process tracks to ensure proper audio URLs (same as playlist detail page)
      const processedTracks = tracks.map(track => ({
        ...track,
        file_url: track.file_url || track.audio_file_url,
        audio_file_url: track.audio_file_url || track.file_url
      }));

      console.log("Processed tracks:", processedTracks);

      // Validate tracks have required properties
      const validTracks = processedTracks.filter(track => 
        track && 
        track.id && 
        track.title && 
        (track.file_url || track.audio_file_url)
      );

      if (validTracks.length === 0) {
        toast.error("No valid tracks found in playlist");
        return;
      }

      // Set track list first (exactly like playlist detail page)
      setTrackList(validTracks);
      
      // Same delay as playlist detail page (50ms)
      setTimeout(() => {
        console.log("Playing first track:", validTracks[0]);
        playTrack(validTracks[0]);
      }, 50);
      
      toast.success(`Playing "${playlist.name}" - ${validTracks.length} tracks`);
    } catch (error) {
      console.error("Error playing playlist:", error);
      toast.error("Failed to play playlist");
    } finally {
      setLoadingPlaylist(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Playlists</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your personal playlists
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Playlist
        </Button>
      </div>

      {/* Playlists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first playlist to start organizing your music
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="group hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={(e) => {
                    // Only navigate if the click is not on the dropdown button or content
                    const target = e.target as HTMLElement;
                    if (!target.closest('[data-radix-dropdown-menu-trigger]') && 
                        !target.closest('[data-radix-dropdown-menu-content]') &&
                        !target.closest('[data-slot="dropdown-menu-item"]')) {
                      window.location.href = `/playlists/${playlist.id}`;
                    }
                  }}
            >
                <CardContent className="p-0">
                  {/* Cover Image */}
                  <div className="relative h-32 sm:h-36 md:h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg">
                    {playlist.cover_image_url ? (
                      <img
                        src={playlist.cover_image_url}
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-16 w-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPlaylist(playlist);
                        }}
                        disabled={loadingPlaylist === playlist.id}
                      >
                        {loadingPlaylist === playlist.id ? (
                          <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base truncate">
                        {playlist.name}
                      </h3>
                      <DropdownMenu 
                        open={openDropdownId === playlist.id} 
                        onOpenChange={(open) => setOpenDropdownId(open ? playlist.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <div onClick={(e) => {
                            e.stopPropagation();
                          }}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="relative z-10"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="z-[9999] bg-white dark:bg-gray-800 border shadow-lg"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                          onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuItem 
                            className="focus:bg-gray-100 dark:focus:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openEditDialog(playlist);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openDeleteConfirm(playlist);
                            }}
                            disabled={isDeleting === playlist.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {playlist.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {playlist.track_count} tracks
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(playlist.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Playlist Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a new playlist to organize your favorite tracks
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePlaylist}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Playlist Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Playlist"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                onClick={() => setEditDialogOpen(false)}
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
              Are you sure you want to delete "{playlistToDelete?.name}"? This action cannot be undone.
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
    </div>
  );
}

export default PlaylistManager;
