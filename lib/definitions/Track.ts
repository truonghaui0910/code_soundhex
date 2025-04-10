export interface Track {
    id: number;
    title: string;
    description: string | null;
    duration: number | null;
    file_url: string;
    created_at: string;
    album: {
      id: number;
      title: string;
      cover_image_url: string | null;
    };
    artist: {
      id: number;
      name: string;
    };
    genre: {
      id: number;
      name: string;
    } | null;
  }