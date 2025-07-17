"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Music, Album, Users, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Track } from "@/lib/definitions/Track";

interface Artist {
  id: number;
  name: string;
  profile_image_url: string | null;
  custom_url: string | null;
}

interface AlbumSuggestion {
  id: number;
  title: string;
  cover_image_url: string | null;
  custom_url: string | null;
  artist: {
    id: number;
    name: string;
    custom_url: string | null;
  };
}

interface SearchSuggestionsData {
  tracks: Track[];
  albums: AlbumSuggestion[];
  artists: Artist[];
  suggestions: string[];
}

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onTrackPlay: (track: Track) => void;
  onClose: () => void;
}

export function SearchSuggestions({ 
  query, 
  isVisible, 
  onSuggestionClick, 
  onTrackPlay,
  onClose 
}: SearchSuggestionsProps) {
  const [data, setData] = useState<SearchSuggestionsData>({
    tracks: [],
    albums: [],
    artists: [],
    suggestions: []
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setData({ tracks: [], albums: [], artists: [], suggestions: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/tracks/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Calculate position based on search input
  useEffect(() => {
    const updatePosition = () => {
      if (isVisible) {
        const searchInput = document.querySelector('input[placeholder*="Search songs"]') as HTMLInputElement;
        if (searchInput) {
          const rect = searchInput.getBoundingClientRect();
          setPosition({
            top: rect.bottom + window.scrollY + 2, // Reduced from 8 to 2
            left: rect.left + window.scrollX,
            width: rect.width
          });
        }
      }
    };

    updatePosition();

    // Update position on scroll to prevent floating
    const handleScroll = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    if (isVisible) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !query || query.length < 2) {
    return null;
  }

  const hasResults = data.tracks.length > 0 || data.albums.length > 0 || data.artists.length > 0;

  return (
    <div 
      ref={dropdownRef}
      className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto"
      style={{ 
        zIndex: 99999,
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`
      }}
      onWheel={(e) => {
        // Prevent scroll bubbling to page when dropdown is scrolled
        const element = e.currentTarget;
        const isScrolledToTop = element.scrollTop === 0;
        const isScrolledToBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;

        if ((isScrolledToTop && e.deltaY < 0) || (isScrolledToBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }}
    >
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
        </div>
      ) : !hasResults && data.suggestions.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
        </div>
      ) : (
        <div className="py-2">
          {/* Tracks */}
          {data.tracks.length > 0 && (
            <div className="px-4 py-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Music className="h-3 w-3" />
                Songs
              </h3>
              {data.tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => onTrackPlay(track)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {track.album?.cover_image_url ? (
                      <Image
                        src={track.album.cover_image_url}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {track.artist?.name} • {track.album?.title}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '--:--'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Albums */}
          {data.albums.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Album className="h-3 w-3" />
                Albums
              </h3>
              {data.albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/album/${album.custom_url || album.id}`}
                  onClick={onClose}
                  className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      {album.cover_image_url ? (
                        <Image
                          src={album.cover_image_url}
                          alt={album.title}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <Album className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate text-left">
                        {album.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-left">
                        Album • {album.artist?.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Artists */}
          {data.artists.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="h-3 w-3" />
                Artists
              </h3>
              {data.artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.custom_url || artist.id}`}
                  onClick={onClose}
                  className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      {artist.profile_image_url ? (
                        <Image
                          src={artist.profile_image_url}
                          alt={artist.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate text-left">
                        {artist.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-left">
                        Artist
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}