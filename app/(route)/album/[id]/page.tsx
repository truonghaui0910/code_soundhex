
// app/(route)/album/[id]/page.tsx
import { AlbumDetailClient } from "./album-detail-client";
import { AlbumsController } from "@/lib/controllers/albums";
import { notFound } from "next/navigation";

// Force dynamic để tránh SSR blocking
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Page component - fetch data và validate
export default async function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  
  let album;
  let albumId: number;

  // Check if ID is numeric (old format) or custom URL
  if (/^\d+$/.test(id)) {
    // Numeric ID
    albumId = parseInt(id);
    album = await AlbumsController.getAlbumById(albumId);
  } else {
    // Custom URL
    album = await AlbumsController.getAlbumByCustomUrl(id);
    if (album) {
      albumId = album.id;
    }
  }

  if (!album) {
    notFound();
  }

  // Pass both albumId and album data to client
  return <AlbumDetailClient albumId={albumId} album={album} />;
}
