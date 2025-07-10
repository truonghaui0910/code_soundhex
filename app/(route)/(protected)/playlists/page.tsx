
"use client";

import PlaylistManager from "@/components/playlist/playlist-manager";

export default function PlaylistsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <PlaylistManager />
      </div>
    </div>
  );
}
