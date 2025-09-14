-- Create events table for the 5-day conference
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  website_url VARCHAR(500),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event sessions table for daily sessions
CREATE TABLE IF NOT EXISTS event_sessions (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  speaker VARCHAR(255),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  max_capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user interests table for networking
CREATE TABLE IF NOT EXISTS user_interests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table (extends the existing users_sync table)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  bio TEXT,
  company VARCHAR(255),
  job_title VARCHAR(255),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user interest mapping table
CREATE TABLE IF NOT EXISTS user_interest_mapping (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  interest_id INTEGER REFERENCES user_interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, interest_id)
);

-- Insert default interests
INSERT INTO user_interests (name) VALUES 
  ('Technology'),
  ('Marketing'),
  ('Design'),
  ('Business Development'),
  ('Data Science'),
  ('Product Management'),
  ('Engineering'),
  ('Sales'),
  ('Finance'),
  ('Healthcare'),
  ('Education'),
  ('Sustainability')
ON CONFLICT (name) DO NOTHING;
