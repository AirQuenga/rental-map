-- Create properties table for Butte County Rental Atlas
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apn VARCHAR(20) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Property details
  property_type VARCHAR(50) NOT NULL DEFAULT 'single-family',
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  year_built INTEGER,
  lot_size DECIMAL(10, 2),
  
  -- Availability status
  is_available BOOLEAN DEFAULT FALSE,
  current_rent DECIMAL(10, 2),
  last_listed_date TIMESTAMP WITH TIME ZONE,
  last_available_rent DECIMAL(10, 2),
  
  -- Management info
  owner_name TEXT,
  owner_mailing_address TEXT,
  management_type VARCHAR(50) DEFAULT 'unknown',
  management_company VARCHAR(100),
  
  -- Butte County specific
  is_post_fire_rebuild BOOLEAN DEFAULT FALSE,
  is_student_housing BOOLEAN DEFAULT FALSE,
  utility_type VARCHAR(50) DEFAULT 'city',
  fire_zone VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_management ON properties(management_company);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(property_id, email)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_property ON watchlist(property_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_email ON watchlist(email);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Public read access for properties (anyone can view)
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (true);

-- Public read/insert for watchlist (users can add themselves)
CREATE POLICY "Anyone can add to watchlist" ON watchlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own watchlist entries" ON watchlist
  FOR SELECT USING (true);
