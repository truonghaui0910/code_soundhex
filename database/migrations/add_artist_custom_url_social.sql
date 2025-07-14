
-- Add custom_url and social columns to artists table
ALTER TABLE artists 
ADD COLUMN custom_url VARCHAR(255) UNIQUE,
ADD COLUMN social TEXT[] DEFAULT '{}';

-- Create index for custom_url for better performance
CREATE INDEX idx_artists_custom_url ON artists(custom_url);

-- Add constraint to ensure custom_url is lowercase and contains only valid characters
ALTER TABLE artists 
ADD CONSTRAINT check_custom_url_format 
CHECK (custom_url ~ '^[a-z0-9-_]+$' OR custom_url IS NULL);
