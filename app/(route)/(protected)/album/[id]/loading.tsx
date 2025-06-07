
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Clock, Heart, Share, Download, Plus } from "lucide-react";

export default function AlbumDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Album Cover Skeleton */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl animate-pulse">
              <Music className="h-20 w-20 text-white/40" />
            </div>
            
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              {/* Badge Skeleton */}
              <div className="w-20 h-6 bg-white/20 rounded-full mx-auto md:mx-0 animate-pulse"></div>
              
              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="h-12 md:h-16 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-8 bg-white/20 rounded-lg w-3/4 mx-auto md:mx-0 animate-pulse"></div>
              </div>
              
              {/* Info Skeleton */}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
                <span>•</span>
                <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
                <span>•</span>
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
              </div>
              
              {/* Buttons Skeleton */}
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section Skeleton */}
      <div className="container mx-auto px-6 py-12">
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold">Track List</h2>
              </div>
            </div>

            {/* Track List Skeleton */}
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border-b border-gray-100/50 dark:border-gray-700/30 last:border-b-0"
                >
                  {/* Track Number */}
                  <div className="w-8 text-center">
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
                  </div>

                  {/* Album Cover */}
                  <div className="w-12 h-12 rounded-lg bg-gray-300 dark:bg-gray-600 animate-pulse flex-shrink-0"></div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                  </div>

                  {/* Genre Badge Skeleton */}
                  <div className="hidden md:block">
                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  </div>

                  {/* Duration Skeleton */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Message */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading album details...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
