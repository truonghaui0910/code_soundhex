
export interface Track {
  id: number;
  title: string;
  duration: number | null;
  file_url?: string;
  audio_file_url?: string;
  artist?: {
    id: string | number;
    name: string;
  };
  album?: {
    id: string | number;
    title: string;
    cover_image_url?: string;
  };
  genre?: {
    name: string;
  };
}
