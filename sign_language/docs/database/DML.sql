-- ============================================
-- EmpowerWork Database DML (Data Manipulation Language)
-- Sample Data Insertion Scripts
-- ============================================

USE `rag_jobs`;

-- ============================================
-- Sample Disabilities Data
-- ============================================

INSERT INTO `disabilities` (`name`, `description`, `category`, `icon`, `severity`) VALUES
-- Sensory Disabilities
('Deaf', 'Complete or partial hearing loss. May use sign language, hearing aids, or cochlear implants.', 'Sensory', '👂', NULL),
('Hard of Hearing', 'Partial hearing loss. May benefit from hearing aids, assistive listening devices, or visual communication.', 'Sensory', '👂', NULL),
('Blind', 'Complete vision loss. May use screen readers, braille, guide dogs, or assistive technology.', 'Sensory', '👁️', NULL),
('Low Vision', 'Partial vision loss. May use magnifiers, screen readers, or other visual aids.', 'Sensory', '👁️', NULL),
('Color Blindness', 'Difficulty distinguishing between certain colors. May need color-coded information alternatives.', 'Sensory', '🎨', NULL),

-- Cognitive Disabilities
('ADHD', 'Attention Deficit Hyperactivity Disorder. May benefit from structured environments, breaks, and assistive tools.', 'Cognitive', '🧠', NULL),
('Dyslexia', 'Reading and writing difficulties. May use text-to-speech, dyslexia-friendly fonts, or reading aids.', 'Cognitive', '📖', NULL),
('Autism Spectrum Disorder', 'Neurodevelopmental condition affecting social interaction and communication.', 'Cognitive', '🧩', NULL),
('Learning Disability', 'General learning difficulties requiring alternative learning approaches.', 'Cognitive', '📚', NULL),

-- Physical Disabilities
('Mobility Impairment', 'Difficulty with movement or mobility. May use wheelchairs, walkers, or mobility aids.', 'Physical', '♿', NULL),
('Limited Dexterity', 'Difficulty with fine motor skills. May use voice recognition, adaptive keyboards, or assistive devices.', 'Physical', '✋', NULL),
('Chronic Pain', 'Persistent pain conditions requiring accommodations for comfort and productivity.', 'Physical', '💊', NULL),

-- Mental Health
('Anxiety', 'Anxiety disorders requiring supportive work environments and accommodations.', 'Mental Health', '😰', NULL),
('Depression', 'Depression requiring understanding and flexible work arrangements.', 'Mental Health', '😔', NULL),
('PTSD', 'Post-Traumatic Stress Disorder requiring trauma-informed accommodations.', 'Mental Health', '🛡️', NULL),

-- Other
('Speech Impairment', 'Difficulty with speech. May use communication devices or alternative communication methods.', 'Communication', '🗣️', NULL),
('Hearing Impairment', 'General hearing difficulties requiring accommodations.', 'Sensory', '👂', NULL),
('Visual Impairment', 'General vision difficulties requiring accommodations.', 'Sensory', '👁️', NULL);

-- ============================================
-- Sample Skills Data
-- ============================================

INSERT INTO `skills` (`name`) VALUES
-- Technical Skills
('Python'),
('JavaScript'),
('React'),
('FastAPI'),
('SQL'),
('MySQL'),
('Git'),
('HTML'),
('CSS'),
('Node.js'),
('TypeScript'),
('Java'),
('C++'),
('PHP'),
('Docker'),

-- Soft Skills
('Communication'),
('Teamwork'),
('Problem Solving'),
('Leadership'),
('Time Management'),
('Adaptability'),
('Creativity'),
('Critical Thinking'),

-- Professional Skills
('Project Management'),
('Data Analysis'),
('Web Development'),
('Mobile Development'),
('UI/UX Design'),
('Database Design'),
('Software Testing'),
('Agile/Scrum');

-- ============================================
-- Sample Companies Data
-- ============================================

INSERT INTO `companies` (`name`, `description`, `website`, `logo`) VALUES
('TechCorp', 'Leading technology company specializing in software development and innovation.', 'https://techcorp.com', NULL),
('DataInc', 'Data analytics and business intelligence solutions provider.', 'https://datainc.com', NULL),
('WebSolutions', 'Full-service web development and digital marketing agency.', 'https://websolutions.com', NULL),
('CloudSystems', 'Cloud infrastructure and managed services provider.', 'https://cloudsystems.com', NULL),
('InnovateLabs', 'Research and development company focused on emerging technologies.', 'https://innovatelabs.com', NULL);

