// app/(route)/artist/[id]/loading.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  Music,
  Heart,
  Share,
  Users,
  Album,
  Pause,
  Download,
  Plus,
} from "lucide-react";

export default function ArtistDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Artist Profile Image Skeleton */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <div className="flex items-center space-x-2">
                <Users className="h-20 w-20 text-white/40 animate-pulse" />
                {/* Loading dots animation */}
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              {/* Badge Skeleton */}
              <div className="w-fit mx-auto md:mx-0">
                <div className="h-6 w-16 bg-white/20 rounded-full animate-pulse"></div>
              </div>

              {/* Artist Name Skeleton */}
              <div className="space-y-2">
                <div className="h-12 md:h-16 bg-white/20 rounded-lg animate-pulse w-full max-w-md mx-auto md:mx-0"></div>
              </div>

              {/* Bio Skeleton */}
              <div className="space-y-2 max-w-2xl mx-auto md:mx-0">
                <div className="h-5 bg-white/20 rounded animate-pulse"></div>
                <div className="h-5 bg-white/20 rounded w-3/4 animate-pulse"></div>
              </div>

              {/* Stats Skeleton */}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
                <span className="text-white/40">•</span>
                <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5 text-white/40" />
                </div>
                <div className="h-12 w-20 bg-white/20 rounded-lg animate-pulse flex items-center justify-center">
                  <Heart className="mr-2 h-5 w-5 text-white/40" />
                </div>
                <div className="h-12 w-20 bg-white/20 rounded-lg animate-pulse flex items-center justify-center">
                  <Share className="mr-2 h-5 w-5 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        {/* Albums Section Skeleton */}
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Album className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold">Albums</h2>
              {/* Loading dots for section */}
              <div className="flex space-x-1 ml-2">
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "600ms" }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="group overflow-hidden border-0 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    {/* Album Cover Skeleton */}
                    <div className="aspect-square w-full overflow-hidden">
                      <div className="bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center w-full h-full">
                        <Music className="h-12 w-12 text-white/60 animate-pulse" />
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
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
                {/* Loading dots for section */}
                <div className="flex space-x-1 ml-2">
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "100ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "400ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "700ms" }}
                  ></div>
                </div>
              </h2>
            </div>

            {/* Track List Skeleton */}
            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-4 p-4 border-b border-gray-100/50 dark:border-gray-700/30 last:border-b-0"
                >
                  {/* Track Number Skeleton */}
                  <div className="w-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                  </div>

                  {/* Hidden Play Button Space */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                      <Play className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Track Cover Skeleton */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <Music className="h-5 w-5 text-white/60 animate-pulse" />
                  </div>

                  {/* Track Info Skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>

                  {/* Genre Badge Skeleton */}
                  <div className="hidden md:block">
                    <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>

                  {/* Duration Skeleton */}
                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse font-mono"></div>
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
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
