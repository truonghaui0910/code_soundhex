"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Play,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import Link from "next/link";
import { toast } from "sonner";
import { CreatePlaylistModal } from "@/components/playlist/create-playlist-modal";
import LibraryPlaylistsLoading from "./loading";
import { PlaylistGrid } from "@/components/music/playlist-grid";

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

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count?: number;
  created_at: string;
}

const ITEMS_PER_PAGE = 50;

export default function LibraryPlaylistsPage() {
  const { user } = useCurrentUser();
  const { playTrack, setTrackList } = useAudioPlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [editPlaylistOpen, setEditPlaylistOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  useEffect(() => {
    // Filter playlists based on search query
    if (searchQuery.trim() === "") {
      setFilteredPlaylists(playlists);
    } else {
      const filtered = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaylists(filtered);
      setCurrentPage(1); // Reset to first page when searching
    }
  }, [searchQuery, playlists]);

  // Auto open search when there's a query
  useEffect(() => {
    if (searchQuery && !isSearchOpen) {
      setIsSearchOpen(true);
    }
  }, [searchQuery, isSearchOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // This effect is no longer needed as menuRefs and openMenuId are removed.
      // Keeping it for now in case it's re-introduced later.
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Removed openMenuId from dependency array

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/playlists");
      const data = await response.json();
      setPlaylists(data || []);
      setFilteredPlaylists(data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistCreated = (newPlaylist: any) => {
    setPlaylists([newPlaylist, ...playlists]);
    setFilteredPlaylists([newPlaylist, ...filteredPlaylists]);
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
      setFilteredPlaylists(
        filteredPlaylists.map((p) =>
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
        setFilteredPlaylists(filteredPlaylists.filter((p) => p.id !== playlist.id));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPlaylists.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPlaylists = filteredPlaylists.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    return (
      <div className="flex items-center justify-center gap-4">
        <Button
          size="sm"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-300 hover:text-white transition-all duration-300 border-0"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* First page */}
          {currentPage > 3 && (
            <>
              <Button
                size="sm"
                onClick={() => handlePageChange(1)}
                className={`w-10 h-8 transition-all duration-300 border-0 ${
                  1 === currentPage
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-300 hover:text-white"
                }`}
              >
                1
              </Button>
              {currentPage > 4 && (
                <span className="text-purple-300">...</span>
              )}
            </>
          )}

          {/* Page numbers around current page */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNumber > totalPages) return null;

            return (
              <Button
                key={pageNumber}
                size="sm"
                onClick={() => handlePageChange(pageNumber)}
                className={`w-10 h-8 transition-all duration-300 border-0 ${
                  pageNumber === currentPage
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-300 hover:text-white"
                }`}
              >
                {pageNumber}
              </Button>
            );
          })}

          {/* Last page */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="text-purple-300">...</span>
              )}
              <Button
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                className={`w-10 h-8 transition-all duration-300 border-0 ${
                  totalPages === currentPage
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-300 hover:text-white"
                }`}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-300 hover:text-white transition-all duration-300 border-0"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return <LibraryPlaylistsLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/library" title="Back to library">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <ArrowLeft className="h-4 w-4 text-purple-300 group-hover:text-white transition-colors" />
              </div>
            </Link>
            <h1 className="text-xl sm:text-2xl font-normal">Your Playlists</h1>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Toggle/Input */}
            <div className="flex items-center">
              <Button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                title="Search playlists (Ctrl+K)"
                size="sm"
                className={`w-8 h-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 p-0 ${
                  isSearchOpen 
                    ? 'rounded-l-full rounded-r-none' 
                    : 'rounded-full'
                }`}
              >
                <Search className="h-4 w-4 text-purple-300" />
              </Button>
              
              {/* Inline Search Input */}
              {isSearchOpen && (
                <div className="relative animate-in slide-in-from-right-2 duration-200">
                  <Input
                    placeholder="Search playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 h-8 bg-white/10 border-0 text-white placeholder:text-purple-300 focus:ring-0 focus:outline-none rounded-r-full rounded-l-none pl-3 pr-8"
                    autoFocus
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-white h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Create Playlist Button */}
            <Button
              onClick={() => setCreatePlaylistOpen(true)}
              size="sm"
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 p-0"
            >
              <Plus className="h-4 w-4 text-purple-300" />
            </Button>
          </div>
        </div>



        {/* Playlists Grid */}
        {filteredPlaylists.length === 0 ? (
          <>
            <div className="text-center py-16">
              <List className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No playlists found" : "No playlists yet"}
              </h3>
              <p className="text-purple-300 mb-4">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "Create your first playlist to organize your favorite tracks"
                }
              </p>
              {!searchQuery && (
                <Link href="/playlists/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Playlist
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats Box for Empty State */}
            {playlists.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="bg-white/5 backdrop-blur-sm border border-purple-400/30 rounded-lg px-4 py-2">
                  <span className="text-sm text-purple-300">
                    Showing 0 of {playlists.length} playlists
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <PlaylistGrid 
              playlists={currentPlaylists}
              onPlaylistEdit={openEditDialog}
              onPlaylistDelete={openDeleteConfirm}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                {renderPaginationButtons()}
              </div>
            )}

            {/* Stats Box - Centered at Bottom */}
            <div className="flex justify-center mt-8">
              <div className="bg-white/5 backdrop-blur-sm border border-purple-400/30 rounded-lg px-4 py-2">
                <span className="text-sm text-purple-300">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredPlaylists.length)} of {filteredPlaylists.length} playlists
                </span>
              </div>
            </div>
          </>
        )}
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
                    setEditFormData({ ...editFormData, description: e.target.value })
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