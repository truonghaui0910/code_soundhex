import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Followed Artists Section Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32 bg-white/20" />
              <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="aspect-square mx-auto mb-3 rounded-full bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
                  <Skeleton className="h-3 w-16 mx-auto bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Playlists Section Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 bg-white/20" />
              <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="aspect-square mx-auto mb-3 rounded-lg bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
                  <Skeleton className="h-3 w-16 mx-auto bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Liked Songs Section Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-28 bg-white/20" />
              <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
            </div>
            <Skeleton className="h-8 w-20 bg-white/20" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <Skeleton className="h-12 w-12 rounded bg-white/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-3 w-24 bg-white/20" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
              </div>
            ))}
          </div>
        </section>

        {/* Liked Albums Section Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-28 bg-white/20" />
              <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
            </div>
            <Skeleton className="h-8 w-20 bg-white/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="aspect-square mx-auto mb-3 rounded-lg bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 mx-auto bg-white/20" />
                  <Skeleton className="h-3 w-20 mx-auto bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pb-32"></div>
    </div>
  );
} 