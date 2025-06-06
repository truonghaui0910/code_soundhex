import { notFound } from "next/navigation";
import { ArtistsController } from "@/lib/controllers/artists";
import { TracksController } from "@/lib/controllers/tracks";
import { AlbumsController } from "@/lib/controllers/albums";
import { ArtistDetailClient } from "./artist-detail-client";

export default async function ArtistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const artistId = Number(params.id);

  if (!artistId) {
    return notFound();
  }

  try {
    const artists = await ArtistsController.getAllArtists();
    const artist = artists.find((a) => a.id === artistId);

    if (!artist) {
      return notFound();
    }

    const tracks = await TracksController.getTracksByArtist(artistId);
    const albums = await AlbumsController.getAllAlbums();
    const artistAlbums = albums.filter((album) => album.artist?.id === artistId);

    return (
      <ArtistDetailClient 
        artist={artist} 
        tracks={tracks} 
        albums={artistAlbums} 
      />
    );
  } catch (error) {
    console.error("Error loading artist:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Artist</h1>
          <p className="text-red-500">Error loading artist. Please try again later.</p>
        </div>
      </div>
    );
  }
}