import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Album } from "@/lib/controllers/albums";

interface AlbumsListProps {
  initialAlbums: Album[];
}

export function AlbumsList({ initialAlbums }: Readonly<AlbumsListProps>) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {initialAlbums.map((album) => (
        <Link key={album.id} href={`/album/${album.id}`}>
          <Card className="hover:scale-105 transition-transform cursor-pointer">
            <CardContent className="p-0">
              <div className="aspect-square w-full overflow-hidden rounded-t-xl">
                {album.cover_image_url ? (
                  <Image
                    src={album.cover_image_url}
                    alt={album.title}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-muted flex items-center justify-center w-full h-full min-h-[150px]">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="font-semibold truncate">{album.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {album.artist?.name || "Unknown Artist"}
                </div>
                {album.release_date && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(album.release_date).getFullYear()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
