// app/(route)/album/[id]/album-loading.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Clock, Heart, Share, Download, Plus } from "lucide-react";

export default function AlbumLoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Album Cover Skeleton */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <div className="flex items-center space-x-1">
                <Music className="h-20 w-20 text-white/40" />
                {/* Loading dots animation */}
                <div className="flex space-x-1 ml-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              {/* Badge Skeleton */}
              <div className="w-fit mx-auto md:mx-0">
                <div className="h-6 w-16 bg-white/20 rounded-full animate-pulse"></div>
              </div>

              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="h-12 md:h-16 bg-white/20 rounded-lg animate-pulse w-full max-w-md mx-auto md:mx-0"></div>
              </div>

              {/* Info Skeleton */}
              <div className="flex items-center gap-3 text-lg text-purple-100 justify-center md:justify-start">
                <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
                <span className="text-white/40">•</span>
                <div className="h-6 w-12 bg-white/20 rounded animate-pulse"></div>
                <span className="text-white/40">•</span>
                <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex gap-4 justify-center md:justify-start mt-4">
                <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-12 w-20 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-12 w-20 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section Skeleton - Updated to match TrackGridSm layout */}
      <div className="container mx-auto px-6 py-12">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center animate-pulse">
            <Music className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* TrackGridSm Layout Skeleton - Copy from actual TrackGridSm component */}
        <div className="space-y-2">
          {Array.from({ length: Math.ceil(10 / 3) }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, colIndex) => (
                <div key={colIndex} className="group flex items-center gap-4 p-6 rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                  {/* Album Cover */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                      <Music className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0 px-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Music Player Space */}
      <div className="pb-32"></div>

      <style jsx>{`
        @keyframes blink-dots {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        .animate-blink-1 {
          animation: blink-dots 1.4s infinite;
          animation-delay: 0s;
        }

        .animate-blink-2 {
          animation: blink-dots 1.4s infinite;
          animation-delay: 0.2s;
        }

        .animate-blink-3 {
          animation: blink-dots 1.4s infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}