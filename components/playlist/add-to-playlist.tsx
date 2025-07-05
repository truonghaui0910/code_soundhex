
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ListMusic, Search, Check } from "lucide-react";
import { toast } from "sonner";

interface Playlist {
  id: number;
  name: string;
  track_count: number;
}

interface AddToPlaylistProps {
  trackId: number;
  trackTitle: string;
  children: React.ReactNode;
}

export default function AddToPlaylist({ trackId, trackTitle, children }: AddToPlaylistProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

      const playlist = playlists.find(p => p.id === playlistId);
      toast.success(`Added "${trackTitle}" to "${playlist?.name}"`);
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
        throw new Error("Failed to create playlist");
      }

      const newPlaylist = await createResponse.json();

      // Add track to the new playlist
      const addResponse = await fetch(`/api/playlists/${newPlaylist.id}/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ track_id: trackId }),
      });

      if (!addResponse.ok) {
        throw new Error("Failed to add track to playlist");
      }

      setPlaylists([newPlaylist, ...playlists]);
      setShowCreateDialog(false);
      setNewPlaylistName("");
      toast.success(`Created "${newPlaylist.name}" and added "${trackTitle}"`);
    } catch (error: any) {
      console.error("Error creating playlist and adding track:", error);
      toast.error(error.message || "Failed to create playlist");
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div onClick={fetchPlaylists}>
            {children}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create new playlist
          </DropdownMenuItem>
          
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
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                <ListMusic className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{playlist.name}</div>
                  <div className="text-xs text-gray-500">
                    {playlist.track_count} tracks
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a new playlist and add "{trackTitle}" to it
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAndAddToPlaylist}>
            <div className="space-y-4 py-4">
              <div>
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
