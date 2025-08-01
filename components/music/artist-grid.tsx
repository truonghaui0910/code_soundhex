"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";

interface Artist {
    id: number;
    name: string;
    profile_image_url: string | null;
    custom_url: string | null;
    tracksCount: number;
}

interface ArtistGridProps {
    artists: Artist[];
    isLoading?: boolean;
    loadingCount?: number;
    className?: string;
}

const ArtistGrid = memo(function ArtistGrid({
    artists,
    isLoading = false,
    loadingCount = 12,
    className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6",
}: ArtistGridProps) {
    

    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: loadingCount }).map((_, index) => (
                    <div
                        key={index}
                        className="group cursor-pointer text-center animate-pulse"
                    >
                        <div className="aspect-square mx-auto mb-3 rounded-full bg-white/20 dark:bg-white/20"></div>
                        <div className="space-y-1">
                            <div className="h-4 bg-white/20 dark:bg-white/20 rounded mx-auto"></div>
                            <div className="h-3 bg-white/20 dark:bg-white/20 rounded w-2/3 mx-auto"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    

    return (
        <div className={className}>
            {artists.map((artist) => (
                <Link
                    key={artist.id}
                    href={`/artist/${artist.custom_url || artist.id}`}
                    prefetch={false}
                    className="group cursor-pointer text-center block"
                >
                    <div className="aspect-square mx-auto mb-3 rounded-full overflow-hidden bg-white/20 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                        {artist.profile_image_url ? (
                            <Image
                                src={artist.profile_image_url}
                                alt={artist.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <Users className="w-12 h-12 text-white" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                            {artist.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                            {artist.tracksCount} tracks
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
});

ArtistGrid.displayName = "ArtistGrid";

export { ArtistGrid };