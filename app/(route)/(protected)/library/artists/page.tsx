"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ArtistGrid } from "@/components/music/artist-grid";
import Link from "next/link";

interface FollowedArtist {
  id: number;
  name: string;
  profile_image_url: string | null;
  custom_url: string | null;
  tracksCount: number;
}

const ITEMS_PER_PAGE = 50;

export default function LibraryArtistsPage() {
  const { user } = useCurrentUser();
  const [artists, setArtists] = useState<FollowedArtist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<FollowedArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchArtists();
    }
  }, [user]);

  useEffect(() => {
    // Filter artists based on search query
    if (searchQuery.trim() === "") {
      setFilteredArtists(artists);
    } else {
      const filtered = artists.filter((artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArtists(filtered);
      setCurrentPage(1); // Reset to first page when searching
    }
  }, [searchQuery, artists]);

  const fetchArtists = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/followed-artists");
      if (response.ok) {
        const data = await response.json();
        setArtists(data || []);
        setFilteredArtists(data || []);
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredArtists.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArtists = filteredArtists.slice(startIndex, endIndex);

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
        <div className="text-white text-xl">Loading artists...</div>
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
            <UserPlus className="h-6 w-6 text-purple-300" />
            <h1 className="text-2xl font-bold">Followed Artists</h1>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <Input
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-purple-400 text-white placeholder:text-purple-300 focus:border-purple-300"
            />
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <span className="text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredArtists.length)} of {filteredArtists.length} artists
            </span>
          </div>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No artists found" : "No followed artists yet"}
            </h3>
            <p className="text-purple-300">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start following artists to see them here"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
              <ArtistGrid artists={currentArtists} className="contents" />
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