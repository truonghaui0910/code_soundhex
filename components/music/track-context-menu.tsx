"use client";

import React, { useRef, useEffect, useState } from "react";
import {
    Play,
    Pause,
    Plus,
    Download,
    Heart,
    Share,
    MoreHorizontal,
    Link as LinkIcon,
    Headphones,
    Clock,
    ChevronRight,
    List as ListIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/definitions/Track";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useCurrentUser } from "@/hooks/use-current-user";
import { showWarning } from "@/lib/services/notification-service";
import { toast } from "sonner";
import { CreatePlaylistModal } from "@/components/playlist/create-playlist-modal";

export interface TrackContextMenuAction {
    play?: boolean;
    addToPlaylist?: boolean;
    download?: boolean;
    like?: boolean;
    share?: boolean;
}

interface TrackContextMenuProps {
    track: Track;
    isOpen: boolean;
    onClose: () => void;
    actions?: TrackContextMenuAction;
    position?: "top" | "bottom";
    className?: string;
    // Callbacks for actions
    onPlayToggle?: (track: Track) => void;
    onDownload?: (track: Track) => void;
    onLikeToggle?: (trackId: number) => void;
    onShare?: (track: Track) => void;
    // State getters
    isPlaying?: boolean;
    isCurrentTrack?: boolean;
    likeStatus?: {
        isLiked: boolean;
        isLoading: boolean;
        totalLikes?: number;
    };
    // Style variants
    variant?: "default" | "light" | "purple";
}

// Helper function to format view count
const formatViewCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
};

