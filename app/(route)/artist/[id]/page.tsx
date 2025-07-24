
import { notFound } from "next/navigation";
import { ArtistDetailClient } from "./artist-detail-client";
import { ArtistsController } from "@/lib/controllers/artists";

interface ArtistPageProps {
  params: {
    id: string;
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { id } = params;
  
  let artist;
  let artistId: number;

  // Check if ID is numeric (old format) or custom URL
  artist = await ArtistsController.getArtistByCustomUrl(id);

  if (!artist && /^\d+$/.test(id)) {
    // Numeric ID
    artistId = parseInt(id);
    artist = await ArtistsController.getArtistById(artistId);
  } 
  if (artist) {
    artistId = artist.id;
  }

  if (!artist) {
    notFound();
  }

  return <ArtistDetailClient artistId={artistId} artist={artist} />;
}
