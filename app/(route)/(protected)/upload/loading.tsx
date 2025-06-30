
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Music, Search, Download, Globe, HardDrive, Loader2 } from "lucide-react";

export default function UploadLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <div className="h-12 md:h-16 bg-white/20 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-6 md:h-8 bg-white/20 rounded-lg mb-8 w-3/4 mx-auto animate-pulse"></div>

            {/* Tab Buttons */}
            <div className="flex gap-4 justify-center">
              <div className="h-12 px-6 bg-white/90 text-purple-600 rounded-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Spotify Import
              </div>
              <div className="h-12 px-6 bg-white/20 text-white rounded-lg flex items-center gap-2 opacity-50">
                <HardDrive className="h-5 w-5" />
                File Upload
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Spotify URL Input Card */}
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spotify Results Loading Card */}
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Download className="h-4 w-4 text-white" />
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              </CardTitle>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loading State */}
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
            </div>

            {/* Track Results Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ownership Confirmation Skeleton */}
            <div className="border-t pt-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-purple-700">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0 mt-1"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="flex justify-end pt-4">
              <div className="h-12 w-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg animate-pulse flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin mr-2" />
                <span className="text-white text-sm">Loading...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      

      {/* Music Player Space */}
      <div className="pb-32"></div>
    </div>
  );
}
