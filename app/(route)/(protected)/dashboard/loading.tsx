
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Music, 
  TrendingUp, 
  Users, 
  Album, 
  DollarSign, 
  Bell, 
  Play, 
  BarChart3, 
  FileText, 
  Activity,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            {/* Title Skeleton */}
            <div className="h-12 md:h-16 bg-white/20 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-6 md:h-8 bg-white/20 rounded-lg mb-8 w-3/4 animate-pulse"></div>

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => {
                const icons = [Play, Music, FileText, DollarSign];
                const colors = [
                  "from-purple-500 to-pink-500",
                  "from-pink-500 to-rose-500", 
                  "from-indigo-500 to-blue-500",
                  "from-green-500 to-emerald-500"
                ];
                const Icon = icons[idx];
                
                return (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colors[idx]} rounded-full flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-6 bg-white/20 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View Selector Skeleton */}
            <div className="flex gap-4 mt-8">
              {[
                { icon: Activity, label: "Overview" },
                { icon: BarChart3, label: "Analytics" },
                { icon: FileText, label: "Agreements" }
              ].map((item, idx) => (
                <div key={idx} className="h-12 bg-white/20 rounded-lg animate-pulse flex items-center px-4 gap-2">
                  <item.icon className="h-5 w-5 text-white/40" />
                  <div className="h-4 w-20 bg-white/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-32">
        <div className="space-y-8 pt-12">
          {/* Revenue Section Skeleton */}
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
              {Array.from({ length: 3 }).map((_, idx) => {
                const icons = [TrendingUp, BarChart3, Play];
                const colors = ["green", "blue", "purple"];
                const Icon = icons[idx];
                
                return (
                  <Card key={idx} className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3 w-2/3 animate-pulse"></div>
                          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-3 animate-pulse"></div>
                          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                        </div>
                        <div className={`w-12 h-12 bg-${colors[idx]}-100 dark:bg-${colors[idx]}-900/20 rounded-full flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 text-${colors[idx]}-600`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Recent Activity Section Skeleton */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Tracks Skeleton */}
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Music className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Recent Tracks</h2>
                  </div>
                </div>
                <CardContent className="space-y-4 p-6">
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const icons = [CheckCircle, Clock, AlertCircle];
                    const colors = ["green", "yellow", "red"];
                    const Icon = icons[idx];
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            <Icon className={`h-5 w-5 text-${colors[idx]}-600`} />
                          </div>
                          <div>
                            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-32 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Distribution Status Skeleton */}
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Upload className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Distribution Status</h2>
                  </div>
                </div>
                <CardContent className="space-y-4 p-6">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                          <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300 animate-pulse" 
                          style={{ width: `${(idx + 1) * 33}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Notifications Section Skeleton */}
          <section>
            <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Recent Notifications</h2>
                </div>
              </div>
              <CardContent className="space-y-4 p-6">
                {Array.from({ length: 3 }).map((_, idx) => {
                  const icons = [AlertCircle, DollarSign, Clock];
                  const colors = ["orange", "green", "red"];
                  const Icon = icons[idx];
                  
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <Icon className={`h-5 w-5 text-${colors[idx]}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Loading Message */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading dashboard...
            </span>
          </div>
        </div>
      </div>

      {/* Music Player Space */}
      <div className="pb-32"></div>
    </div>
  );
}
