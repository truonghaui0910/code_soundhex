import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export const metadata: Metadata = {
  title: "Track | SoundHex",
  description: "Listen to your favorite tracks on SoundHex",
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
} 