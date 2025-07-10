
-- Add file_hash column to tracks table for duplicate detection
ALTER TABLE tracks ADD COLUMN file_hash VARCHAR(32);

-- Add index for faster lookups
CREATE INDEX idx_tracks_file_hash ON tracks(file_hash);

-- Add unique constraint to prevent same file hash across entire system
CREATE UNIQUE INDEX idx_tracks_unique_file_hash ON tracks(file_hash) WHERE file_hash IS NOT NULL;