export function TrackContextMenu({
    track,
    isOpen,
    onClose,
    actions = {
        play: true,
        addToPlaylist: true,
        download: true,
        like: true,
        share: true,
    },
    position = "bottom",
    className = "",
    onPlayToggle,
    onDownload,
    onLikeToggle,
    onShare,
    isPlaying = false,
    isCurrentTrack = false,
    likeStatus = { isLiked: false, isLoading: false },
    variant = "default",
}: TrackContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = useCurrentUser();
    const { playlists, refetchPlaylists } = usePlaylist();
    const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState<number | null>(
        null,
    );
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
    const [submenuPosition, setSubmenuPosition] = useState<"right" | "left">(
        "right",
    );
    const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Don't close context menu if modal is open
            if (createPlaylistOpen) {
                console.log(
                    "📍 Context Menu - Modal is open, ignoring outside click",
                );
                return;
            }

            if (
                isOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                console.log("📍 Context Menu - Closing due to outside click");
                onClose();
                setShowPlaylistSubmenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, createPlaylistOpen]);

    // Reset submenu state when main menu closes
    useEffect(() => {
        console.log("📍 Context Menu - State changed:", { isOpen });
        if (!isOpen) {
            console.log(
                "📍 Context Menu - Closing submenu and resetting search",
            );
            setShowPlaylistSubmenu(false);
            setPlaylistSearchQuery(""); // Reset search query
        }
    }, [isOpen]);

    // Reset search query when modal opens, but keep submenu open
    useEffect(() => {
        console.log("📍 Create Playlist Modal - State changed:", {
            createPlaylistOpen,
        });
        if (createPlaylistOpen) {
            console.log(
                "📍 Create Playlist Modal - Modal opened, keeping submenu open",
            );

            setPlaylistSearchQuery(""); // Reset search query but keep submenu open
        }
    }, [createPlaylistOpen]);

    // Allow submenu to open and stay open even when modal is open
    const handleMouseEnterPlaylist = () => {
        console.log("📍 Submenu - Mouse enter playlist item:", {
            createPlaylistOpen,
        });
        console.log("📍 Submenu - Opening playlist submenu");
        setShowPlaylistSubmenu(true);
    };

    const handleMouseLeavePlaylist = () => {
        console.log("📍 Submenu - Mouse leave playlist item:", {
            createPlaylistOpen,
        });
        // Only close submenu if modal is not open
        if (!createPlaylistOpen) {
            console.log("📍 Submenu - Closing playlist submenu");
            setShowPlaylistSubmenu(false);
        } else {
            console.log("📍 Submenu - Modal is open, keeping submenu open");
        }
    };

    const handlePlayToggle = () => {
        onPlayToggle?.(track);
        onClose();
    };

    const handleDownload = () => {
        onDownload?.(track);
        onClose();
    };

    const handleLikeToggle = () => {
        onLikeToggle?.(track.id);
        onClose();
    };

    const handleShare = () => {
        if (onShare) {
            onShare(track);
        } else {
            // Default share behavior - prioritize custom_url
            const trackPath = track.custom_url || track.id;
            const url = `${window.location.origin}/track/${trackPath}`;
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
        onClose();
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        if (!user) {
            showWarning({
                title: "Login Required",
                message: "You need to login to add tracks to playlists",
            });
            return;
        }

        setIsAddingToPlaylist(playlistId);

        try {
            const response = await fetch(
                `/api/playlists/${playlistId}/tracks`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ track_id: track.id }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || "Failed to add track to playlist",
                );
            }

            const playlist = playlists.find((p) => p.id === playlistId);
            toast.success(`Added "${track.title}" to "${playlist?.name}"`);

            // Reload playlists after successful addition
            await refetchPlaylists();

            onClose();
            setShowPlaylistSubmenu(false);
        } catch (error: any) {
            console.error("Error adding track to playlist:", error);

            if (error.message === "Track already exists in playlist") {
                toast.error("This track is already in the playlist");
            } else {
                toast.error(error.message || "Failed to add track to playlist");
            }
        } finally {
            setIsAddingToPlaylist(null);
        }
    };

    const handleCreateNewPlaylist = () => {
        console.log("📍 Create Playlist Flow - Starting create new playlist");
        // Immediately hide submenu and close context menu
        console.log(
            "📍 Create Playlist Flow - Hiding submenu and closing context menu",
        );
        // setShowPlaylistSubmenu(false);
        // setPlaylistSearchQuery(""); // Reset search query
        // onClose();
        // Open modal after a short delay
        console.log("📍 Create Playlist Flow - Opening modal after delay");
        setTimeout(() => {
            console.log("📍 Create Playlist Flow - Modal opened");
            setCreatePlaylistOpen(true);
        }, 50);
    };

    const handlePlaylistCreated = async (newPlaylist?: any) => {
        console.log("📍 Playlist Created - Callback triggered:", {
            newPlaylist: newPlaylist?.name,
        });
        console.log("📍 Playlist Created - Closing modal");
        setCreatePlaylistOpen(false);
        setShowPlaylistSubmenu(false);
        setPlaylistSearchQuery(""); // Reset search query
        onClose();
        // If we have the new playlist, automatically add the track to it
        if (newPlaylist) {
            console.log("📍 Playlist Created - Adding track to new playlist:", {
                playlistId: newPlaylist.id,
                playlistName: newPlaylist.name,
                trackId: track.id,
                trackTitle: track.title,
            });
            try {
                const response = await fetch(
                    `/api/playlists/${newPlaylist.id}/tracks`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ track_id: track.id }),
                    },
                );

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(
                        error.error || "Failed to add track to playlist",
                    );
                }

                console.log(
                    "📍 Playlist Created - Track successfully added to playlist",
                );
                toast.success(
                    `Created "${newPlaylist.name}" and added "${track.title}"`,
                );
            } catch (error: any) {
                console.error(
                    "📍 Playlist Created - Error adding track to new playlist:",
                    error,
                );
                toast.error(
                    error.message || "Failed to add track to new playlist",
                );
            }
        }

        // Reload playlists after creating new playlist
        console.log("📍 Playlist Created - Refetching playlists");
        await refetchPlaylists();
    };

    // Filter playlists based on search query
    const filteredPlaylists = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(playlistSearchQuery.toLowerCase()),
    );

    const positionClasses =
        position === "top" ? "bottom-full mb-2" : "top-full mt-2";

    // Style variants
    const isLightVariant = variant === "light";
    const isPurpleVariant = variant === "purple";

    let containerClass, buttonClass;

    if (isLightVariant) {
        containerClass = `absolute right-0 ${positionClasses} w-80 z-[99999] bg-purple-900 border border-purple-700 shadow-2xl rounded-xl overflow-visible ${className}`;
        buttonClass =
            "flex items-center w-full px-4 py-3 text-white hover:bg-purple-700/50 transition-colors cursor-pointer relative";
    } else if (isPurpleVariant) {
        containerClass = `absolute right-0 ${positionClasses} w-48 z-[99999] bg-purple-900 border border-purple-700 shadow-2xl rounded-md overflow-visible ${className}`;
        buttonClass =
            "block w-full text-left px-4 py-2 text-sm text-white hover:bg-purple-700/50 transition-colors cursor-pointer relative";
    } else {
        containerClass = `absolute right-0 ${positionClasses} w-48 z-[99999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md overflow-visible ${className}`;
        buttonClass =
            "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer relative";
    }

    if (!isOpen) return null;

    return (
        <>
            <div ref={menuRef} className={containerClass}>
                {/* Header Section - Only for light variant */}
                {isLightVariant && (
                    <div className="p-4 border-b border-purple-700">
                        <div className="flex items-start gap-3">
                            {/* Artist Profile Picture */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                                {track.artist?.profile_image_url ? (
                                    <img
                                        src={track.artist.profile_image_url}
                                        alt={track.artist?.name || "Artist"}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-lg">
                                        {(track.artist?.name || track.title)
                                            .charAt(0)
                                            .toUpperCase()}
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
                                        <span>
                                            {formatViewCount(
                                                likeStatus.totalLikes || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Headphones className="h-3 w-3" />
                                        <span>
                                            {formatViewCount(
                                                track.view_count || 0,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action List */}
                <div className={isLightVariant ? "" : ""}>
                    {/* Play/Pause Action */}
                    {actions.play && onPlayToggle && (
                        <button
                            onClick={handlePlayToggle}
                            className={buttonClass}
                        >
                            {isCurrentTrack && isPlaying ? (
                                <>
                                    <Pause
                                        className={`${isLightVariant || isPurpleVariant ? "h-4 w-4 mr-3" : "h-4 w-4 mr-2 inline-block"}`}
                                    />
                                    <span
                                        className={
                                            isLightVariant || isPurpleVariant
                                                ? "text-sm"
                                                : ""
                                        }
                                    >
                                        Pause
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Play
                                        className={`${isLightVariant || isPurpleVariant ? "h-4 w-4 mr-3" : "h-4 w-4 mr-2 inline-block"}`}
                                    />
                                    <span
                                        className={
                                            isLightVariant || isPurpleVariant
                                                ? "text-sm"
                                                : ""
                                        }
                                    >
                                        Play
                                    </span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Add to Playlist Action with Hover Submenu */}
                    {actions.addToPlaylist && (
                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnterPlaylist}
                            onMouseLeave={handleMouseLeavePlaylist}
                        >
                            <button className={buttonClass}>
                                <Plus
                                    className={`${isLightVariant || isPurpleVariant ? "h-4 w-4 mr-3" : "h-4 w-4 mr-2 inline-block"}`}
                                />
                                <span
                                    className={
                                        isLightVariant || isPurpleVariant
                                            ? "text-sm text-left"
                                            : "text-left"
                                    }
                                >
                                    Add to Playlist
                                </span>
                                <ChevronRight
                                    className={`${isLightVariant || isPurpleVariant ? "h-4 w-4 ml-auto" : "h-4 w-4 ml-auto inline-block"}`}
                                />
                            </button>

                            {/* Playlist Submenu - Show even when modal is open */}
                            {(() => {
                                console.log("📍 Submenu Render - States:", {
                                    showPlaylistSubmenu,
                                    createPlaylistOpen,
                                    willRender: showPlaylistSubmenu,
                                });
                                return null;
                            })()}
                            {showPlaylistSubmenu && (
                                <div
                                    className={`absolute right-full top-0 -left-64 w-64 bg-purple-900 border border-purple-700 shadow-2xl rounded-lg z-[999999] max-h-80 overflow-hidden flex flex-col`}
                                    onMouseEnter={() =>
                                        setShowPlaylistSubmenu(true)
                                    }
                                    onMouseLeave={() =>
                                        setShowPlaylistSubmenu(false)
                                    }
                                >
                                    {/* Search Header */}
                                    <div className="px-3 py-2 border-b border-purple-700 flex-shrink-0">
                                        <div className="text-xs text-purple-300 font-medium mb-2">
                                            Select Playlist
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search playlists..."
                                                value={playlistSearchQuery}
                                                onChange={(e) =>
                                                    setPlaylistSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-2 py-1 text-xs bg-purple-800 border border-purple-600 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto">
                                        {/* Create New Playlist Option */}
                                        <button
                                            onClick={handleCreateNewPlaylist}
                                            className="flex items-center w-full px-3 py-2 text-white hover:bg-purple-700/50 transition-colors text-sm border-b border-purple-700/50"
                                        >
                                            <Plus className="h-4 w-4 mr-3 text-green-400" />
                                            <span>Create new playlist</span>
                                        </button>

                                        {/* Playlists List */}
                                        {filteredPlaylists.length === 0 ? (
                                            <div className="px-3 py-4 text-center text-purple-300 text-sm">
                                                {playlistSearchQuery
                                                    ? "No playlists match your search"
                                                    : "No playlists found"}
                                            </div>
                                        ) : (
                                            filteredPlaylists.map(
                                                (playlist) => (
                                                    <button
                                                        key={playlist.id}
                                                        onClick={() =>
                                                            handleAddToPlaylist(
                                                                playlist.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isAddingToPlaylist ===
                                                            playlist.id
                                                        }
                                                        className="flex items-center w-full px-3 py-2 text-white hover:bg-purple-700/50 transition-colors text-sm disabled:opacity-50"
                                                    >
                                                        <ListIcon className="h-4 w-4 mr-3 text-purple-300" />
                                                        <div className="flex-1 text-left">
                                                            <div className="font-medium truncate">
                                                                {playlist.name}
                                                            </div>
                                                            <div className="text-xs text-purple-400">
                                                                {
                                                                    playlist.track_count
                                                                }{" "}
                                                                tracks
                                                            </div>
                                                        </div>
                                                        {isAddingToPlaylist ===
                                                            playlist.id && (
                                                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                    </button>
                                                ),
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Download Action */}
                    {actions.download && onDownload && (
                        <button
                            onClick={handleDownload}
                            className={buttonClass}
                        >
                            <Download
                                className={`${isLightVariant || isPurpleVariant ? "h-4 w-4 mr-3" : "h-4 w-4 mr-2 inline-block"}`}
                            />
                            <span
                                className={
                                    isLightVariant || isPurpleVariant
                                        ? "text-sm"
                                        : ""
                                }
                            >
                                Download
                            </span>
                        </button>
                    )}

                    {/* Like/Unlike Action */}
                    {actions.like && onLikeToggle && (
                        <button
                            onClick={handleLikeToggle}
                            className={buttonClass}
                            disabled={likeStatus.isLoading}
                        >
                            <Heart
                                className={`${isLightVariant || isPurpleVariant ? "h-4 w-4 mr-3" : "h-4 w-4 mr-2 inline-block"} ${likeStatus.isLiked ? "fill-current text-red-500" : ""}`}
                            />
                            <span
                                className={
                                    isLightVariant || isPurpleVariant
                                        ? "text-sm"
                                        : ""
                                }
                            >
                                {likeStatus.isLiked ? "Unlike" : "Like"}
                                {!isLightVariant &&
                                    !isPurpleVariant &&
                                    likeStatus.totalLikes !== undefined &&
                                    likeStatus.totalLikes > 0 && (
                                        <span className="ml-1">
                                            ({likeStatus.totalLikes})
                                        </span>
                                    )}
                            </span>
                        </button>
                    )}

                    {/* Share Action */}
                    {actions.share && (
                        <button onClick={handleShare} className={buttonClass}>
                            {isLightVariant || isPurpleVariant ? (
                                <>
                                    <LinkIcon className="h-4 w-4 mr-3" />
                                    <span className="text-sm">Copy Link</span>
                                </>
                            ) : (
                                <>
                                    <Share className="h-4 w-4 mr-2 inline-block" />
                                    Share
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                open={createPlaylistOpen}
                onOpenChange={(open) => {
                    setCreatePlaylistOpen(open);
                    if (!open) {
                        // Modal closed, reset submenu state
                        setShowPlaylistSubmenu(false);
                    }
                }}
                onPlaylistCreated={handlePlaylistCreated}
            />
        </>
    );
}

// Trigger button component để kết hợp với menu
interface TrackContextMenuTriggerProps {
    isOpen: boolean;
    onToggle: () => void;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function TrackContextMenuTrigger({
    isOpen,
    onToggle,
    className = "",
    size = "sm",
}: TrackContextMenuTriggerProps) {
    const sizeClasses = {
        sm: "w-8 h-8 p-0",
        md: "w-10 h-10 p-2",
        lg: "w-12 h-12 p-3",
    };

    return (
        <Button
            size="icon"
            variant="ghost"
            className={`${sizeClasses[size]} text-gray-400 dark:hover:bg-white/10 hover:bg-white/10 transition-colors ${className}`}
            onClick={onToggle}
        >
            <MoreHorizontal className="h-4 w-4" />
        </Button>
    );
}
