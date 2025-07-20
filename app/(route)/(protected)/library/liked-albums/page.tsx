"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Album as AlbumIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Play,
  Heart,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import Link from "next/link";
import { toast } from "sonner";

interface LikedAlbum {
  id: number;
  title: string;
  cover_image_url?: string;
  custom_url?: string;
  artist: {
    id: number;
    name: string;
    custom_url?: string;
    profile_image_url?: string;
  };
  release_date?: string;
  track_count?: number;
}

const ITEMS_PER_PAGE = 50;

export default function LibraryLikedAlbumsPage() {
  const { user } = useCurrentUser();
  const { playTrack, setTrackList } = useAudioPlayer();
  const { toggleAlbumLike } = useLikesFollows();
  const [albums, setAlbums] = useState<LikedAlbum[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<LikedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchLikedAlbums();
    }
  }, [user]);

  useEffect(() => {
    // Filter albums based on search query
    if (searchQuery.trim() === "") {
      setFilteredAlbums(albums);
    } else {
      const filtered = albums.filter((album) =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAlbums(filtered);
      setCurrentPage(1); // Reset to first page when searching
    }
  }, [searchQuery, albums]);

  const fetchLikedAlbums = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/liked-albums");
      if (response.ok) {
        const data = await response.json();
        setAlbums(data || []);
        setFilteredAlbums(data || []);
      }
    } catch (error) {
      console.error("Error fetching liked albums:", error);
    } finally {
      setIsLoading(false);
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
          toast.success(`Playing "${album.title}" - ${tracksArray.length} tracks`);
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
    // Remove from local state immediately for better UX
    setAlbums(prev => prev.filter(album => album.id !== albumId));
    setFilteredAlbums(prev => prev.filter(album => album.id !== albumId));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-white/10 border-purple-400 text-white hover:bg-white/20"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // First page
    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          className="bg-white/10 border-purple-400 text-white hover:bg-white/20"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="text-purple-300">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={
            currentPage === i
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-white/10 border-purple-400 text-white hover:bg-white/20"
          }
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="text-purple-300">
            ...
          </span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="bg-white/10 border-purple-400 text-white hover:bg-white/20"
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-white/10 border-purple-400 text-white hover:bg-white/20"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading liked albums...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/library">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <AlbumIcon className="h-6 w-6 text-purple-300" />
            <h1 className="text-2xl font-bold">Liked Albums</h1>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <Input
              placeholder="Search liked albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-purple-400 text-white placeholder:text-purple-300 focus:border-purple-300"
            />
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <span className="text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAlbums.length)} of {filteredAlbums.length} albums
            </span>
          </div>
        </div>

        {/* Albums Grid */}
        {filteredAlbums.length === 0 ? (
          <div className="text-center py-16">
            <AlbumIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No albums found" : "No liked albums yet"}
            </h3>
            <p className="text-purple-300">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start liking albums to see them here"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
              {currentAlbums.map((album) => (
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
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-red-500/90 text-white hover:bg-red-600 shadow-lg backdrop-blur-sm"
                        >
                          <Heart className="h-4 w-4 fill-current" />
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
                    {album.release_date && (
                      <p className="text-xs text-purple-400">
                        {new Date(album.release_date).getFullYear()}
                      </p>
                    )}
                    {album.track_count && (
                      <p className="text-xs text-purple-400">
                        {album.track_count} tracks
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {renderPaginationButtons()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 