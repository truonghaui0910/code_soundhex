export interface Track {
  id: number;
  title: string;
  description?: string;
  duration: number | null;
  file_url?: string;
  audio_file_url?: string;
  view_count?: number;
  custom_url?: string | null;
  artist?: {
    id: string | number;
    name: string;
    custom_url: string | null;
    profile_image_url?: string | null;
  } | null;
  album?: {
    id: string | number;
    title: string;
    cover_image_url?: string | null;
    custom_url?: string | null;
  } | null;
  genre?: {
    name: string;
  };
}
