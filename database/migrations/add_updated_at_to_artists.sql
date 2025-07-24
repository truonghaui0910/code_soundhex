
-- Add updated_at column to artists table
ALTER TABLE artists ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update updated_at when row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artists_updated_at 
    BEFORE UPDATE ON artists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
