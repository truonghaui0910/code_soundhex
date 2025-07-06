
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Album, 
  List, 
  TrendingUp, 
  Users,
  Play,
  Clock,
  Calendar
} from "lucide-react";
import PlaylistManager from "@/components/playlist/playlist-manager";
import { AlbumsList } from "@/components/album/albums-list";
import { AlbumsController } from "@/lib/controllers/albums";
import { useEffect } from "react";

type TabType = "playlists" | "albums";

export default function YourLibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("playlists");
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumsData = await fetch('/api/albums/user');
        const result = await albumsData.json();
        setAlbums(result || []);
      } catch (error) {
        console.error('Error fetching albums:', error);
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "albums") {
      fetchAlbums();
    }
  }, [activeTab]);

  const stats = [
    {
      title: "Total Playlists",
      value: "12",
      icon: List,
      description: "Created playlists",
      trend: "+2 this month"
    },
    {
      title: "Total Albums",
      value: albums.length.toString(),
      icon: Album,
      description: "Your albums",
      trend: "+1 this week"
    },
    {
      title: "Total Tracks",
      value: "156",
      icon: Music,
      description: "All your music",
      trend: "+8 this week"
    },
    {
      title: "Listening Time",
      value: "24h",
      icon: Clock,
      description: "This month",
      trend: "+12% vs last month"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
              <p className="text-muted-foreground">
                Manage your playlists and albums in one place
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Library Content</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "playlists" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("playlists")}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  Playlists
                </Button>
                <Button
                  variant={activeTab === "albums" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("albums")}
                  className="flex items-center gap-2"
                >
                  <Album className="h-4 w-4" />
                  Albums
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "playlists" && (
            <div className="space-y-6">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <PlaylistManager />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "albums" && (
            <div className="space-y-6">
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Album className="h-5 w-5" />
                      Your Albums
                    </h3>
                    <Badge variant="secondary">
                      {albums.length} albums
                    </Badge>
                  </div>
                  
                  {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse">
                          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : albums.length > 0 ? (
                    <AlbumsList initialAlbums={albums} />
                  ) : (
                    <div className="text-center py-12">
                      <Album className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Albums Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven't created any albums yet. Upload some music to get started.
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        <Play className="mr-2 h-4 w-4" />
                        Upload Music
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                <p className="text-purple-100 mb-4">
                  Manage your library efficiently
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setActiveTab("playlists");
                      // Trigger create playlist dialog after tab switch
                      setTimeout(() => {
                        const createButton = document.querySelector('[data-create-playlist-button]') as HTMLButtonElement;
                        if (createButton) {
                          createButton.click();
                        }
                      }, 100);
                    }}
                  >
                    <List className="mr-2 h-4 w-4" />
                    Create Playlist
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.location.href = '/upload'}
                  >
                    <Album className="mr-2 h-4 w-4" />
                    Upload Album
                  </Button>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
