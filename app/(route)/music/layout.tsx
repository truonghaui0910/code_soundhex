import { Navbar } from "@/components/layout/navbar";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export default async function MusicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AudioPlayerProvider>
      <div className="flex flex-col min-h-screen bg-card">
        <Navbar />

        {/* Main content area without sidebar */}
        <main
          className="w-full overflow-y-auto px-0"
          style={{ marginTop: "var(--navbar-height, 64px)" }}
        >
          {children}
        </main>

        {/* Music Player */}
        <MusicPlayer />
      </div>
    </AudioPlayerProvider>
  );
}
