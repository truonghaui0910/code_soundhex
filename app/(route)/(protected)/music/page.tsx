import { Metadata } from "next";
import { TracksList } from "./tracks-list";
import { TracksController } from "@/lib/controllers/tracks";

export const metadata: Metadata = {
  title: "Music Collection",
  description: "Browse through our music collection",
};

export default async function MusicPage() {
  try {
    // Get data from controller
    const tracks = await TracksController.getAllTracks();
    
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Music Collection</h1>
          <p className="text-muted-foreground">
            Explore and listen to our collection of amazing tracks
          </p>
        </div>
        
        <TracksList initialTracks={tracks} />
      </div>
    );
  } catch (error) {
    console.error("Error in MusicPage:", error);
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Music Collection</h1>
          <p className="text-red-500">
            Error loading music list. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}