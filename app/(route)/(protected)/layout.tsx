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
        {/* Mobile: Stack layout, Desktop: Flex layout */}
        <div className="flex-1 md:flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area with dynamic margin-top and left margin for desktop */}
          <main
            className="w-full overflow-y-auto pb-24 ml-0 md:ml-64 md:flex-1 px-0"
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