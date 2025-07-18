export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          artist_id: number;
          cover_image_url: string | null;
          created_at: string | null;
          description: string | null;
          id: number;
          release_date: string | null;
          title: string;
        };
        Insert: {
          artist_id?: number;
          cover_image_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          release_date?: string | null;
          title: string;
        };
        Update: {
          artist_id?: number;
          cover_image_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          release_date?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "albums_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
        ];
      };
      artists: {
        Row: {
          banner_image_url: string | null;
          bio: string | null;
          created_at: string | null;
          id: number;
          name: string;
          profile_image_url: string | null;
        };
        Insert: {
          banner_image_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          id?: number;
          name: string;
          profile_image_url?: string | null;
        };
        Update: {
          banner_image_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          id?: number;
          name?: string;
          profile_image_url?: string | null;
        };
        Relationships: [];
      };
      genres: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      tracks: {
        Row: {
          album_id: number;
          artist_id: number;
          created_at: string | null;
          description: string | null;
          duration: number | null;
          file_url: string;
          genre_id: number | null;
          id: number;
          title: string;
        };
        Insert: {
          album_id?: number;
          artist_id?: number;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          file_url: string;
          genre_id?: number | null;
          id?: number;
          title: string;
        };
        Update: {
          album_id?: number;
          artist_id?: number;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          file_url?: string;
          genre_id?: number | null;
          id?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracks_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracks_genre_id_fkey";
            columns: ["genre_id"];
            isOneToOne: false;
            referencedRelation: "genres";
            referencedColumns: ["id"];
          },
        ];
      };
      playlists: {
        Row: {
          id: number;
          del_status: number;
          private: boolean;
          name: string;
          description: string | null;
          cover_image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          del_status?: number;
          private?: boolean;
          name: string;
          description?: string | null;
          cover_image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          del_status?: number;
          private?: boolean;
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      playlist_tracks: {
        Row: {
          id: number;
          playlist_id: number;
          track_id: number;
          added_at: string;
        };
        Insert: {
          id?: number;
          playlist_id: number;
          track_id: number;
          added_at?: string;
        };
        Update: {
          id?: number;
          playlist_id?: number;
          track_id?: number;
          added_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
