
import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "./use-current-user";

interface LikeFollowState {
  isLiked?: boolean;
  isFollowing?: boolean;
  totalLikes?: number;
  totalFollowers?: number;
  isLoading: boolean;
  error?: string;
}

export function useLikesFollows() {
  const { user } = useCurrentUser();

  // Track likes/follows state
  const [trackLikes, setTrackLikes] = useState<Record<number, LikeFollowState>>({});
  const [albumLikes, setAlbumLikes] = useState<Record<number, LikeFollowState>>({});
  const [artistFollows, setArtistFollows] = useState<Record<number, LikeFollowState>>({});

  // Fetch track like status
  const fetchTrackLikeStatus = useCallback(async (trackId: number) => {
    try {
      setTrackLikes(prev => ({
        ...prev,
        [trackId]: { ...prev[trackId], isLoading: true }
      }));

      const response = await fetch(`/api/tracks/${trackId}/like`);
      const data = await response.json();

      if (response.ok) {
        setTrackLikes(prev => ({
          ...prev,
          [trackId]: {
            isLiked: data.isLiked,
            totalLikes: data.totalLikes,
            isLoading: false,
          }
        }));
      } else {
        setTrackLikes(prev => ({
          ...prev,
          [trackId]: { ...prev[trackId], isLoading: false, error: data.error }
        }));
      }
    } catch (error) {
      setTrackLikes(prev => ({
        ...prev,
        [trackId]: { ...prev[trackId], isLoading: false, error: "Failed to fetch like status" }
      }));
    }
  }, []);

  // Fetch album like status
  const fetchAlbumLikeStatus = useCallback(async (albumId: number) => {
    try {
      setAlbumLikes(prev => ({
        ...prev,
        [albumId]: { ...prev[albumId], isLoading: true }
      }));

      const response = await fetch(`/api/albums/${albumId}/like`);
      const data = await response.json();

      if (response.ok) {
        setAlbumLikes(prev => ({
          ...prev,
          [albumId]: {
            isLiked: data.isLiked,
            totalLikes: data.totalLikes,
            isLoading: false,
          }
        }));
      } else {
        setAlbumLikes(prev => ({
          ...prev,
          [albumId]: { ...prev[albumId], isLoading: false, error: data.error }
        }));
      }
    } catch (error) {
      setAlbumLikes(prev => ({
        ...prev,
        [albumId]: { ...prev[albumId], isLoading: false, error: "Failed to fetch like status" }
      }));
    }
  }, []);

  // Fetch artist follow status
  const fetchArtistFollowStatus = useCallback(async (artistId: number) => {
    try {
      setArtistFollows(prev => ({
        ...prev,
        [artistId]: { ...prev[artistId], isLoading: true }
      }));

      const response = await fetch(`/api/artists/${artistId}/follow`);
      const data = await response.json();

      if (response.ok) {
        setArtistFollows(prev => ({
          ...prev,
          [artistId]: {
            isFollowing: data.isFollowing,
            totalFollowers: data.totalFollowers,
            isLoading: false,
          }
        }));
      } else {
        setArtistFollows(prev => ({
          ...prev,
          [artistId]: { ...prev[artistId], isLoading: false, error: data.error }
        }));
      }
    } catch (error) {
      setArtistFollows(prev => ({
        ...prev,
        [artistId]: { ...prev[artistId], isLoading: false, error: "Failed to fetch follow status" }
      }));
    }
  }, []);

  // Toggle track like
  const toggleTrackLike = useCallback(async (trackId: number) => {
    if (!user) {
      alert("Please login to like tracks");
      return;
    }

    try {
      setTrackLikes(prev => ({
        ...prev,
        [trackId]: { ...prev[trackId], isLoading: true }
      }));

      const response = await fetch(`/api/tracks/${trackId}/like`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setTrackLikes(prev => ({
          ...prev,
          [trackId]: {
            ...prev[trackId],
            isLiked: data.liked,
            totalLikes: prev[trackId]?.totalLikes ? 
              (data.liked ? prev[trackId].totalLikes! + 1 : prev[trackId].totalLikes! - 1) : 
              (data.liked ? 1 : 0),
            isLoading: false,
          }
        }));
      } else {
        setTrackLikes(prev => ({
          ...prev,
          [trackId]: { ...prev[trackId], isLoading: false, error: data.error }
        }));
      }
    } catch (error) {
      setTrackLikes(prev => ({
        ...prev,
        [trackId]: { ...prev[trackId], isLoading: false, error: "Failed to toggle like" }
      }));
    }
  }, [user]);

  // Toggle album like
  const toggleAlbumLike = useCallback(async (albumId: number) => {
    if (!user) {
      alert("Please login to like albums");
      return;
    }

    try {
      setAlbumLikes(prev => ({
        ...prev,
        [albumId]: { ...prev[albumId], isLoading: true }
      }));

      const response = await fetch(`/api/albums/${albumId}/like`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setAlbumLikes(prev => ({
          ...prev,
          [albumId]: {
            ...prev[albumId],
            isLiked: data.liked,
            totalLikes: prev[albumId]?.totalLikes ? 
              (data.liked ? prev[albumId].totalLikes! + 1 : prev[albumId].totalLikes! - 1) : 
              (data.liked ? 1 : 0),
            isLoading: false,
          }
        }));
      } else {
        setAlbumLikes(prev => ({
          ...prev,
          [albumId]: { ...prev[albumId], isLoading: false, error: data.error }
        }));
      }
    } catch (error) {
      setAlbumLikes(prev => ({
        ...prev,
        [albumId]: { ...prev[albumId], isLoading: false, error: "Failed to toggle like" }
      }));
    }
  }, [user]);

  // Toggle artist follow
  const toggleArtistFollow = useCallback(async (artistId: number) => {
    if (!user) {
      alert("Please login to follow artists");
      return;
    }

    try {
      setArtistFollows(prev => ({
        ...prev,
        [artistId]: { ...prev[artistId], isLoading: true }
      }));

      const response = await fetch(`/api/artists/${artistId}/follow`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setArtistFollows(prev => ({
          ...prev,
          [artistId]: {
            ...prev[artistId],
            isFollowing: data.following,
            totalFollowers: prev[artistId]?.totalFollowers ? 
              (data.following ? prev[artistId].totalFollowers! + 1 : prev[artistId].totalFollowers! - 1) : 
              (data.following ? 1 : 0),
            isLoading: false,
          }
        }));
      } else {
        setArtistFollows(prev => ({
          ...prev,
          [artistId]: { ...prev[artistId], isLoading: false, error: data.error }
        }));
      }
    } catch (error) {
      setArtistFollows(prev => ({
        ...prev,
        [artistId]: { ...prev[artistId], isLoading: false, error: "Failed to toggle follow" }
      }));
    }
  }, [user]);

  return {
    // State getters
    getTrackLikeStatus: (trackId: number) => trackLikes[trackId] || { isLoading: false },
    getAlbumLikeStatus: (albumId: number) => albumLikes[albumId] || { isLoading: false },
    getArtistFollowStatus: (artistId: number) => artistFollows[artistId] || { isLoading: false },

    // Fetch functions
    fetchTrackLikeStatus,
    fetchAlbumLikeStatus,
    fetchArtistFollowStatus,

    // Toggle functions
    toggleTrackLike,
    toggleAlbumLike,
    toggleArtistFollow,
  };
}
