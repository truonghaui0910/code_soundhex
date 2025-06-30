
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Clock, Users, Album, Heart, Share, Download, Plus } from "lucide-react";

export default function ArtistDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Artist Profile Image Skeleton */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl animate-pulse">
              <Users className="h-20 w-20 text-white/40" />
            </div>
            
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              {/* Badge Skeleton */}
              <div className="w-16 h-6 bg-white/20 rounded-full mx-auto md:mx-0 animate-pulse"></div>
              
              {/* Artist Name Skeleton */}
              <div className="space-y-2">
                <div className="h-12 md:h-16 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
              
              {/* Bio Skeleton */}
              <div className="space-y-2 max-w-2xl">
                <div className="h-5 bg-white/20 rounded animate-pulse"></div>
                <div className="h-5 bg-white/20 rounded w-3/4 mx-auto md:mx-0 animate-pulse"></div>
              </div>
              
              {/* Info Skeleton */}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
                <span>•</span>
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
              </div>
              
              {/* Buttons Skeleton */}
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="h-12 w-28 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Albums Section Skeleton */}
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Album className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold">Albums</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Card key={idx} className="group overflow-hidden border-0 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-square w-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Tracks Section Skeleton */}
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
                Popular Tracks
              </h2>
            </div>

            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border-b border-gray-100/50 dark:border-gray-700/30 last:border-b-0"
                >
                  {/* Track Number */}
                  <div className="w-8 text-center">
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
                  </div>

                  {/* Play Button Skeleton */}
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>

                  {/* Track Cover */}
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

      {/* Music Player Space */}
      <div className="pb-32"></div>
    </div>
  );
}
