"use client";

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
    Search,
    ArrowLeft,
} from "lucide-react";

export default function ArtistDetailLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Hero Section Skeleton */}
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
                                <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse flex items-center justify-center">
                                    <ArrowLeft className="mr-2 h-5 w-5 text-white/40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
                {/* Albums Section Skeleton */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Album className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Albums
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="group cursor-pointer text-center">
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-white/20 dark:border-gray-700/30">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                                        <Music className="h-12 w-12 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mx-auto"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* All Songs Section Skeleton (TrackGridSm style) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <Music className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                All Songs
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {Array.from({ length: Math.ceil(15 / 3) }).map((_, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, colIndex) => (
                                    <div key={colIndex} className="flex items-center gap-4 p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse">
                                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                                            <Music className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0 px-2 space-y-3">
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Music Player Space */}
            <div className="pb-32"></div>
        </div>
    );
}