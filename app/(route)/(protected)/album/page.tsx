import { AlbumsController } from "@/lib/controllers/albums";
import { AlbumsList } from "@/components/album/albums-list";

export const dynamic = 'force-dynamic';

export default async function AlbumPage() {
  let albums = [];
  try {
    albums = await AlbumsController.getAllAlbums();
  } catch (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">Albums</h1>
        <p className="text-red-500">Không thể tải danh sách album.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Albums</h1>
        <p className="text-muted-foreground">Khám phá các album nổi bật, nghệ sĩ và năm phát hành.</p>
      </div>
      <AlbumsList initialAlbums={albums} />
    </div>
  );
}
