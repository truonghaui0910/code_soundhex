import {
    Users,
    Music,
    Clock,
    Heart,
    Share,
    Download,
    Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ArtistDetailLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative container mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                        {/* Artist Profile Image Skeleton */}
                        {/* <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                            <div className="flex items-center space-x-2">
       
                                <div className="flex space-x-1">
                                    <div
                                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                                        style={{ animationDelay: "200ms" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                                        style={{ animationDelay: "400ms" }}
                                    ></div>
                                </div>
                            </div>
                        </div> */}

                        {/* Artist Info Skeleton */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            {/* Artist Type Badge Skeleton */}
                            <div className="w-20 h-6 bg-white/20 rounded-full animate-pulse"></div>

                            {/* Artist Name Skeleton */}
                            <div className="w-64 h-12 bg-white/20 rounded animate-pulse"></div>

                            {/* Stats Skeleton */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/80">
                                <div className="flex items-center gap-2">
                                    {/* <Music className="h-5 w-5 animate-pulse" /> */}
                                    <div className="w-16 h-5 bg-white/20 rounded animate-pulse"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* <Users className="h-5 w-5 animate-pulse" /> */}
                                    <div className="w-20 h-5 bg-white/20 rounded animate-pulse"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* <Clock className="h-5 w-5 animate-pulse" /> */}
                                    <div className="w-16 h-5 bg-white/20 rounded animate-pulse"></div>
                                </div>
                            </div>

                            {/* Action Buttons Skeleton */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-6">
                                <div className="w-24 h-10 bg-white/20 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
                                <div className="w-10 h-10 bg-white/20 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section Skeleton */}
            <div className="container mx-auto px-6 py-12">
                {/* Navigation Tabs Skeleton */}
                <div className="flex space-x-8 mb-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Tracks Section Skeleton */}
                <div className="space-y-6">
                    <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

                    {/* Track Items Skeleton */}
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Card
                                key={index}
                                className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm animate-pulse"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        {/* Play Button Skeleton */}
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

                                        {/* Track Image Skeleton */}
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>

                                        {/* Track Info Skeleton */}
                                        <div className="flex-1 space-y-2">
                                            <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>

                                        {/* Genre Badge Skeleton */}
                                        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

                                        {/* Duration Skeleton */}
                                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>

                                        {/* Action Buttons Skeleton */}
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
