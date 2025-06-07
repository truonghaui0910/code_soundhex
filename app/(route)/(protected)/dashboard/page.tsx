
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Music,
    TrendingUp,
    Users,
    Album,
    CheckCircle,
    Clock,
    XCircle,
    Upload,
    DollarSign,
    Bell,
    Play,
    Pause,
    BarChart3,
    FileText,
    AlertCircle,
    Activity
} from "lucide-react";

// Mock data for dashboard
const dashboardData = {
    agreementStatus: {
        distribution: {
            status: "active",
            effectiveDate: "Jan 1, 2024"
        },
        approval: {
            status: "pending"
        }
    },
    recentTracks: [
        { id: 1, title: "Summer Vibes", status: "approved", plays: 1250 },
        { id: 2, title: "Night City", status: "review", plays: 0 },
        { id: 3, title: "Ocean Dreams", status: "rejected", plays: 0 }
    ],
    revenue: {
        monthly: 2450,
        daily: 185,
        change: "+12.5%"
    },
    agreementOverview: {
        total: 25,
        active: 18,
        pending: 5,
        expired: 2
    },
    latestUploads: [
        { platform: "Spotify", progress: 85, status: "uploading", eta: "2 min" },
        { platform: "Apple Music", progress: 100, status: "completed", eta: "Done" },
        { platform: "YouTube Music", progress: 35, status: "pending", eta: "5 min" }
    ],
    notifications: [
        { type: "approval", message: "New distribution agreement requires approval", time: "2 hours ago" },
        { type: "revenue", message: "Monthly revenue report is ready", time: "1 day ago" },
        { type: "expiration", message: "3 agreements expiring this month", time: "3 days ago" }
    ],
    stats: {
        totalPlays: 45678,
        totalTracks: 24,
        activeAgreements: 18,
        monthlyEarnings: 2450
    }
};

export default function Dashboard() {
    const [currentView, setCurrentView] = useState<"overview" | "analytics" | "agreements">("overview");
    const [mounted, setMounted] = useState(false);

    // Format numbers consistently on client-side to prevent hydration mismatch
    const formatNumber = (num: number): string => {
        if (!mounted) return num.toString();
        return num.toLocaleString('en-US');
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative container mx-auto px-6 py-16">
                    <div className="max-w-4xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-purple-100">
                            Track your music performance • Manage agreements • Monitor revenue
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <Play className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatNumber(dashboardData.stats.totalPlays)}</p>
                                        <p className="text-purple-200 text-sm">Total Plays</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                                        <Music className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{dashboardData.stats.totalTracks}</p>
                                        <p className="text-purple-200 text-sm">Tracks</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{dashboardData.stats.activeAgreements}</p>
                                        <p className="text-purple-200 text-sm">Agreements</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">${formatNumber(dashboardData.stats.monthlyEarnings)}</p>
                                        <p className="text-purple-200 text-sm">This Month</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* View Selector */}
                        <div className="flex gap-4 mt-8">
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("overview")}
                                className={`${currentView === "overview" ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <Activity className="mr-2 h-5 w-5" />
                                Overview
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("analytics")}
                                className={`${currentView === "analytics" ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Analytics
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setCurrentView("agreements")}
                                className={`${currentView === "agreements" ? "bg-white text-purple-600" : "bg-white/20 text-white hover:bg-white/30"}`}
                            >
                                <FileText className="mr-2 h-5 w-5" />
                                Agreements
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 pb-32">
                {currentView === "overview" && (
                    <div className="space-y-8 pt-12">
                        {/* Revenue Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    Revenue Overview
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    ${formatNumber(dashboardData.revenue.monthly)}
                                                </p>
                                                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                                                    {dashboardData.revenue.change}
                                                </Badge>
                                            </div>
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    ${dashboardData.revenue.daily}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                                <BarChart3 className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plays</p>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {formatNumber(dashboardData.stats.totalPlays)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">All time</p>
                                            </div>
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                                                <Play className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Tracks */}
                                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <Music className="h-4 w-4 text-white" />
                                            </div>
                                            Recent Tracks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {dashboardData.recentTracks.map((track) => (
                                            <div key={track.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                                        {track.status === "approved" ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        ) : track.status === "review" ? (
                                                            <Clock className="h-5 w-5 text-yellow-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">{track.title}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {track.plays > 0 ? `${formatNumber(track.plays)} plays` : 
                                                             track.status === "approved" ? "Ready for distribution" : 
                                                             track.status === "review" ? "Under review" : "Needs revision"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    track.status === "approved" ? "default" : 
                                                    track.status === "review" ? "secondary" : "destructive"
                                                }>
                                                    {track.status === "approved" ? "Approved" : 
                                                     track.status === "review" ? "Review" : "Rejected"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Upload Status */}
                                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <Upload className="h-4 w-4 text-white" />
                                            </div>
                                            Distribution Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {dashboardData.latestUploads.map((upload, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-900 dark:text-white">{upload.platform}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={
                                                            upload.status === "completed" ? "default" : 
                                                            upload.status === "uploading" ? "secondary" : "outline"
                                                        }>
                                                            {upload.status}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">{upload.eta}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            upload.status === "completed" ? "bg-green-500" : 
                                                            upload.status === "uploading" ? "bg-blue-500" : "bg-gray-400"
                                                        }`} 
                                                        style={{ width: `${upload.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Notifications */}
                        <section>
                            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                            <Bell className="h-4 w-4 text-white" />
                                        </div>
                                        Recent Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {dashboardData.notifications.map((notification, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1">
                                                {notification.type === "approval" ? (
                                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                                ) : notification.type === "revenue" ? (
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 dark:text-white">{notification.message}</p>
                                                <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                )}

                {currentView === "analytics" && (
                    <div className="space-y-8 pt-12">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                            <p className="text-gray-600 dark:text-gray-400">Detailed analytics coming soon...</p>
                        </div>
                    </div>
                )}

                {currentView === "agreements" && (
                    <div className="space-y-8 pt-12">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Agreement Management</h2>
                            <p className="text-gray-600 dark:text-gray-400">Manage your distribution agreements here...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
