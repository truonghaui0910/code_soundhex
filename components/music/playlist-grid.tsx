"use client";

import { useState, memo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { List, Play, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { toast } from "sonner";

interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count?: number;
  created_at: string;
}

interface PlaylistGridProps {
  playlists: Playlist[];
  isLoading?: boolean;
  loadingCount?: number;
  onPlaylistPlay?: (playlist: Playlist) => void;
  onPlaylistEdit?: (playlist: Playlist) => void;
  onPlaylistDelete?: (playlist: Playlist) => void;
  showActions?: boolean;
  className?: string;
}

const PlaylistGrid = memo(function PlaylistGrid({
  playlists,
  isLoading = false,
  loadingCount = 12,
  onPlaylistPlay,
  onPlaylistEdit,
  onPlaylistDelete,
  showActions = false,
  className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6",
}: PlaylistGridProps) {
  const { setTrackList, playTrack } = useAudioPlayer();
  const [loadingPlaylists, setLoadingPlaylists] = useState<Set<number>>(
    new Set(),
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handlePlaylistPlay = useCallback(
    async (playlist: Playlist) => {
      console.log(
        `🎵 PlaylistGrid - Playing playlist: "${playlist.name}" (ID: ${playlist.id})`,
      );

      if (onPlaylistPlay) {
        console.log("🎵 PlaylistGrid - Using custom onPlaylistPlay callback");
        onPlaylistPlay(playlist);
        return;
      }

      if (playlist.track_count === 0) {
        toast.error("This playlist is empty");
        return;
      }

      // Set loading state for this playlist
      setLoadingPlaylists((prev) => new Set(prev).add(playlist.id));

      try {
        console.log(
          `🎵 PlaylistGrid - Fetching tracks for playlist ${playlist.id}...`,
        );
        const response = await fetch(`/api/playlists/${playlist.id}/tracks`);
        console.log(
          `🎵 PlaylistGrid - API response status: ${response.status}`,
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `🎵 PlaylistGrid - API Error ${response.status}:`,
            errorText,
          );
          toast.error(`Failed to load playlist: ${response.status} error`);
          return;
        }

        const tracksData = await response.json();
        console.log(`🎵 PlaylistGrid - API response data:`, {
          dataType: typeof tracksData,
          isArray: Array.isArray(tracksData),
          length: Array.isArray(tracksData) ? tracksData.length : "N/A",
        });

        if (tracksData.length === 0) {
          toast.error("This playlist is empty");
          return;
        }

        // Handle both formats: playlist_tracks with track property or direct tracks
        let tracks: Track[];
        if (tracksData[0]?.track) {
          tracks = tracksData.map((pt: any) => pt.track);
        } else {
          tracks = tracksData;
        }

        const processedTracks = tracks.map((track) => ({
          ...track,
          file_url: track.file_url || track.audio_file_url,
          audio_file_url: track.audio_file_url || track.file_url,
        }));

        const validTracks = processedTracks.filter(
          (track) =>
            track &&
            track.id &&
            track.title &&
            (track.file_url || track.audio_file_url),
        );

        if (validTracks.length === 0) {
          toast.error("No valid tracks found in playlist");
          return;
        }

        console.log(
          `🎵 PlaylistGrid - Setting trackList with ${validTracks.length} tracks`,
        );
        setTrackList(validTracks);

        // Add small delay to ensure setTrackList completes
        setTimeout(() => {
          console.log(
            `🎵 PlaylistGrid - Playing first track: "${validTracks[0].title}"`,
          );
          playTrack(validTracks[0]);
        }, 50);
      } catch (error) {
        console.error(
          "🎵 PlaylistGrid - Error loading playlist tracks:",
          error,
        );
        toast.error(
          `Failed to load playlist: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      } finally {
        // Remove loading state
        setLoadingPlaylists((prev) => {
          const newSet = new Set(prev);
          newSet.delete(playlist.id);
          return newSet;
        });
      }
    },
    [onPlaylistPlay, setTrackList, playTrack],
  );

  const toggleMenu = (playlistId: number) => {
    setOpenMenuId(openMenuId === playlistId ? null : playlistId);
  };

  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <div key={index} className="group text-center animate-pulse">
            <div className="relative aspect-square mb-3">
              <div className="w-full h-full bg-white/20 rounded-lg"></div>

              {/* Play Button Skeleton - Center */}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white/20"></div>
              </div>

              {/* Menu Button Skeleton - Top Right */}
              <div className="absolute top-2 right-2">
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Playlist Name Skeleton */}
              <div className="h-4 w-24 mx-auto bg-white/20 rounded"></div>

              {/* Track Count Skeleton */}
              <div className="h-3 w-16 mx-auto bg-white/20 rounded"></div>

              {/* Description Skeleton */}
              <div className="h-3 w-20 mx-auto bg-white/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {playlists.map((playlist) => (
        <div key={playlist.id} className="group cursor-pointer text-center">
          <div className="relative aspect-square mb-3">
            <Link href={`/playlists/${playlist.id}`}>
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg relative overflow-hidden">
                {playlist.cover_image_url ? (
                  <img
                    src={playlist.cover_image_url}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <List className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </Link>

            {/* Play Button - Center */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
              <Button
                size="sm"
                onClick={(e) => {
                  // console.log(`🎵 PlaylistGrid - Play button clicked for playlist: "${playlist.name}" (ID: ${playlist.id})`);
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlaylistPlay(playlist);
                }}
                disabled={loadingPlaylists.has(playlist.id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:scale-100 w-10 h-10 p-0"
              >
                {loadingPlaylists.has(playlist.id) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Three Dots Menu - Top Right */}
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMenu(playlist.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full bg-white/90 text-purple-600 hover:bg-white hover:scale-110 shadow-lg backdrop-blur-sm w-8 h-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {/* Dropdown Menu */}
              <div
                ref={(el) => {
                  menuRefs.current[playlist.id] = el;
                }}
                className={`absolute right-0 mt-2 w-80 z-[100] bg-purple-900 border border-purple-700 shadow-2xl rounded-xl overflow-hidden ${
                  openMenuId === playlist.id ? "" : "hidden"
                }`}
              >
                {/* Header Section */}
                <div className="p-4 border-b border-purple-700">
                  <div className="flex items-start gap-3">
                    {/* Playlist Cover */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {playlist.cover_image_url ? (
                        <img
                          src={playlist.cover_image_url}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <List className="h-6 w-6 text-white" />
                      )}
                    </div>

                    {/* Playlist Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg truncate text-left">
                        {playlist.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-purple-300 text-sm">
                        <div className="flex items-center gap-1">
                          <List className="h-3 w-3" />
                          <span>{playlist.track_count || 0} tracks</span>
                        </div>
                        {playlist.description && (
                          <div className="flex items-center gap-1">
                            <span className="truncate">
                              {playlist.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action List */}
                <div className="py-2">
                  {onPlaylistEdit && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPlaylistEdit(playlist);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-3" />
                      <span className="text-sm">Edit Playlist</span>
                    </button>
                  )}
                  {onPlaylistDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPlaylistDelete(playlist);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      <span className="text-sm">Delete Playlist</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Link href={`/playlists/${playlist.id}`} className="block">
              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                {playlist.name}
              </h3>
            </Link>
            <p className="text-sm text-purple-300 truncate">
              {playlist.track_count || 0} tracks
            </p>
            {playlist.description && (
              <p className="text-xs text-purple-400 truncate">
                {playlist.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

PlaylistGrid.displayName = "PlaylistGrid";

export { PlaylistGrid };
