export interface Track {
  id: number;
  title: string;
  description?: string;
  duration: number | null;
  file_url?: string;
  audio_file_url?: string;
  artist?: {
    id: string | number;
    name: string;
    custom_url: string;
    profile_image_url?: string;
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