-- ============================================
-- Sample Locations Data
-- ============================================

INSERT INTO `locations` (`city`, `state`, `country`, `address`) VALUES
('New York', 'NY', 'USA', '123 Main Street, New York, NY 10001'),
('San Francisco', 'CA', 'USA', '456 Market Street, San Francisco, CA 94102'),
('London', NULL, 'UK', '789 Oxford Street, London, UK'),
('Toronto', 'ON', 'Canada', '321 Bay Street, Toronto, ON M5H 2R2'),
('Remote', NULL, 'Global', 'Remote Work');

-- ============================================
-- Sample Jobs Data
-- ============================================

INSERT INTO `jobs` (`title`, `description`, `employment_type`, `remote_type`, `company_id`, `location_id`, `created_at`) VALUES
('Software Developer', 'We are looking for an experienced software developer to join our team. Must have experience with Python and React.', 'full-time', 'hybrid', 1, 1, NOW()),
('Data Analyst', 'Join our data team to analyze business metrics and provide insights. Experience with SQL and data visualization required.', 'full-time', 'remote', 2, 5, NOW()),
('Frontend Developer', 'Build beautiful and accessible web interfaces using React and modern CSS frameworks.', 'full-time', 'remote', 3, 5, NOW()),
('Backend Engineer', 'Design and implement scalable backend systems using FastAPI and MySQL.', 'full-time', 'on-site', 1, 2, NOW()),
('UI/UX Designer', 'Create user-friendly and accessible designs for web and mobile applications.', 'part-time', 'hybrid', 3, 3, NOW());

-- ============================================
-- Sample Job Requirements Data
-- ============================================

INSERT INTO `job_requirements` (`job_id`, `requirement`) VALUES
(1, '3+ years of Python development experience'),
(1, 'Experience with React.js'),
(1, 'Knowledge of RESTful API design'),
(2, 'Strong SQL skills'),
(2, 'Experience with data visualization tools'),
(2, 'Bachelor degree in related field'),
(3, 'Proficient in React and TypeScript'),
(3, 'Understanding of accessibility standards (WCAG)'),
(3, 'Portfolio demonstrating UI/UX skills'),
(4, '5+ years backend development experience'),
(4, 'Expertise in FastAPI or similar frameworks'),
(4, 'Database design and optimization skills'),
(5, '3+ years UI/UX design experience'),
(5, 'Proficiency in design tools (Figma, Adobe XD)'),
(5, 'Understanding of accessibility in design');

-- ============================================
-- Sample Job-Disability Support Associations
-- ============================================

-- Job 1 (Software Developer) supports multiple disabilities
INSERT INTO `job_disability_support` (`job_id`, `disability_id`) VALUES
(1, 1),  -- Deaf
(1, 2),  -- Hard of Hearing
(1, 3),  -- Blind
(1, 4),  -- Low Vision
(1, 6),  -- ADHD
(1, 9),  -- Learning Disability
(1, 10), -- Mobility Impairment
(1, 11), -- Limited Dexterity
(1, 12), -- Chronic Pain
(1, 13), -- Anxiety
(1, 14); -- Depression

-- Job 2 (Data Analyst) supports disabilities
INSERT INTO `job_disability_support` (`job_id`, `disability_id`) VALUES
(2, 1),  -- Deaf
(2, 2),  -- Hard of Hearing
(2, 3),  -- Blind
(2, 4),  -- Low Vision
(2, 6),  -- ADHD
(2, 10), -- Mobility Impairment
(2, 11), -- Limited Dexterity
(2, 13), -- Anxiety
(2, 14); -- Depression

-- Job 3 (Frontend Developer) supports disabilities
INSERT INTO `job_disability_support` (`job_id`, `disability_id`) VALUES
(3, 1),  -- Deaf
(3, 2),  -- Hard of Hearing
(3, 3),  -- Blind
(3, 4),  -- Low Vision
(3, 5),  -- Color Blindness
(3, 6),  -- ADHD
(3, 7),  -- Dyslexia
(3, 10), -- Mobility Impairment
(3, 11), -- Limited Dexterity
(3, 13), -- Anxiety
(3, 14); -- Depression

-- ============================================
-- Sample Assistive Tools Data
-- ============================================

