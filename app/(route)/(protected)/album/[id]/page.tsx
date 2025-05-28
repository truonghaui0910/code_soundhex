import { notFound } from "next/navigation";
import { TracksController } from "@/lib/controllers/tracks";
import { AlbumsController } from "@/lib/controllers/albums";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export default async function AlbumDetailPage({ params }: Readonly<{ params: { id: string } }>) {
  const albumId = Number(params.id);
  if (!albumId) return notFound();

  // Lấy thông tin album và danh sách bài hát
  let album, tracks;
  try {
    const albums = await AlbumsController.getAllAlbums();
    album = albums.find((a) => a.id === albumId);
    tracks = await TracksController.getTracksByAlbum(albumId);
  } catch (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-4">Album</h1>
        <p className="text-red-500">Không thể tải thông tin album.</p>
      </div>
    );
  }
  if (!album) return notFound();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-end mb-8">
        <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {album.cover_image_url ? (
            <Image src={album.cover_image_url} alt={album.title} width={192} height={192} className="object-cover w-full h-full" />
          ) : (
            <span className="text-muted-foreground text-6xl">🎵</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <span className="uppercase text-xs font-semibold text-muted-foreground">Album</span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">{album.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{album.artist?.name || "Unknown Artist"}</span>
            {album.release_date && <span>· {new Date(album.release_date).getFullYear()}</span>}
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="py-3 px-4 text-left w-12">#</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Artist</th>
                <th className="py-3 px-4 text-left">Genre</th>
                <th className="py-3 px-4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {tracks && tracks.length > 0 ? tracks.map((track, idx) => (
                <tr key={track.id} className="border-b hover:bg-muted/50 cursor-pointer">
                  <td className="py-3 px-4 text-center">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium">{track.title}</td>
                  <td className="py-3 px-4">{track.artist?.name}</td>
                  <td className="py-3 px-4">
                    {track.genre ? <Badge variant="outline">{track.genre.name}</Badge> : <span className="text-muted-foreground">--</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}` : "--:--"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No tracks in this album.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="mt-8">
        <MusicPlayer />
      </div>
    </div>
  );
}
