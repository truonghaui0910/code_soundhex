
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { showWarning } from '@/lib/services/notification-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  ListMusic,
  Search,
  Check,
  Lock,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Playlist {
  id: number;
  name: string;
  track_count: number;
  private: boolean;
}

interface AddToPlaylistProps {
  trackId: number;
  trackTitle: string;
  children: React.ReactNode;
}

export default function AddToPlaylist({
  trackId,
  trackTitle,
  children,
}: AddToPlaylistProps) {
  const { user } = useCurrentUser();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState<number | null>(null);

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

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ track_id: trackId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add track to playlist");
      }

      const playlist = playlists.find((p) => p.id === playlistId);
      toast.success(`Added "${trackTitle}" to "${playlist?.name}"`);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error adding track to playlist:", error);

      if (error.message === "Track already exists in playlist") {
        toast.error("This track is already in the playlist");
      } else {
        toast.error(error.message || "Failed to add track to playlist");
      }
    }
  };

  const handleCreateAndAddToPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    // Check for duplicate playlist name
    const duplicatePlaylist = playlists.find(
      (playlist) =>
        playlist.name.toLowerCase() === newPlaylistName.trim().toLowerCase(),
    );

    if (duplicatePlaylist) {
      toast.error("A playlist with this name already exists");
      return;
    }

    try {
      // Create new playlist
      const createResponse = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();

        // Handle specific error responses
        if (createResponse.status === 409) {
          toast.error("A playlist with this name already exists");
          return;
        }

        throw new Error(errorData.error || "Failed to create playlist");
      }

      const newPlaylist = await createResponse.json();

      // Add track to the new playlist
      const addResponse = await fetch(
        `/api/playlists/${newPlaylist.id}/tracks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ track_id: trackId }),
        },
      );

      if (!addResponse.ok) {
        throw new Error("Failed to add track to playlist");
      }

      setShowCreateDialog(false);
      setNewPlaylistName("");
      toast.success(`Created "${newPlaylist.name}" and added "${trackTitle}"`);

      // Force refresh playlists to ensure UI is up to date
      await fetchPlaylists();
    } catch (error: any) {
      console.error("Error creating playlist and adding track:", error);
      toast.error(error.message || "Failed to create playlist");
    }
  };

  const handleModalOpen = () => {
    if (!user) {
      showWarning({
        title: "Login Required",
        message: "You need to login to add tracks to playlists"
      });
      return;
    }
    
    setIsModalOpen(true);
    fetchPlaylists();
  };

  const togglePlaylistPrivacy = async (
    playlistId: number,
    currentPrivateStatus: boolean,
  ) => {
    setTogglingPrivacy(playlistId);
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ private: !currentPrivateStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update playlist privacy");
      }

      // Update local state
      setPlaylists((prevPlaylists) =>
        prevPlaylists.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, private: !currentPrivateStatus }
            : playlist,
        ),
      );
    } catch (error) {
      console.error("Error updating playlist privacy:", error);
    } finally {
      setTogglingPrivacy(null);
    }
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div onClick={handleModalOpen} className="w-full">
        {children}
      </div>

      {/* Add to Playlist Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Select a playlist to add "{trackTitle}" to
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Search */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {/* Create new playlist option */}
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                onClick={() => {
                  setShowCreateDialog(true);
                  setIsModalOpen(false);
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create new playlist</span>
              </div>

              {/* Playlists list */}
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading playlists...
                </div>
              ) : filteredPlaylists.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchQuery ? "No playlists found" : "No playlists yet"}
                </div>
              ) : (
                filteredPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ListMusic className="mr-2 h-4 w-4 flex-shrink-0" />
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleAddToPlaylist(playlist.id)}
                    >
                      <div className="font-medium text-sm">{playlist.name}</div>
                      <div className="text-xs text-gray-500">
                        {playlist.track_count} tracks
                      </div>
                    </div>
                    <button
                      className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlaylistPrivacy(playlist.id, playlist.private);
                      }}
                      disabled={togglingPrivacy === playlist.id}
                    >
                      {togglingPrivacy === playlist.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : playlist.private ? (
                        <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a new playlist to organize your favorite tracks
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAndAddToPlaylist}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Create & Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
