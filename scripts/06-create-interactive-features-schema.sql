-- Drop existing tables to avoid column conflicts
DROP TABLE IF EXISTS qa_upvotes CASCADE;
DROP TABLE IF EXISTS qa_answers CASCADE;
DROP TABLE IF EXISTS qa_questions CASCADE;
DROP TABLE IF EXISTS qa_sessions CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;

-- Create Q&A sessions table
CREATE TABLE IF NOT EXISTS qa_sessions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  is_moderated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Create Q&A questions table
CREATE TABLE IF NOT EXISTS qa_questions (
  id SERIAL PRIMARY KEY,
  qa_session_id INTEGER REFERENCES qa_sessions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Create Q&A answers table
CREATE TABLE IF NOT EXISTS qa_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES qa_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  answered_by TEXT REFERENCES users_sync(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Q&A upvotes table
CREATE TABLE IF NOT EXISTS qa_upvotes (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES qa_questions(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  multiple_choice BOOLEAN DEFAULT FALSE,
  created_by TEXT REFERENCES users_sync(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_by TEXT REFERENCES users_sync(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Create survey questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('text', 'multiple_choice', 'rating', 'yes_no')),
  is_required BOOLEAN DEFAULT FALSE,
  options JSONB, -- For multiple choice options
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users_sync(id) ON DELETE CASCADE,
  responses JSONB NOT NULL, -- Store all answers as JSON
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

-- Insert sample Q&A sessions
INSERT INTO qa_sessions (session_id, title, description, is_active, is_moderated) VALUES 
  (1, 'Opening Keynote Q&A', 'Ask questions about the future of technology and innovation', true, true),
  (2, 'AI Workshop Q&A', 'Questions about artificial intelligence and machine learning', true, true);

-- Insert sample Q&A questions (without user_id references)
INSERT INTO qa_questions (qa_session_id, question, is_approved, upvotes) VALUES 
  (1, 'What do you think will be the biggest technological breakthrough in the next 5 years?', true, 15),
  (1, 'How can small startups compete with big tech companies in innovation?', true, 8),
  (2, 'What are the ethical considerations when implementing AI in healthcare?', true, 12);

-- Insert sample polls (without created_by references)
INSERT INTO polls (session_id, title, description, is_active, is_anonymous) VALUES 
  (1, 'Most Exciting Technology Trend', 'Which technology trend are you most excited about?', true, true),
  (2, 'AI Implementation Priority', 'What should be the top priority when implementing AI?', true, true);

-- Insert poll options
INSERT INTO poll_options (poll_id, option_text, vote_count) VALUES 
  (1, 'Artificial Intelligence', 45),
  (1, 'Quantum Computing', 23),
  (1, 'Blockchain', 18),
  (1, 'IoT & Edge Computing', 31),
  (2, 'Ethics & Fairness', 38),
  (2, 'Performance & Accuracy', 29),
  (2, 'Transparency & Explainability', 25),
  (2, 'Privacy & Security', 42);

-- Insert sample surveys (without created_by references)
INSERT INTO surveys (event_id, title, description, is_active, is_anonymous) VALUES 
  (1, 'Event Feedback Survey', 'Help us improve future events with your feedback', true, true),
  (1, 'Technology Adoption Survey', 'Share your experience with emerging technologies', true, false);

-- Insert survey questions
INSERT INTO survey_questions (survey_id, question_text, question_type, is_required, options, order_index) VALUES 
  (1, 'How would you rate the overall event experience?', 'rating', true, '{"min": 1, "max": 5, "labels": ["Poor", "Fair", "Good", "Very Good", "Excellent"]}', 1),
  (1, 'Which sessions did you find most valuable?', 'multiple_choice', false, '["Opening Keynote", "AI Workshop", "Blockchain Panel", "Startup Pitch", "Networking Session"]', 2),
  (1, 'What topics would you like to see in future events?', 'text', false, null, 3),
  (2, 'Which technologies is your organization currently using?', 'multiple_choice', true, '["AI/ML", "Cloud Computing", "Blockchain", "IoT", "AR/VR", "Quantum Computing"]', 1),
  (2, 'What is your biggest challenge in technology adoption?', 'multiple_choice', true, '["Budget constraints", "Lack of expertise", "Security concerns", "Integration complexity", "Regulatory compliance"]', 2);
