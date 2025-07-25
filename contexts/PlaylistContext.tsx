
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  track_count: number;
  private: boolean;
  created_at: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  refetchPlaylists: () => Promise<void>;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (id: number, updates: Partial<Playlist>) => void;
  removePlaylist: (id: number) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    if (!user) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/playlists");
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setError(err instanceof Error ? err.message : "Failed to load playlists");
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchPlaylists = async () => {
    await fetchPlaylists();
  };

  const addPlaylist = (playlist: Playlist) => {
    setPlaylists(prev => [playlist, ...prev]);
  };

  const updatePlaylist = (id: number, updates: Partial<Playlist>) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist.id === id ? { ...playlist, ...updates } : playlist
      )
    );
  };

  const removePlaylist = (id: number) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== id));
  };

  // Fetch playlists when user changes
  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        isLoading,
        error,
        refetchPlaylists,
        addPlaylist,
        updatePlaylist,
        removePlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
