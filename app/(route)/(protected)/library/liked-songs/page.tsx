"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Play,
  Music,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { Track } from "@/lib/definitions/Track";
import Link from "next/link";

interface LikedTrack {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
    profile_image_url?: string;
    custom_url?: string;
  };
  album?: {
    id: number;
    title: string;
    cover_image_url?: string;
    custom_url?: string;
  };
  duration?: number;
  file_url?: string;
  created_at?: string;
}

const ITEMS_PER_PAGE = 50;

export default function LibraryLikedSongsPage() {
  const { user } = useCurrentUser();
  const { playTrack, currentTrack, isPlaying, togglePlayPause, setTrackList } = useAudioPlayer();
  const { toggleTrackLike } = useLikesFollows();
  const [tracks, setTracks] = useState<LikedTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<LikedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user) {
      fetchLikedTracks();
    }
  }, [user]);

  useEffect(() => {
    // Filter tracks based on search query
    if (searchQuery.trim() === "") {
      setFilteredTracks(tracks);
    } else {
      const filtered = tracks.filter((track) =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTracks(filtered);
      setCurrentPage(1); // Reset to first page when searching
    }
  }, [searchQuery, tracks]);

  const fetchLikedTracks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/liked-tracks");
      if (response.ok) {
        const data = await response.json();
        setTracks(data || []);
        setFilteredTracks(data || []);
      }
    } catch (error) {
      console.error("Error fetching liked tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPlay = (track: LikedTrack) => {
    const trackToPlay: Track = {
      id: track.id,
      title: track.title,
      artist: {
        ...track.artist,
        custom_url: track.artist.custom_url || "",
      },
      album: track.album,
      duration: track.duration ?? null,
      file_url: track.file_url,
      view_count: 0,
    };

    if (currentTrack?.id === track.id && isPlaying) {
      togglePlayPause();
    } else {
      // Set the track list to all visible tracks for continuous playback
      const trackList: Track[] = filteredTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: {
          ...t.artist,
          custom_url: t.artist.custom_url || "",
        },
        album: t.album,
        duration: t.duration ?? null,
        file_url: t.file_url,
        view_count: 0,
      }));
      setTrackList(trackList);
      playTrack(trackToPlay);
    }
  };

  const handleUnlike = async (trackId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleTrackLike(trackId);
    // Remove from local state immediately for better UX
    setTracks(prev => prev.filter(track => track.id !== trackId));
    setFilteredTracks(prev => prev.filter(track => track.id !== trackId));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTracks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTracks = filteredTracks.slice(startIndex, endIndex);

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
        <div className="text-white text-xl">Loading liked songs...</div>
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
            <Heart className="h-6 w-6 text-red-400" />
            <h1 className="text-2xl font-bold">Liked Songs</h1>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <Input
              placeholder="Search liked songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-purple-400 text-white placeholder:text-purple-300 focus:border-purple-300"
            />
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <span className="text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTracks.length)} of {filteredTracks.length} songs
            </span>
          </div>
        </div>

        {/* Play All Button */}
        {filteredTracks.length > 0 && (
          <div className="mb-6">
            <Button
                             onClick={() => {
                 const trackList: Track[] = filteredTracks.map(t => ({
                   id: t.id,
                   title: t.title,
                   artist: {
                     ...t.artist,
                     custom_url: t.artist.custom_url || "",
                   },
                   album: t.album,
                   duration: t.duration ?? null,
                   file_url: t.file_url,
                   view_count: 0,
                 }));
                 setTrackList(trackList);
                 playTrack(trackList[0]);
               }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
            >
              <Play className="h-5 w-5 mr-2" />
              Play All ({filteredTracks.length} songs)
            </Button>
          </div>
        )}

        {/* Tracks List */}
        {filteredTracks.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No songs found" : "No liked songs yet"}
            </h3>
            <p className="text-purple-300">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start liking songs to see them here"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-8">
              {currentTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => handleTrackPlay(track)}
                >
                  {/* Track Number / Play Button */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-purple-300 group-hover:hidden">
                      {startIndex + index + 1}
                    </span>
                    <Play className="h-4 w-4 text-white hidden group-hover:block mx-auto" />
                  </div>

                  {/* Track Cover */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {track.album?.cover_image_url ? (
                      <img
                        src={track.album.cover_image_url}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="h-6 w-6 text-white" />
                    )}
                    {currentTrack?.id === track.id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      currentTrack?.id === track.id ? 'text-purple-300' : 'text-white'
                    }`}>
                      {track.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/artist/${track.artist.custom_url || track.artist.id}`}
                        className="text-sm text-purple-300 hover:text-white transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {track.artist.name}
                      </Link>
                      {track.album && (
                        <>
                          <span className="text-purple-400">•</span>
                          <Link 
                            href={`/album/${track.album.custom_url || track.album.id}`}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {track.album.title}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex-shrink-0 text-sm text-purple-300 hidden sm:block">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Unlike Button */}
                  <div className="flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleUnlike(track.id, e)}
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
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