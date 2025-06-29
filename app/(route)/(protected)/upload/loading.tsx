
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Music, FileText, CheckCircle, Headphones } from "lucide-react";

export default function UploadLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <div className="h-12 md:h-16 bg-white/20 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-6 md:h-8 bg-white/20 rounded-lg mb-8 w-3/4 mx-auto animate-pulse"></div>

            {/* Tab Buttons Skeleton */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-32 pt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Methods Skeleton */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Spotify Import Skeleton */}
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>

                  {/* URL Input Skeleton */}
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
                  </div>

                  {/* Example URLs Skeleton */}
                  <div className="space-y-2 text-left">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Direct Upload Skeleton */}
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>

                  {/* Upload Area Skeleton */}
                  <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 bg-purple-50/50 dark:bg-purple-900/20">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/2 animate-pulse"></div>
                      <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Form Skeleton */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>

                {/* Ownership Confirmation Skeleton */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                </div>

                <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Features Section Skeleton */}
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => {
              const icons = [FileText, CheckCircle, Headphones];
              const Icon = icons[idx];
              
              return (
                <div key={idx} className="text-center p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading upload page...
            </span>
          </div>
        </div>
      </div>

      {/* Music Player Space */}
      <div className="pb-32"></div>
    </div>
  );
}
