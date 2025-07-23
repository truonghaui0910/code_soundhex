export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          artist_id: number
          cover_image_url: string | null
          created_at: string | null
          custom_url: string | null
          description: string | null
          id: number
          release_date: string | null
          spotify_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          artist_id?: number
          cover_image_url?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          id?: number
          release_date?: string | null
          spotify_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          artist_id?: number
          cover_image_url?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          id?: number
          release_date?: string | null
          spotify_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          banner_image_url: string | null
          bio: string | null
          created_at: string | null
          custom_url: string | null
          id: number
          name: string
          profile_image_url: string | null
          social: string | null
          spotify_id: string | null
          user_id: string | null
        }
        Insert: {
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          custom_url?: string | null
          id?: number
          name: string
          profile_image_url?: string | null
          social?: string | null
          spotify_id?: string | null
          user_id?: string | null
        }
        Update: {
          banner_image_url?: string | null
          bio?: string | null
          created_at?: string | null
          custom_url?: string | null
          id?: number
          name?: string
          profile_image_url?: string | null
          social?: string | null
          spotify_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          added_at: string | null
          id: number
          playlist_id: number
          track_id: number
        }
        Insert: {
          added_at?: string | null
          id?: number
          playlist_id: number
          track_id: number
        }
        Update: {
          added_at?: string | null
          id?: number
          playlist_id?: number
          track_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_download_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          del_status: number
          description: string | null
          id: number
          name: string
          private: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          del_status?: number
          description?: string | null
          id?: number
          name: string
          private?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          del_status?: number
          description?: string | null
          id?: number
          name?: string
          private?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      track_downloads: {
        Row: {
          download_type: string | null
          downloaded_at: string | null
          error_message: string | null
          file_size_bytes: number | null
          id: number
          ip_address: unknown | null
          success: boolean | null
          track_id: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          download_type?: string | null
          downloaded_at?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: number
          ip_address?: unknown | null
          success?: boolean | null
          track_id: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          download_type?: string | null
          downloaded_at?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          id?: number
          ip_address?: unknown | null
          success?: boolean | null
          track_id?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_downloads_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_download_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_downloads_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_views: {
        Row: {
          id: number
          ip_address: unknown | null
          session_id: string | null
          track_id: number
          user_agent: string | null
          user_id: string | null
          view_duration: number | null
          viewed_at: string | null
        }
        Insert: {
          id?: number
          ip_address?: unknown | null
          session_id?: string | null
          track_id: number
          user_agent?: string | null
          user_id?: string | null
          view_duration?: number | null
          viewed_at?: string | null
        }
        Update: {
          id?: number
          ip_address?: unknown | null
          session_id?: string | null
          track_id?: number
          user_agent?: string | null
          user_id?: string | null
          view_duration?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_views_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_download_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_views_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          album_id: number
          artist_id: number
          created_at: string | null
          custom_url: string | null
          description: string | null
          download_count: number | null
          duration: number | null
          file_hash: string | null
          file_url: string | null
          genre_id: number | null
          id: number
          isrc: string | null
          popularity: number | null
          preview_url: string | null
          source_type: string | null
          spotify_id: string | null
          title: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          album_id?: number
          artist_id?: number
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_hash?: string | null
          file_url?: string | null
          genre_id?: number | null
          id?: number
          isrc?: string | null
          popularity?: number | null
          preview_url?: string | null
          source_type?: string | null
          spotify_id?: string | null
          title: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          album_id?: number
          artist_id?: number
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_hash?: string | null
          file_url?: string | null
          genre_id?: number | null
          id?: number
          isrc?: string | null
          popularity?: number | null
          preview_url?: string | null
          source_type?: string | null
          spotify_id?: string | null
          title?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      user_album_likes: {
        Row: {
          album_id: number
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          album_id: number
          created_at?: string | null
          id?: number
          user_id: string
        }
        Update: {
          album_id?: number
          created_at?: string | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_album_likes_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_artist_follows: {
        Row: {
          artist_id: number
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          artist_id: number
          created_at?: string | null
          id?: number
          user_id: string
        }
        Update: {
          artist_id?: number
          created_at?: string | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_artist_follows_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          email: string
          id: number
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_track_likes: {
        Row: {
          created_at: string | null
          id: number
          track_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          track_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          track_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_track_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "track_download_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_track_likes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      track_download_stats: {
        Row: {
          download_count: number | null
          id: number | null
          last_download: string | null
          title: string | null
          total_downloads: number | null
          unique_downloaders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      update_user_role_on_agreement: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
