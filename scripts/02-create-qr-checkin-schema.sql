-- Create QR codes table for user check-ins
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  qr_token VARCHAR(255) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, event_id)
);

-- Create check-ins table to track when users scan QR codes
CREATE TABLE IF NOT EXISTS check_ins (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  qr_code_id INTEGER REFERENCES qr_codes(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create session registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  attended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, session_id)
);
