
-- Create track_downloads table to log download activities
CREATE TABLE IF NOT EXISTS track_downloads (
    id BIGSERIAL PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    download_type VARCHAR(50) DEFAULT 'single', -- 'single', 'batch', 'album'
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size_bytes BIGINT,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_track_downloads_track_id ON track_downloads(track_id);
CREATE INDEX IF NOT EXISTS idx_track_downloads_user_id ON track_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_track_downloads_downloaded_at ON track_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_track_downloads_ip_address ON track_downloads(ip_address);
CREATE INDEX IF NOT EXISTS idx_track_downloads_success ON track_downloads(success);

-- Add download_count column to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS download_count BIGINT DEFAULT 0;

-- Function to update track download count
CREATE OR REPLACE FUNCTION update_track_download_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only count successful downloads
    IF NEW.success = true THEN
        UPDATE tracks 
        SET download_count = (
            SELECT COUNT(*) 
            FROM track_downloads 
            WHERE track_id = NEW.track_id AND success = true
        )
        WHERE id = NEW.track_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update download count
CREATE TRIGGER trigger_update_track_download_count
    AFTER INSERT ON track_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_track_download_count();

-- Enable RLS (Row Level Security)
ALTER TABLE track_downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own downloads" ON track_downloads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON track_downloads
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow public to read aggregated download counts
CREATE POLICY "Public can read download counts" ON track_downloads
    FOR SELECT USING (true);

-- Create a view for download statistics
CREATE OR REPLACE VIEW track_download_stats AS
SELECT 
    t.id,
    t.title,
    t.download_count,
    COUNT(td.id) as total_downloads,
    COUNT(DISTINCT td.user_id) as unique_downloaders,
    MAX(td.downloaded_at) as last_download
FROM tracks t
LEFT JOIN track_downloads td ON t.id = td.track_id AND td.success = true
GROUP BY t.id, t.title, t.download_count;
