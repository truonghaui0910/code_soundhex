// app/(route)/artist/[id]/page.tsx - Fixed version
import { ArtistDetailClient } from './artist-detail-client';

// Force dynamic để tránh SSR blocking
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Page component đơn giản - không fetch data ở đây nữa
export default function ArtistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const artistId = Number(params.id);

  // Basic validation
  if (!artistId || isNaN(artistId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Artist</h1>
          <p className="text-red-500">Invalid artist ID</p>
        </div>
      </div>
    );
  }

  // Chỉ pass artistId, không fetch data ở đây
  return <ArtistDetailClient artistId={artistId} />;
}