import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AudioPlayerProvider>
      <div className="flex flex-col min-h-screen bg-card">
        <Navbar />
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area with dynamic margin-top and left margin for desktop */}
          <main
            className="flex-1 w-full overflow-y-auto p-4 pb-24 md:ml-64"
            style={{ marginTop: "var(--navbar-height, 64px)" }}
          >
            {children}
          </main>
        </div>
        
        {/* Music Player - hiển thị trên tất cả trang */}
        <MusicPlayer />
      </div>
    </AudioPlayerProvider>
  );
}
