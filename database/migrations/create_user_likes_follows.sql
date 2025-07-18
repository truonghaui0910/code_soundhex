
-- Create user_track_likes table
CREATE TABLE IF NOT EXISTS user_track_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- Create user_album_likes table
CREATE TABLE IF NOT EXISTS user_album_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    album_id INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, album_id)
);

-- Create user_artist_follows table
CREATE TABLE IF NOT EXISTS user_artist_follows (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, artist_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_track_likes_user_id ON user_track_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_track_likes_track_id ON user_track_likes(track_id);
CREATE INDEX IF NOT EXISTS idx_user_album_likes_user_id ON user_album_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_album_likes_album_id ON user_album_likes(album_id);
CREATE INDEX IF NOT EXISTS idx_user_artist_follows_user_id ON user_artist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_artist_follows_artist_id ON user_artist_follows(artist_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_track_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_album_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_artist_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own likes/follows" ON user_track_likes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own likes/follows" ON user_album_likes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own follows" ON user_artist_follows
    FOR ALL USING (auth.uid() = user_id);

-- Allow public to read aggregated counts (for display purposes)
CREATE POLICY "Public can read like counts" ON user_track_likes
    FOR SELECT USING (true);

CREATE POLICY "Public can read like counts" ON user_album_likes
    FOR SELECT USING (true);

CREATE POLICY "Public can read follow counts" ON user_artist_follows
    FOR SELECT USING (true);
