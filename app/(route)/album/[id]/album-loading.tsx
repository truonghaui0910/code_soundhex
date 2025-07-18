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
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Track List</h2>
          {/* Loading dots for title */}
          <div className="flex space-x-1 ml-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '600ms'}}></div>
          </div>
        </div>

        {/* TrackGridSm Layout Skeleton - 3 rows of cards */}
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`row1-${index}`} className="group relative">
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/30">
                  {/* Track Cover */}
                  <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Music className="h-12 w-12 text-white/60" />
                  </div>

                  {/* Track Info */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      {/* Track Title */}
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      {/* Artist Name */}
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                    </div>

                    {/* Bottom Row - Duration and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`row2-${index}`} className="group relative">
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/30">
                  {/* Track Cover */}
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    <Music className="h-12 w-12 text-white/60" />
                  </div>

                  {/* Track Info */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      {/* Track Title */}
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      {/* Artist Name */}
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                    </div>

                    {/* Bottom Row - Duration and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`row3-${index}`} className="group relative">
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/30">
                  {/* Track Cover */}
                  <div className="aspect-square bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                    <Music className="h-12 w-12 text-white/60" />
                  </div>

                  {/* Track Info */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      {/* Track Title */}
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      {/* Artist Name */}
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5"></div>
                    </div>

                    {/* Bottom Row - Duration and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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