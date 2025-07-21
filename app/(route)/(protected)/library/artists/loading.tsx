import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LibraryArtistsLoading() {
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
            <div className="h-8 w-44 bg-white/20 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Input Skeleton */}
            <div className="relative flex items-center">
              <div className="w-64 h-8 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Artists Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="relative aspect-square mb-3">
                {/* Artist Profile Image Skeleton */}
                <div className="w-full h-full rounded-full bg-white/20 animate-pulse"></div>
                
                {/* Follow Button Skeleton - Overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                  {/* <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div> */}
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Artist Name Skeleton */}
                <div className="h-4 w-28 mx-auto bg-white/20 rounded animate-pulse"></div>
                
                {/* Track Count Skeleton */}
                <div className="h-3 w-20 mx-auto bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12">
          <div className="flex items-center justify-center gap-4">
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
          <div className="h-8 w-52 bg-white/20 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="pb-32"></div>
    </div>
  );
} 