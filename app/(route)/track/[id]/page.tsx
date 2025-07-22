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

  // Try custom_url first since most tracks now have custom_url
  track = await TracksController.getTrackByCustomUrl(id);
  
  // If not found and ID is numeric, try by ID
  if (!track && /^\d+$/.test(id)) {
    trackId = parseInt(id);
    track = await TracksController.getTrackById(trackId);
  }
  
  // Set trackId if we found track by custom_url
  if (track && !trackId) {
    trackId = track.id;
  }

  if (!track) {
    notFound();
  }

  // Pass both trackId and track data to client
  return <TrackDetailClient trackId={trackId} initialTrack={track} />;
} 