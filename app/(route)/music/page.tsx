
import { Metadata } from "next";
import { TracksController } from "@/lib/controllers/tracks";
import { MusicExplorerClient } from "./music-explorer-client";

export const metadata: Metadata = {
  title: "Music Explorer - SoundHex",
  description: "Discover and explore music on SoundHex platform",
};

export default async function MusicPage() {
  try {
    // Get only most viewed tracks instead of all tracks
    const tracks = await TracksController.getMostViewedTracks(10);

    return (
      <div className="min-h-screen">
        <MusicExplorerClient initialTracks={tracks} />
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
