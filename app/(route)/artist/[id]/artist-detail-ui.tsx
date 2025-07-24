// app/(route)/artist/[id]/artist-detail-ui.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { TrackList } from "@/components/music/track-list";
import { AlbumGrid } from "@/components/music/album-grid";
import { TrackGridSm } from "@/components/music/track-grid-sm";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useUser } from "@/contexts/UserContext";
import {
  Play,
  Pause,
  Clock,
  Music,
  Heart,
  Share,
  Users,
  Album,
  Download,
  Plus,
  ArrowLeft,
  Check
} from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { Track } from "@/lib/definitions/Track";
import { useDownload } from "@/hooks/use-download";
import AddToPlaylist from "@/components/playlist/add-to-playlist";
import { EditArtistModal } from "@/components/artist/edit-artist-modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { showSuccess } from "@/lib/services/notification-service";
import { ArtistGrid } from "@/components/music/artist-grid";

// Helper function to format time
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface Artist {
  id: number;
  name: string;
  profile_image_url: string | null;
  bio: string | null;
  created_at: string | null;
  custom_url: string | null;
  social: string[] | null;
  user_id: string | null;
}

interface Album {
  id: number;
  title: string;
  cover_image_url: string | null;
  artist: {
    id: number;
    name: string;
  };
  release_date: string | null;
}

interface ArtistDetailUIProps {
  artist: Artist;
  tracks: Track[];
  albums: Album[];
}

