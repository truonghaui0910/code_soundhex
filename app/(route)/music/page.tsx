export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import dynamic from 'next/dynamic';
import { TracksController } from "@/lib/controllers/tracks";

export const metadata: Metadata = {
  title: "SoundHex Music Platform",
  description: "Discover, stream, and upload music for free",
};

const MusicExplorer = dynamic(() => import('./music-explorer').then(mod => ({ default: mod.MusicExplorer })), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
    </div>
  ),
});

export default async function MusicPage() {
  try {
    // Get data from controller
    const tracks = await TracksController.getAllTracks();

    return (
      <div className="min-h-screen">
        <MusicExplorer initialTracks={tracks} />
      </div>
    );
  } catch (error) {
    console.error("Error in MusicPage:", error);
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">SoundHex Music Platform</h1>
          <p className="text-red-500">
            Error loading music platform. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}