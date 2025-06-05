
export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { MusicExplorer } from "./music-explorer";
import { TracksController } from "@/lib/controllers/tracks";

export const metadata: Metadata = {
  title: "SoundHex Music Platform",
  description: "Discover, stream, and upload music for free",
};

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
