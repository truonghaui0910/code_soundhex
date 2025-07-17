
-- Add custom_url column to albums table
ALTER TABLE albums ADD COLUMN custom_url VARCHAR(255) UNIQUE;

-- Add custom_url column to tracks table  
ALTER TABLE tracks ADD COLUMN custom_url VARCHAR(255) UNIQUE;

-- Create indexes for better performance
CREATE INDEX idx_albums_custom_url ON albums(custom_url);
CREATE INDEX idx_tracks_custom_url ON tracks(custom_url);
