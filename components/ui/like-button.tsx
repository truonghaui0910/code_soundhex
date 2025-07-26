
"use client";

import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikesFollows } from "@/hooks/use-likes-follows";
import { useCurrentUser } from "@/hooks/use-current-user";
import { showWarning } from "@/lib/services/notification-service";

interface LikeButtonProps {
    type: "track" | "album" | "artist";
    id: number;
    className?: string;
    size?: "sm" | "md" | "lg";
    showCount?: boolean;
    variant?: "default" | "white" | "overlay";
}

export function LikeButton({
    type,
    id,
    className = "",
    size = "sm",
    showCount = false,
    variant = "default",
}: LikeButtonProps) {
    const { user } = useCurrentUser();
    const {
        getTrackLikeStatus,
        toggleTrackLike,
        getAlbumLikeStatus,  
        toggleAlbumLike,
        getArtistFollowStatus,
        toggleArtistFollow,
    } = useLikesFollows();

    // Get status based on type
    const getStatus = () => {
        switch (type) {
            case "track":
                return getTrackLikeStatus(id);
            case "album":
                return getAlbumLikeStatus(id);
            case "artist":
                return getArtistFollowStatus(id);
            default:
                return { isLiked: false, isLoading: false, totalLikes: 0 };
        }
    };

    const handleToggle = () => {
        if (!user) {
            showWarning({
                title: "Login Required",
                message: `You need to login to ${type === "artist" ? "follow artists" : "like " + type + "s"}`,
            });
            return;
        }

        switch (type) {
            case "track":
                toggleTrackLike(id);
                break;
            case "album":
                toggleAlbumLike(id);
                break;
            case "artist":
                toggleArtistFollow(id);
                break;
        }
    };

    const status = getStatus();
    const isLiked = status.isLiked === true; // Explicitly check for true
    const isLoading = status.isLoading || false;
    const totalCount = status.totalLikes || 0;

    // Size classes
    const sizeClasses = {
        sm: "w-8 h-8 p-0",
        md: "w-10 h-10 p-2", 
        lg: "w-12 h-12 p-3",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    // Variant classes
    const getVariantClasses = () => {
        switch (variant) {
            case "white":
                return `${sizeClasses[size]} bg-white/90 hover:bg-white text-purple-600 shadow-lg backdrop-blur-sm ${isLiked ? "text-red-500" : ""}`;
            case "overlay":
                return `${sizeClasses[size]} bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm ${isLiked ? "text-red-400" : ""}`;
            default:
                return `${sizeClasses[size]} transition-all duration-200 ${isLiked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-red-400"}`;
        }
    };

    const getTitle = () => {
        if (type === "artist") {
            return isLiked ? "Unfollow artist" : "Follow artist";
        }
        return isLiked ? `Remove from liked ${type}s` : `Add to liked ${type}s`;
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <Button
                size="icon"
                variant={variant === "default" ? "ghost" : "default"}
                onClick={handleToggle}
                disabled={isLoading}
                title={getTitle()}
                className={getVariantClasses()}
            >
                {isLoading ? (
                    <Loader2 className={`${iconSizes[size]} animate-spin`} />
                ) : (
                    <Heart
                        className={`${iconSizes[size]} ${isLiked ? "fill-current" : ""}`}
                    />
                )}
            </Button>
            {showCount && totalCount > 0 && (
                <span className="text-xs text-gray-500 font-mono">
                    {totalCount}
                </span>
            )}
        </div>
    );
}