INSERT INTO `assistive_tools` (`name`, `description`, `category`, `tool_type`, `platform`, `cost`, `website_url`, `icon`, `features`) VALUES
-- Screen Readers
('NVDA', 'Free and open-source screen reader for Windows', 'Software', 'Screen Reader', 'Windows', 'Free', 'https://www.nvaccess.org/', '👁️', 'Text-to-speech, Braille support, Customizable voices'),
('JAWS', 'Professional screen reader for Windows', 'Software', 'Screen Reader', 'Windows', 'Paid', 'https://www.freedomscientific.com/products/software/jaws/', '👁️', 'Advanced navigation, OCR, Braille support'),
('VoiceOver', 'Built-in screen reader for Apple devices', 'Software', 'Screen Reader', 'Mac/iOS', 'Free', 'https://www.apple.com/accessibility/vision/', '👁️', 'Gesture-based navigation, Voice control'),

-- Speech-to-Text
('Dragon NaturallySpeaking', 'Voice recognition software for dictation', 'Software', 'Speech-to-Text', 'Windows/Mac', 'Paid', 'https://www.nuance.com/dragon.html', '🗣️', 'Voice commands, Accuracy training, Custom vocabulary'),
('Otter.ai', 'AI-powered transcription service', 'Service', 'Speech-to-Text', 'Web/Mobile', 'Freemium', 'https://otter.ai/', '👂', 'Real-time transcription, Meeting notes, Search'),

-- Text-to-Speech
('Natural Reader', 'Text-to-speech software with natural voices', 'Software', 'Text-to-Speech', 'Web/Windows/Mac/Mobile', 'Freemium', 'https://www.naturalreaders.com/', '📖', 'Multiple voices, OCR, Document support'),
('Read&Write', 'Literacy support software with text-to-speech', 'Software', 'Text-to-Speech', 'Windows/Mac/Chrome', 'Paid', 'https://www.texthelp.com/products/read-and-write/', '📚', 'Reading support, Writing assistance, Vocabulary tools'),

-- Focus and Productivity
('Focus@Will', 'Music service designed to improve focus', 'Service', 'Focus Music', 'Web/Mobile', 'Subscription', 'https://www.focusatwill.com/', '🧠', 'Personalized music, Focus tracking, Timer'),
('Todoist', 'Task management app with organization features', 'App', 'Task Management', 'Web/Mobile/Desktop', 'Freemium', 'https://todoist.com/', '✅', 'Task organization, Reminders, Collaboration'),

-- Visual Assistance
('Be My Eyes', 'Free app connecting blind users with sighted volunteers', 'App', 'Visual Assistance', 'iOS/Android', 'Free', 'https://www.bemyeyes.com/', '👁️', 'Live video assistance, Community support'),
('Color Oracle', 'Color blindness simulator for design', 'Software', 'Color Tool', 'Windows/Mac/Linux', 'Free', 'https://colororacle.org/', '🎨', 'Color blindness simulation, Design testing');

-- ============================================
-- Sample Disability-Tool Associations
-- ============================================

-- Blind/Low Vision Tools
INSERT INTO `disability_tools` (`disability_id`, `tool_id`) VALUES
(3, 1),  -- Blind -> NVDA
(3, 2),  -- Blind -> JAWS
(3, 3),  -- Blind -> VoiceOver
(3, 11), -- Blind -> Be My Eyes
(4, 1),  -- Low Vision -> NVDA
(4, 2),  -- Low Vision -> JAWS
(4, 3),  -- Low Vision -> VoiceOver
(4, 6),  -- Low Vision -> Natural Reader
(4, 7),  -- Low Vision -> Read&Write

-- Deaf/Hard of Hearing Tools
(1, 5),  -- Deaf -> Otter.ai
(2, 5),  -- Hard of Hearing -> Otter.ai

-- ADHD Tools
(6, 9),  -- ADHD -> Focus@Will
(6, 10), -- ADHD -> Todoist

-- Dyslexia Tools
(7, 6),  -- Dyslexia -> Natural Reader
(7, 7),  -- Dyslexia -> Read&Write

-- Color Blindness Tools
(5, 12); -- Color Blindness -> Color Oracle

-- ============================================
-- Sample Admin User (Password: admin123 - hash this in production!)
-- ============================================

-- Note: In production, passwords should be hashed using Werkzeug/bcrypt
-- This is just an example. Use the create_admin_user.py script for actual admin creation.
-- INSERT INTO `users` (`name`, `email`, `password`, `user_type`, `created_at`) VALUES
-- ('Admin User', 'admin@empowerwork.com', '$2b$12$hashed_password_here', 'admin', NOW());

-- ============================================
-- End of DML
-- ============================================

