-- Create Q&A questions table
CREATE TABLE IF NOT EXISTS qa_questions (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  answer TEXT,
  answered_by TEXT REFERENCES users_sync(id),
  answered_at TIMESTAMP WITH TIME ZONE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  created_by TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create feedback surveys table
CREATE TABLE IF NOT EXISTS feedback_surveys (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create networking connections table
CREATE TABLE IF NOT EXISTS networking_connections (
  id SERIAL PRIMARY KEY,
  requester_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  recipient_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

-- Create question upvotes table
CREATE TABLE IF NOT EXISTS qa_question_upvotes (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES qa_questions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);
