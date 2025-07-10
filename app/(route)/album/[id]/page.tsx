import { notFound } from "next/navigation";
import dynamic from 'next/dynamic';
import { AlbumsController } from "@/lib/controllers/albums";
import { TracksController } from "@/lib/controllers/tracks";

export const dynamicConfig = 'force-dynamic';

const AlbumDetailClient = dynamic(() => import('./album-detail-client').then(mod => ({ default: mod.AlbumDetailClient })), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
    </div>
  ),
});

export default async function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const albumId = Number(params.id);

  if (!albumId) {
    return notFound();
  }

  try {
    const albums = await AlbumsController.getAllAlbums();
    const album = albums.find((a) => a.id === albumId);

    if (!album) {
      return notFound();
    }

    const tracks = await TracksController.getTracksByAlbum(albumId);

    return <AlbumDetailClient album={album} tracks={tracks} />;
  } catch (error) {
    console.error("Error loading album:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Album</h1>
          <p className="text-red-500">Error loading album. Please try again later.</p>
        </div>
      </div>
    );
  }
}