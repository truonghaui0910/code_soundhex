
-- Migration: Create track_views table
CREATE TABLE IF NOT EXISTS track_views (
    id BIGSERIAL PRIMARY KEY,
    track_id BIGINT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    view_duration INTEGER, -- Thời gian nghe (giây)
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT, -- Để tránh duplicate views trong cùng session
    
    -- Indexes for performance
    CONSTRAINT unique_session_view UNIQUE(track_id, session_id)
);

-- Indexes for better query performance
CREATE INDEX idx_track_views_track_id ON track_views(track_id);
CREATE INDEX idx_track_views_user_id ON track_views(user_id);
CREATE INDEX idx_track_views_viewed_at ON track_views(viewed_at);
CREATE INDEX idx_track_views_ip_address ON track_views(ip_address);

-- Add view_count column to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;

-- Function to update track view count
CREATE OR REPLACE FUNCTION update_track_view_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the view count in tracks table
    UPDATE tracks 
    SET view_count = (
        SELECT COUNT(*) 
        FROM track_views 
        WHERE track_id = NEW.track_id
    )
    WHERE id = NEW.track_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update view count
CREATE TRIGGER trigger_update_track_view_count
    AFTER INSERT ON track_views
    FOR EACH ROW
    EXECUTE FUNCTION update_track_view_count();

-- RLS policies
ALTER TABLE track_views ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own views
CREATE POLICY "Users can insert their own views" ON track_views
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow reading view counts
CREATE POLICY "Anyone can read view counts" ON track_views
    FOR SELECT USING (true);
