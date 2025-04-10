"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { Music, FileText, BarChart3, Users } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {!loading && user && (
          <p className="text-muted-foreground">
            {greeting}, {user.email}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Music Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">Available tracks in your account</p>
          </CardContent>
          <CardFooter>
            <Link
              href="/music"
              className="text-xs text-rose-600 hover:underline"
            >
              View all tracks
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active licenses requiring attention</p>
          </CardContent>
          <CardFooter>
            <Link
              href="/license"
              className="text-xs text-rose-600 hover:underline"
            >
              Manage licenses
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">Total streams this month</p>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              +12% from last month
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active collaborators</p>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              Collaboration settings
            </span>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display. Check back later for updates on your track performance, 
              license status, and other activities.
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md border p-3 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Music className="h-5 w-5 text-rose-600" />
                <span className="font-medium">Upload New Track</span>
              </div>
            </div>
            <div className="rounded-md border p-3 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-rose-600" />
                <span className="font-medium">Create License</span>
              </div>
            </div>
            <div className="rounded-md border p-3 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-rose-600" />
                <span className="font-medium">Invite Collaborator</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}