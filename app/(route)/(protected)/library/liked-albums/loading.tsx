import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Album as AlbumIcon } from "lucide-react";

export default function LikedAlbumsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
            <Skeleton className="h-6 w-32 bg-white/20" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex items-center">
              <Search className="h-4 w-4 absolute left-3 text-purple-300" />
              <Skeleton className="w-64 h-8 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* Albums Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="text-center animate-pulse">
              <Skeleton className="aspect-square mb-3 rounded-lg bg-white/20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 mx-auto bg-white/20" />
                <Skeleton className="h-3 w-1/2 mx-auto bg-white/20" />
                <Skeleton className="h-3 w-1/3 mx-auto bg-white/20" />
                <Skeleton className="h-3 w-2/3 mx-auto bg-white/20" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12 flex justify-center items-center gap-2">
          <Skeleton className="h-8 w-20 bg-white/20" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-10 bg-white/20" />
            ))}
          </div>
          <Skeleton className="h-8 w-16 bg-white/20" />
        </div>

        {/* Stats Box Skeleton */}
        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-48 rounded-lg bg-white/20" />
        </div>
      </div>
    </div>
  );
} 