export function ArtistDetailUI({ artist, tracks, albums }: ArtistDetailUIProps) {
  const [currentArtist, setCurrentArtist] = useState(artist);
  const [recommendedArtists, setRecommendedArtists] = useState<any[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const {
    currentTrack,
    isPlaying,
    playTrack,
    setTrackList,
    togglePlayPause,
  } = useAudioPlayer();
  const {
    downloadTrack,
    downloadMultipleTracks,
    isDownloading,
    isTrackDownloading,
  } = useDownload();
  const { getArtistFollowStatus, fetchArtistFollowStatus, toggleArtistFollow } = useLikesFollows();
  const { user: currentUser } = useUser();

  const getSocialIcon = (url: string) => {
    if (url.includes('instagram.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
          <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
        </svg>
      );
    }
    if (url.includes('facebook.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      );
    }
    if (url.includes('youtube.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
          <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white"/>
        </svg>
      );
    }
    if (url.includes('tiktok.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    }
    if (url.includes('spotify.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.301 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      );
    }
    if (url.includes('soundcloud.com')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.104.101.104.05 0 .093-.046.1-.104l.255-2.105-.255-2.154c-.007-.058-.05-.1-.1-.1zm1.73.027c-.058 0-.106.053-.113.12l-.193 2.128.193 2.042c.007.067.055.12.113.12.057 0 .105-.053.112-.12l.213-2.042-.213-2.128c-.007-.067-.055-.12-.112-.12zm1.73.013c-.067 0-.121.061-.129.136l-.172 2.115.172 2.019c.008.075.062.136.129.136.066 0 .12-.061.128-.136l.19-2.019-.19-2.115c-.008-.075-.062-.136-.128-.136zm1.73.026c-.075 0-.135.069-.143.154l-.152 2.089.152 1.999c.008.085.068.154.143.154.074 0 .135-.069.142-.154l.168-1.999-.168-2.089c-.007-.085-.068-.154-.142-.154zm1.73.022c-.083 0-.151.076-.16.17l-.133 2.067.133 1.977c.009.094.077.17.16.17.082 0 .15-.076.159-.17l.147-1.977-.147-2.067c-.009-.094-.077-.17-.159-.17zm1.73.018c-.091 0-.165.084-.175.188l-.114 2.049.114 1.955c.01.104.084.188.175.188.09 0 .164-.084.174-.188l.126-1.955-.126-2.049c-.01-.104-.084-.188-.174-.188zm1.73.014c-.1 0-.18.092-.191.206l-.095 2.035.095 1.934c.011.114.091.206.191.206.099 0 .179-.092.19-.206l.105-1.934-.105-2.035c-.011-.114-.091-.206-.19-.206zm1.73.01c-.108 0-.195.1-.207.223l-.075 2.021.075 1.913c.012.123.099.223.207.223.107 0 .194-.1.206-.223l.084-1.913-.084-2.021c-.012-.123-.099-.223-.206-.223zm1.73.007c-.116 0-.21.108-.223.24l-.056 2.007.056 1.892c.013.132.107.24.223.24.115 0 .209-.108.222-.24l.063-1.892-.063-2.007c-.013-.132-.107-.24-.222-.24zm1.73.004c-.124 0-.224.116-.238.258l-.037 1.993.037 1.87c.014.142.114.258.238.258.123 0 .223-.116.237-.258l.042-1.87-.042-1.993c-.014-.142-.114-.258-.237-.258zM18.01 9.188c-.381 0-.747.1-1.061.277a6.685 6.685 0 0 0-11.912 4.337l.016 4.026c.014.143.131.258.274.258h12.683c.694 0 1.26-.563 1.26-1.258v-6.382c0-.695-.566-1.258-1.26-1.258z"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    );
  };

  const getSocialName = (url: string) => {
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('youtube.com')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('spotify.com')) return 'Spotify';
    if (url.includes('soundcloud.com')) return 'SoundCloud';
    return 'Website';
  };

  const getSocialColor = (url: string) => {
    if (url.includes('instagram.com')) return 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20';
    if (url.includes('facebook.com')) return 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20';
    if (url.includes('youtube.com')) return 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20';
    if (url.includes('tiktok.com')) return 'text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700';
    if (url.includes('spotify.com')) return 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20';
    if (url.includes('soundcloud.com')) return 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20';
    return 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700';
  };

  const handlePlayAllTracks = () => {
    if (tracks && tracks.length > 0) {
      setTrackList(tracks);
      setTimeout(() => {
        playTrack(tracks[0]);
      }, 50);
    }
  };

  // TrackGridSm now handles its own play logic, no need for custom handler

  const handleArtistUpdate = (updatedArtist: Artist) => {
    setCurrentArtist(updatedArtist);

    // If custom URL was updated, change the browser URL
    if (updatedArtist.custom_url && updatedArtist.custom_url !== artist.custom_url) {
      window.history.replaceState({}, '', `/artist/${updatedArtist.custom_url}`);
    }
  };

    // Fetch artist follow status when component mounts
    useEffect(() => {
      if (artist.id) {
        fetchArtistFollowStatus(artist.id);
      }
    }, [artist.id, fetchArtistFollowStatus]);

    // Fetch recommended artists
    useEffect(() => {
      const fetchRecommendedArtists = async () => {
        if (artist.id) {
          setLoadingRecommended(true);
          try {
            const response = await fetch(`/api/artists/${artist.id}/recommended`);
            if (response.ok) {
              const data = await response.json();
              setRecommendedArtists(data.artists || []);
            }
          } catch (error) {
            console.error("Error fetching recommended artists:", error);
          } finally {
            setLoadingRecommended(false);
          }
        }
      };

      fetchRecommendedArtists();
    }, [artist.id]);

    const artistFollowStatus = getArtistFollowStatus(artist.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="flex flex-col items-center gap-4">
              {/* Back to Music Button - moved closer to image and centered */}
              <Link href="/music">
                <Button
                  size="sm"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Music
                </Button>
              </Link>
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              {artist.profile_image_url ? (
                <Image
                  src={artist.profile_image_url}
                  alt={artist.name}
                  width={256}
                  height={256}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Users className="h-20 w-20 text-white/60" />
              )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <Badge className="bg-white/20 text-white border-white/30 w-fit mx-auto md:mx-0">
                Artist
              </Badge>
              <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-2 md:gap-4 items-center">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight text-center md:text-left">
                  {currentArtist.name}
                </h1>
                {currentUser?.id === currentArtist.user_id && (
                  <div className="md:ml-0">
                    <EditArtistModal 
                      artist={currentArtist} 
                      onUpdate={handleArtistUpdate}
                    />
                  </div>
                )}
              </div>
              {currentArtist.bio && (
                <p className="text-lg text-purple-100 max-w-2xl">
                  {currentArtist.bio}
                </p>
              )}

              {/* Social Links */}
              {(() => {
                const socialLinks = currentArtist.social;
                let parsedSocial = [];

                if (Array.isArray(socialLinks)) {
                  parsedSocial = socialLinks;
                } else if (typeof socialLinks === 'string') {
                  try {
                    parsedSocial = JSON.parse(socialLinks);
                  } catch (e) {
                    parsedSocial = [];
                  }
                }

                return parsedSocial.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {parsedSocial.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full transition-all duration-200 text-sm ${getSocialColor(link)}`}
                      >
                        <span className="flex items-center">{getSocialIcon(link)}</span>
                        <span className="text-white">{getSocialName(link)}</span>
                      </a>
                    ))}
                  </div>
                );
              })()}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                {albums && albums.length > 0 && (
                  <>
                    <span>
                      {albums.length} album{albums.length > 1 ? "s" : ""}
                    </span>
                    <span>•</span>
                  </>
                )}
                {tracks && tracks.length > 0 && (
                  <>
                    <span>{tracks.length} songs</span>
                    {artistFollowStatus.totalFollowers !== undefined && (
                      <>
                        <span>•</span>
                        <span>{artistFollowStatus.totalFollowers} followers</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={handlePlayAllTracks}
                  disabled={!tracks || tracks.length === 0}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Play All
                </Button>
                <Button
                  size="lg"
                  className={`backdrop-blur-sm text-white transition-all duration-200 border-0 ${
                    artistFollowStatus.isFollowing 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={() => toggleArtistFollow(artist.id)}
                  disabled={artistFollowStatus.isLoading}
                >
                  {artistFollowStatus.isFollowing ? (
                    <Check className="mr-2 h-5 w-5" />
                  ) : (
                    <Heart className="mr-2 h-5 w-5" />
                  )}
                  {artistFollowStatus.isLoading ? "Loading..." : (artistFollowStatus.isFollowing ? "Followed" : "Follow")}
                </Button>
                <Button
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border-0"
                  onClick={() => {
                    const currentUrl = window.location.href;
                    navigator.clipboard.writeText(currentUrl);
                    showSuccess({ title: "Copied!", message: "Link copied to clipboard!" });
                  }}
                >
                  <Share className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        {/* Albums Section */}
        {albums && albums.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Album className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Albums
                </span>
              </h2>
            </div>
            <AlbumGrid albums={albums} />
          </section>
        )}

        {/* All Tracks in Small Grid Format */}
        {tracks && tracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Music className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  All Songs
                </span>
              </h2>
            </div>
            <TrackGridSm 
              tracks={tracks}
            />
          </section>
        )}

        {/* Recommended Artists Section */}
        {recommendedArtists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Similar Artists
                </span>
              </h2>
            </div>
            <ArtistGrid artists={recommendedArtists} />
          </section>
        )}
      </div>

      {/* Music Player */}
      <div className="pb-32">
        <MusicPlayer />
      </div>
    </div>
  );
}