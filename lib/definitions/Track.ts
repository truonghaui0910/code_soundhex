export interface Track {
  id: number;
  title: string;
  description?: string | null;
  duration?: number | null;
  file_url?: string | null;
  source_type?: string | null;
  created_at?: string | null;
  view_count?: number;
  custom_url?: string | null;
  mood?: string[] | null;
  artist?: {
    id: number;
    name: string;
    profile_image_url?: string | null;
    custom_url?: string | null;
    user_id?: string;
  };
  album?: {
    id: number;
    title: string;
    cover_image_url?: string | null;
    custom_url?: string | null;
  };
  genre?: {
    id: number;
    name: string;
  };
}