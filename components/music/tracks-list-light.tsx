"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Play, MoreHorizontal, Clock, Headphones, Plus, Download, Share, Music, Ban, ListMusic, SkipForward, Radio, Settings, Link as LinkIcon, ChevronRight, Search, Check, Lock, Globe, Loader2 } from "lucide-react";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useDownload } from "@/hooks/use-download";
import { Track } from "@/lib/definitions/Track";
import Link from "next/link";
import { toast } from "sonner";
import AddToPlaylist from "@/components/playlist/add-to-playlist";


interface LikedTrack {
  id: number;
  title: string;
  custom_url?: string;
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
  view_count?: number;
}

interface TracksListLightProps {
  tracks: LikedTrack[];
  className?: string;
}

// Helper function to format time in minutes:seconds
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to format view count
const formatViewCount = (count: number) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

export default function TracksListLight({ tracks, className = "" }: TracksListLightProps) {
  const { playTrack, currentTrack, isPlaying, togglePlayPause, setTrackList } = useAudioPlayer();
  const { getTrackLikeStatus, fetchBatchTrackLikesStatus, toggleTrackLike } = useLikesFollows();
  const { downloadTrack } = useDownload();

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openPlaylistMenuId, setOpenPlaylistMenuId] = useState<number | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const playlistMenuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
      if (openPlaylistMenuId !== null) {
        const playlistMenuElement = playlistMenuRefs.current[openPlaylistMenuId];
        if (playlistMenuElement && !playlistMenuElement.contains(event.target as Node)) {
          setOpenPlaylistMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, openPlaylistMenuId]);

  // Batch fetch like status for all tracks
  useEffect(() => {
    if (tracks.length > 0) {
      const trackIds = tracks.map(track => track.id);
      // Only fetch for tracks that haven't been fetched yet
      const unfetchedTrackIds = trackIds.filter(id => {
        const status = getTrackLikeStatus(id);
        return status.isLiked === undefined && !status.isLoading;
      });

      if (unfetchedTrackIds.length > 0) {
        fetchBatchTrackLikesStatus(unfetchedTrackIds);
      }
    }
  }, [tracks, fetchBatchTrackLikesStatus, getTrackLikeStatus]);

  const toggleMenu = (trackId: number) => {
    setOpenMenuId(openMenuId === trackId ? null : trackId);
  };

  const togglePlaylistMenu = (trackId: number) => {
    console.log('togglePlaylistMenu called with trackId:', trackId, 'current openPlaylistMenuId:', openPlaylistMenuId);
    if (openPlaylistMenuId === trackId) {
      setOpenPlaylistMenuId(null);
    } else {
      setOpenPlaylistMenuId(trackId);
      fetchPlaylists();
    }
  };

  const fetchPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      const response = await fetch("/api/playlists");
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number, trackId: number, trackTitle: string) => {
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
      setOpenPlaylistMenuId(null);
    } catch (error: any) {
      console.error("Error adding track to playlist:", error);
      if (error.message === "Track already exists in playlist") {
        toast.error("This track is already in the playlist");
      } else {
        toast.error(error.message || "Failed to add track to playlist");
      }
    }
  };

  const handleTrackPlay = (track: LikedTrack) => {
    const trackToPlay: Track = {
      id: track.id,
      title: track.title,
      artist: {
        id: track.artist.id,
        name: track.artist.name,
        custom_url: track.artist.custom_url || track.artist.id.toString(),
        profile_image_url: track.artist.profile_image_url,
      },
      album: track.album ? {
        id: track.album.id,
        title: track.album.title,
        cover_image_url: track.album.cover_image_url,
      } : undefined,
      duration: track.duration || null,
      file_url: track.file_url,
      view_count: track.view_count,
    };

    if (currentTrack?.id === track.id && isPlaying) {
      togglePlayPause();
    } else {
      playTrack(trackToPlay);
    }
  };

  const handleTogglePlay = (track: LikedTrack) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      handleTrackPlay(track);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
        <p className="text-purple-300">No liked songs yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;
        const likeStatus = getTrackLikeStatus(track.id);

        return (
          <div
            key={track.id}
            className={`group flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer
              hover:bg-white/10
              ${isCurrentTrack && isPlaying ? 'bg-white/10' : ''}
            `}
            onClick={() => handleTrackPlay(track)}
          >
            {/* Track Cover */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
              {track.album?.cover_image_url ? (
                <img
                  src={track.album.cover_image_url}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <div className="text-white text-lg font-bold">
                    {track.title.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <div
                className={
                  "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center " +
                  (isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100")
                }
              >
                {isCurrentlyPlaying ? (
                  <div className="flex items-end space-x-0.5 h-5">
                    <div className="w-1 bg-white animate-equalize-1" style={{ height: "30%" }}></div>
                    <div className="w-1 bg-white animate-equalize-2" style={{ height: "100%" }}></div>
                    <div className="w-1 bg-white animate-equalize-3" style={{ height: "60%" }}></div>
                    <div className="w-1 bg-white animate-equalize-4" style={{ height: "80%" }}></div>
                  </div>
                ) : (
                  <Play className="h-6 w-6 text-white fill-white" />
                )}
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/track/${track.custom_url || track.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block"
              >
                <p className="font-medium truncate hover:text-purple-300 transition-colors">{track.title}</p>
              </Link>
              <Link
                href={`/artist/${track.artist.custom_url || track.artist.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block"
              >
                <p className="text-sm text-purple-300 hover:text-white transition-colors truncate">
                  {track.artist.name}
                </p>
              </Link>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center gap-3">
              {/* View Count */}
              {track.view_count !== undefined && track.view_count > 0 && (
                <div className="flex items-center gap-1 text-xs text-purple-300">
                  <Headphones className="h-3 w-3" />
                  <span className="font-mono">{formatViewCount(track.view_count)}</span>
                </div>
              )}

              {/* Like Button - Fixed Position */}
              <div className="w-8 h-8 flex items-center justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTrackLike(track.id);
                  }}
                  disabled={likeStatus.isLoading}
                  title={likeStatus.isLiked ? "Remove from liked songs" : "Add to liked songs"}
                  className={`p-1 h-8 w-8 transition-all duration-200 dark:hover:bg-white/10 ${likeStatus.isLiked
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-purple-300 hover:text-white'
                    }`}
                >
                  <Heart
                    className={`h-4 w-4 ${likeStatus.isLiked ? 'fill-current' : ''}`}
                  />
                </Button>
              </div>

              {/* Duration and Menu Container - Fixed Width */}
              <div className="w-20 flex items-center justify-center gap-2">
                {/* Duration (hidden when menu is open) */}
                <div className={`${openMenuId === track.id ? 'hidden' : 'flex'} items-center gap-1 text-xs text-purple-300`}>
                  <Clock className="h-3 w-3" />
                  <span className="font-mono">{formatDuration(track.duration || null)}</span>
                </div>

                {/* Three Dots Menu (always visible) */}
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMenu(track.id);
                    }}
                    className="p-1 h-8 w-8 text-purple-300 hover:text-white dark:hover:bg-white/10"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  <div
                    ref={(el) => {
                      menuRefs.current[track.id] = el;
                    }}
                    className={`absolute right-0 mt-2 w-80 z-[100] bg-purple-900 border border-purple-700 shadow-2xl rounded-xl overflow-hidden ${openMenuId === track.id ? '' : 'hidden'
                      }`}
                  >
                    {/* Header Section */}
                    <div className="p-4 border-b border-purple-700">
                      <div className="flex items-start gap-3">
                        {/* Artist Profile Picture */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                          {track.artist.profile_image_url ? (
                            <img
                              src={track.artist.profile_image_url}
                              alt={track.artist.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {track.artist.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg truncate">
                            {track.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-purple-300 text-sm">
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{formatViewCount(likeStatus.totalLikes || 0)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Headphones className="h-3 w-3" />
                              <span>{formatViewCount(track.view_count || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>



                    {/* Action List */}
                    <div className="py-2">
                      {/* <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          <span className="text-sm">Add to Queue</span>
                        </button>
                      </AddToPlaylist> */}
{/* 
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Add to queue next
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                      >
                        <SkipForward className="h-4 w-4 mr-3" />
                        <span className="text-sm">Play Next</span>
                      </button> */}

                      {/* <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Play similar content
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                      >
                        <Radio className="h-4 w-4 mr-3" />
                        <span className="text-sm">Play Similar</span>
                      </button> */}



                      <AddToPlaylist trackId={track.id} trackTitle={track.title}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-3" />
                          <span className="text-sm">Add to Playlist</span>
                        </button>
                      </AddToPlaylist>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const trackToDownload: Track = {
                            id: track.id,
                            title: track.title,
                            artist: {
                              id: track.artist.id,
                              name: track.artist.name,
                              custom_url: track.artist.custom_url || track.artist.id.toString(),
                              profile_image_url: track.artist.profile_image_url,
                            },
                            album: track.album ? {
                              id: track.album.id,
                              title: track.album.title,
                              cover_image_url: track.album.cover_image_url,
                            } : undefined,
                            duration: track.duration || null,
                            file_url: track.file_url,
                            view_count: track.view_count,
                          };
                          downloadTrack(trackToDownload);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-3" />
                        <span className="text-sm">Download</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = `${window.location.origin}/track/${track.custom_url || track.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Link copied to clipboard!');
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                      >
                        <LinkIcon className="h-4 w-4 mr-3" />
                        <span className="text-sm">Copy Link</span>
                      </button>


                    </div>


                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 