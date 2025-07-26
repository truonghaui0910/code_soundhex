import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LibraryPlaylistsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/library" title="Back to library">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <ArrowLeft className="h-4 w-4 text-purple-300 group-hover:text-white transition-colors" />
              </div>
            </Link>
            <div className="h-8 w-40 bg-white/20 rounded animate-pulse"></div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Button Skeleton */}
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>

            {/* Create Button Skeleton */}
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* Playlists Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="relative aspect-square mb-3">
                {/* Playlist Cover Skeleton */}
                <div className="w-full h-full rounded-lg bg-white/20 animate-pulse"></div>

                {/* Play Button Skeleton - Center */}
                <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
                  {/* <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse"></div> */}
                </div>

                {/* Menu Button Skeleton - Top Right */}
                <div className="absolute top-2 right-2">
                  {/* <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div> */}
                </div>
              </div>

              <div className="space-y-2">
                {/* Playlist Name Skeleton */}
                <div className="h-4 w-24 mx-auto bg-white/20 rounded animate-pulse"></div>

                {/* Track Count Skeleton */}
                <div className="h-3 w-16 mx-auto bg-white/20 rounded animate-pulse"></div>

                {/* Description Skeleton */}
                <div className="h-3 w-20 mx-auto bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-20 bg-white/20 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-8 bg-white/20 rounded animate-pulse"></div>
              <div className="w-10 h-8 bg-white/20 rounded animate-pulse"></div>
              <div className="w-10 h-8 bg-white/20 rounded animate-pulse"></div>
              <div className="w-10 h-8 bg-white/20 rounded animate-pulse"></div>
              <div className="w-10 h-8 bg-white/20 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Box Skeleton */}
        <div className="flex justify-center mt-8">
          <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="pb-32"></div>
    </div>
  );
}
