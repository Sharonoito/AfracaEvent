-- Create notifications table for real-time updates
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('schedule_change', 'session_update', 'announcement', 'reminder', 'qa_update')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create event announcements table
CREATE TABLE IF NOT EXISTS event_announcements (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT REFERENCES users_sync(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create session updates table for tracking changes
CREATE TABLE IF NOT EXISTS session_updates (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('time_change', 'location_change', 'speaker_change', 'cancelled', 'added')),
  old_value TEXT,
  new_value TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample announcements
INSERT INTO event_announcements (event_id, title, message, priority) VALUES 
  (1, 'Welcome to Tech Innovation Summit 2024!', 'We are excited to have you join us for this amazing 5-day event. Please check your schedule and don''t forget to visit our networking lounge.', 'normal'),
  (1, 'WiFi Information', 'Event WiFi: TechSummit2024, Password: Innovation2024', 'normal'),
  (1, 'Lunch Break Extended', 'Due to popular demand, lunch break has been extended by 15 minutes today. All afternoon sessions will start 15 minutes later.', 'high');
