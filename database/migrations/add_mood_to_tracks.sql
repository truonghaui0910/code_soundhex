
-- Add mood column to tracks table
ALTER TABLE tracks ADD COLUMN mood TEXT[];

-- Add index for better query performance
CREATE INDEX idx_tracks_mood ON tracks USING GIN (mood);

-- Add comment
COMMENT ON COLUMN tracks.mood IS 'Array of mood tags for the track (e.g., happy, sad, energetic)';
