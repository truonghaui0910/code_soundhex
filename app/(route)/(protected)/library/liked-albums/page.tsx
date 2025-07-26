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
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { AlbumGrid } from "@/components/music/album-grid";
import Link from "next/link";
import { toast } from "sonner";
import LikedAlbumsLoading from "./loading";

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
      const filtered = albums.filter(
        (album) =>
          album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          album.artist.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
              {currentPage > 4 && <span className="text-purple-300">...</span>}
            </>
          )}

          {/* Page numbers around current page */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber =
              Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
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
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
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
    return <LikedAlbumsLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/library" title="Back to library">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <ArrowLeft className="h-4 w-4 text-purple-300 group-hover:text-white transition-colors" />
              </div>
            </Link>
            <h1 className="text-xl sm:text-2xl font-normal">Liked Albums</h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex items-center">
              <Search className="h-4 w-4 absolute left-3 text-purple-300" />
              <Input
                placeholder="Search liked albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-8 bg-white/10 border-0 text-white placeholder:text-purple-300 focus:ring-0 focus:outline-none rounded-full pl-10 pr-4"
              />
            </div>
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
                : "Start liking albums to see them here"}
            </p>
          </div>
        ) : (
          <>
            <AlbumGrid
              albums={currentAlbums.map((album) => ({
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
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {renderPaginationButtons()}
              </div>
            )}

            {/* Stats Box - Centered at Bottom */}
            <div className="flex justify-center mt-8">
              <div className="bg-white/5 backdrop-blur-sm border border-purple-400/30 rounded-lg px-4 py-2">
                <span className="text-sm text-purple-300">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredAlbums.length)} of{" "}
                  {filteredAlbums.length} albums
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
