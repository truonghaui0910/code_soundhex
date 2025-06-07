
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Clock, Users, Album, TrendingUp, Search, Filter, Upload, Headphones } from "lucide-react";

export default function MusicExplorerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="h-8 bg-white/20 rounded-lg mb-8 animate-pulse"></div>

            {/* Search Bar Skeleton */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg animate-pulse flex items-center px-4">
                <Search className="h-5 w-5 text-white/40 mr-3" />
                <div className="h-5 bg-white/20 rounded flex-1 animate-pulse"></div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="h-12 w-36 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="h-12 w-36 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters:</span>
              </div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-32 space-y-16 pt-12">
        {/* Albums Section Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              Albums
            </h2>
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Card key={idx} className="group overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm animate-pulse">
                <div className="aspect-square w-full bg-gray-300 dark:bg-gray-600"></div>
                <CardContent className="p-3 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Artists Section Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              Artists
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="group cursor-pointer text-center">
                <div className="aspect-square mx-auto mb-3 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mx-auto w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mx-auto w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Tracks Section Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Featured Tracks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Card key={idx} className="group overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm animate-pulse">
                <div className="aspect-square w-full bg-gray-300 dark:bg-gray-600"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Music Library View Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Headphones className="h-5 w-5 text-white" />
              </div>
              Music Library
            </h2>
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, idx) => (
              <Card key={idx} className="group overflow-hidden border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm animate-pulse">
                <div className="aspect-square w-full bg-gray-300 dark:bg-gray-600"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upload Section Skeleton */}
        <section>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                Upload Your Music
              </h2>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-2/3 animate-pulse"></div>
            </div>

            <Card className="p-8 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-12 bg-purple-50/50 dark:bg-purple-900/20">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/2 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/3 animate-pulse"></div>
                    <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="text-center p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-2/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Loading Message */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading music platform...
            </span>
          </div>
        </div>
      </div>

      {/* Music Player Space */}
      <div className="pb-32"></div>
    </div>
  );
}
