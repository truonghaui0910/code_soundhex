
"use client";

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

export function ArtistGrid({ 
    artists, 
    isLoading = false, 
    loadingCount = 5, 
    className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
}: ArtistGridProps) {
    if (isLoading) {
        return (
            <div className={className}>
                {Array.from({ length: loadingCount }).map((_, index) => (
                    <div key={index} className="group cursor-pointer text-center animate-pulse">
                        <div className="aspect-square mx-auto mb-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={className}>
            {artists.map((artist) => (
                <div
                    key={artist.id}
                    className="group cursor-pointer text-center"
                >
                    <div className="aspect-square mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                        {artist.profile_image_url ? (
                            <Image
                                src={artist.profile_image_url}
                                alt={artist.name}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                className="object-cover"
                            />
                        ) : (
                            <Users className="h-12 w-12 text-white" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <Link
                            href={`/artist/${artist.custom_url || artist.id}`}
                            className="block"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                {artist.name}
                            </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {artist.tracksCount} songs
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
