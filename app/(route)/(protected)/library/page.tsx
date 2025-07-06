"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Album, 
  List, 
  Upload,
  Play,
  Pause,
  Clock,
  Plus,
  MoreVertical,
  Download,
  Heart,
  Trash2,
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { AlbumsController } from "@/lib/controllers/albums";
import { PlaylistsController } from "@/lib/controllers/playlists";
import { TracksController } from "@/lib/controllers/tracks";
import { Track } from "@/lib/definitions/Track";
import { toast } from "sonner";
import { useDownload } from "@/hooks/use-download";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { PlaylistManager } from "@/components/playlist/playlist-manager";

interface LibraryStats {
  totalPlaylists: number;
  totalAlbums: number;
  totalTracks: number;
  playlistsThisMonth: number;
  albumsThisWeek: number;
  tracksThisWeek: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"albums" | "playlists">("albums");
  const [albums, setAlbums] = useState<any[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const { currentTrack, isPlaying, playTrack, setTrackList, togglePlayPause } = useAudioPlayer();
  const { downloadTrack, isTrackDownloading } = useDownload();

  useEffect(() => {
    fetchUserAlbums();
    fetchLibraryStats();
  }, []);

  const fetchLibraryStats = async () => {
    try {
      setIsStatsLoading(true);
      const response = await fetch('/api/library/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching library stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/albums/user');
      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }
      const albumsData = await response.json();
      setAlbums(albumsData);

      // Lấy tracks từ tất cả albums
      const allTracks: Track[] = [];
      for (const album of albumsData) {
        try {
          const albumTracks = await TracksController.getTracksByAlbum(album.id);
          allTracks.push(...albumTracks);
        } catch (error) {
          console.error(`Error fetching tracks for album ${album.id}:`, error);
        }
      }
      setTracks(allTracks);
    } catch (error) {
      console.error('Error fetching user albums:', error);
      toast.error('Failed to load albums');
    } finally {
      setIsLoading(false);
    }
  };

{/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Playlists</p>
                  {isStatsLoading ? (
                    <div className="h-10 bg-white/20 rounded animate-pulse mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold mt-2">{stats?.totalPlaylists || 0}</p>
                  )}
                  <p className="text-sm opacity-75 mt-1">Created playlists</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">+{stats?.playlistsThisMonth || 2} this month</span>
                  </div>
                </div>
                <List className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Albums</p>
                  {isStatsLoading ? (
                    <div className="h-10 bg-white/20 rounded animate-pulse mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold mt-2">{stats?.totalAlbums || 0}</p>
                  )}
                  <p className="text-sm opacity-75 mt-1">Your albums</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">+{stats?.albumsThisWeek || 1} this week</span>
                  </div>
                </div>
                <Album className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Tracks</p>
                  {isStatsLoading ? (
                    <div className="h-10 bg-white/20 rounded animate-pulse mt-2"></div>
                  ) : (
                    <p className="text-3xl font-bold mt-2">{stats?.totalTracks || 0}</p>
                  )}
                  <p className="text-sm opacity-75 mt-1">All your music</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">+{stats?.tracksThisWeek || 8} this week</span>
                  </div>
                </div>
                <Music className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Library</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your music collection
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab("albums")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${activeTab === "albums"
                ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              Albums
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${activeTab === "playlists"
                ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              Playlists
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "albums" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-md mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md mb-1"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-md w-2/3"></div>
                  </div>
                ))
              ) : (
                // Album list
                albums?.map((album) => (
                  <div
                    key={album.id}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/album/${album.id}`)}
                  >
                    <div className="aspect-square relative rounded-md overflow-hidden">
                      <Image
                        src={album.coverUrl}
                        alt={album.name}
                        className="object-cover rounded-md"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-2 truncate">
                      {album.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                      {album.artist}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "playlists" && (
          <div>
            <PlaylistManager />
          </div>
        )}
      </div>
    </div>
  );
}