
-- Add del_status and private columns to playlists table
ALTER TABLE playlists 
ADD COLUMN del_status INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN private BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for better performance when filtering by del_status
CREATE INDEX IF NOT EXISTS idx_playlists_del_status ON playlists(del_status);

-- Add index for filtering by private status
CREATE INDEX IF NOT EXISTS idx_playlists_private ON playlists(private);

-- Add comment to explain del_status column
COMMENT ON COLUMN playlists.del_status IS '0 = active, 1 = deleted (soft delete)';
COMMENT ON COLUMN playlists.private IS 'true = private playlist, false = public playlist';
