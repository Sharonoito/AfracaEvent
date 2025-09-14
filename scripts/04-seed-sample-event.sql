-- Insert a sample 5-day event
INSERT INTO events (name, description, start_date, end_date, website_url, location) VALUES 
  (
    'Tech Innovation Summit 2024',
    'A comprehensive 5-day conference covering the latest in technology, innovation, and digital transformation.',
    '2024-03-18',
    '2024-03-22',
    'https://techinnovationsummit.com',
    'San Francisco Convention Center'
  )
ON CONFLICT DO NOTHING;

-- Insert sample sessions for each day (assuming event_id = 1)
INSERT INTO event_sessions (event_id, title, description, speaker, session_date, start_time, end_time, location, max_capacity) VALUES 
  -- Day 1 Sessions
  (1, 'Opening Keynote: The Future of AI', 'Exploring the transformative potential of artificial intelligence', 'Dr. Sarah Chen', '2024-03-18', '09:00', '10:30', 'Main Auditorium', 500),
  (1, 'Workshop: Building Scalable Web Applications', 'Hands-on workshop on modern web development practices', 'Mike Rodriguez', '2024-03-18', '11:00', '12:30', 'Workshop Room A', 50),
  (1, 'Panel: Cybersecurity in the Modern Era', 'Industry experts discuss current security challenges', 'Various Speakers', '2024-03-18', '14:00', '15:30', 'Conference Room B', 200),
  
  -- Day 2 Sessions
  (1, 'Data Science and Machine Learning Trends', 'Latest developments in data science and ML', 'Prof. James Liu', '2024-03-19', '09:00', '10:30', 'Main Auditorium', 500),
  (1, 'UX/UI Design Workshop', 'Creating user-centered design experiences', 'Emma Thompson', '2024-03-19', '11:00', '12:30', 'Design Studio', 30),
  (1, 'Blockchain and Web3 Applications', 'Exploring decentralized technologies', 'Alex Kumar', '2024-03-19', '14:00', '15:30', 'Tech Theater', 150),
  
  -- Day 3 Sessions
  (1, 'Cloud Computing and DevOps', 'Modern infrastructure and deployment strategies', 'Rachel Green', '2024-03-20', '09:00', '10:30', 'Main Auditorium', 500),
  (1, 'Mobile Development Masterclass', 'Cross-platform mobile app development', 'David Park', '2024-03-20', '11:00', '12:30', 'Mobile Lab', 40),
  (1, 'Startup Pitch Competition', 'Emerging startups present their innovations', 'Investor Panel', '2024-03-20', '14:00', '16:00', 'Startup Arena', 300),
  
  -- Day 4 Sessions
  (1, 'IoT and Edge Computing', 'Internet of Things and edge technologies', 'Dr. Maria Santos', '2024-03-21', '09:00', '10:30', 'Main Auditorium', 500),
  (1, 'Product Management Best Practices', 'Strategic product development and management', 'Tom Wilson', '2024-03-21', '11:00', '12:30', 'Strategy Room', 80),
  (1, 'Networking and Career Development', 'Building professional networks in tech', 'Career Experts', '2024-03-21', '14:00', '15:30', 'Networking Lounge', 100),
  
  -- Day 5 Sessions
  (1, 'Closing Keynote: Technology for Good', 'How technology can solve global challenges', 'Dr. Aisha Patel', '2024-03-22', '09:00', '10:30', 'Main Auditorium', 500),
  (1, 'Innovation Showcase', 'Demonstrating cutting-edge technologies', 'Tech Companies', '2024-03-22', '11:00', '13:00', 'Exhibition Hall', 400),
  (1, 'Closing Ceremony and Awards', 'Recognizing outstanding contributions', 'Event Organizers', '2024-03-22', '14:00', '15:00', 'Main Auditorium', 500);
