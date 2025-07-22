// app/(route)/track/[id]/page.tsx
import { TrackDetailClient } from "./track-detail-client";
import { TracksController } from "@/lib/controllers/tracks";
import { notFound } from "next/navigation";

// Force dynamic để tránh SSR blocking
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Page component - fetch data và validate
export default async function TrackDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  
  let track;
  let trackId: number;

  // Check if ID is numeric (old format) or custom URL
  if (/^\d+$/.test(id)) {
    // Numeric ID
    trackId = parseInt(id);
    track = await TracksController.getTrackById(trackId);
  } else {
    // Custom URL
    track = await TracksController.getTrackByCustomUrl(id);
    if (track) {
      trackId = track.id;
    }
  }

  if (!track) {
    notFound();
  }

  // Pass both trackId and track data to client
  return <TrackDetailClient trackId={trackId} initialTrack={track} />;
} 