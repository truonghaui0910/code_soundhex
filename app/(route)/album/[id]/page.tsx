// app/(route)/album/[id]/page.tsx
import { AlbumDetailClient } from "./album-detail-client";

// Force dynamic để tránh SSR blocking
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Page component đơn giản - không fetch data ở đây nữa
export default function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const albumId = Number(params.id);

  // Basic validation
  if (!albumId || isNaN(albumId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-4">Album</h1>
          <p className="text-red-500">Invalid album ID</p>
        </div>
      </div>
    );
  }

  // Chỉ pass albumId, không fetch data ở đây
  return <AlbumDetailClient albumId={albumId} />;
}
