
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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count: number;
  created_at: string;
}

export default function PlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

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
    }
  };

  const handleEditPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist || !formData.name.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${selectedPlaylist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update playlist");
      }

      const updatedPlaylist = await response.json();
      setPlaylists(
        playlists.map((p) =>
          p.id === selectedPlaylist.id ? updatedPlaylist : p
        )
      );
      setEditDialogOpen(false);
      setSelectedPlaylist(null);
      setFormData({ name: "", description: "" });
      toast.success("Playlist updated successfully!");
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist");
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (!confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete playlist");
      }

      setPlaylists(playlists.filter((p) => p.id !== playlist.id));
      toast.success("Playlist deleted successfully!");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  };

  const openEditDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || "",
    });
    setEditDialogOpen(true);
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
            <Link href={`/playlists/${playlist.id}`} key={playlist.id}>
              <Card className="group hover:shadow-lg transition-shadow">
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
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base truncate">
                        {playlist.name}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(playlist)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePlaylist(playlist)}
                            className="text-red-600"
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
            </Link>
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
              <Button type="submit">Create Playlist</Button>
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
