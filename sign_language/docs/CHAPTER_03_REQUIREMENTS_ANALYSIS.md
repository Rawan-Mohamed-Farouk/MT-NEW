# Chapter 3: Requirements Analysis

## 3.1. Business Requirements Identification (Software Development Methodology Used)

### Software Development Methodology Used: **Agile/Scrum**

**Selection Justification:**

1. **Iterative Development**: The project requires continuous refinement of features like AI-powered job matching, chatbot intelligence, and accessibility features. Agile allows for incremental improvements based on user feedback.

2. **Changing Requirements**: Disability accommodation needs and assistive technologies evolve rapidly. Agile methodology accommodates requirement changes throughout development.

3. **User-Centric Approach**: The platform serves people with disabilities who have diverse needs. Agile's focus on user stories and regular feedback ensures the system meets actual user requirements.

4. **Fast Delivery**: Agile enables delivering working features quickly, allowing early testing with target users (people with disabilities).

5. **Collaborative Development**: The project involves multiple components (backend API, frontend UI, AI integration, database). Agile's sprint-based approach facilitates parallel development and integration.

6. **Risk Management**: Early identification of accessibility issues, integration challenges, and AI model limitations can be addressed in each sprint.

**Agile Practices Implemented:**
- Sprint-based development (2-week sprints)
- Daily standups for progress tracking
- User story mapping for feature prioritization
- Continuous integration and testing
- Regular stakeholder feedback sessions

---

## 3.2. User Functional Requirements

### 3.2.1. Job Seeker (User with Disability) Requirements

**UR-1: User Registration and Authentication**
- **UR-1.1**: Users must be able to register with email, password, and personal information
- **UR-1.2**: Users must be able to select their disabilities during registration (multiple selection)
- **UR-1.3**: Users must be able to select their skills during registration (multiple selection)
- **UR-1.4**: Users must be able to upload a profile photo
- **UR-1.5**: Users must be able to login with email and password
- **UR-1.6**: System must validate email format and password strength (minimum 8 characters)
- **UR-1.7**: System must hash passwords using Werkzeug (bcrypt) before storage
- **UR-1.8**: System must implement rate limiting (5 registration attempts per 5 minutes)

**UR-2: Profile Management**
- **UR-2.1**: Users must be able to view their profile information
- **UR-2.2**: Users must be able to edit their profile (name, phone, age, gender, location)
- **UR-2.3**: Users must be able to add/remove disabilities from their profile
- **UR-2.4**: Users must be able to add/remove skills from their profile
- **UR-2.5**: Users must be able to update their preferred job type and experience level
- **UR-2.6**: Users must be able to change their profile photo
- **UR-2.7**: Users must be able to view their application history with status

**UR-3: Job Search and Discovery**
- **UR-3.1**: Users must be able to search jobs by keywords (intelligent search with synonym matching)
- **UR-3.2**: Users must be able to filter jobs by:
  - Disability support (multiple disabilities)
  - Required skills (multiple skills)
  - Employment type (full-time, part-time, contract, internship)
  - Remote type (remote, on-site, hybrid)
- **UR-3.3**: System must prioritize jobs that support user's disabilities
- **UR-3.4**: System must calculate relevance scores for job matches
- **UR-3.5**: Users must be able to view job details (title, description, company, location, requirements, disability support)
- **UR-3.6**: System must show which jobs the user has already applied to
- **UR-3.7**: System must support pagination (default 20 jobs per page)

**UR-4: Job Application**
- **UR-4.1**: Users must be able to apply for jobs
- **UR-4.2**: Users must be able to upload a CV (PDF format, max 5MB)
- **UR-4.3**: Users must be able to write a cover letter
- **UR-4.4**: Users must be able to apply manually without CV upload (manual entry form)
- **UR-4.5**: Manual entry form must include: Name, Email, Phone, Skills, Experience, Education
- **UR-4.6**: System must extract information from uploaded CVs (name, email, phone, skills, experience, education)
- **UR-4.7**: System must store extracted CV information as JSON
- **UR-4.8**: Users must be able to view their application history
- **UR-4.9**: Users must be able to see application status (pending, approved, rejected, reviewing)
- **UR-4.10**: Users must be able to view admin notes on reviewed applications

**UR-5: Intelligent Chatbot Assistant**
- **UR-5.1**: Users must be able to chat with an AI assistant (Groq API integration)
- **UR-5.2**: Chatbot must provide personalized job recommendations based on user's disabilities
- **UR-5.3**: Chatbot must consider user's application history
- **UR-5.4**: Chatbot must explain why jobs match user's disabilities
- **UR-5.5**: Chatbot responses must be concise (max 100 words, bullet points, no emojis)
- **UR-5.6**: Chatbot must filter and prioritize jobs based on user message and profile
- **UR-5.7**: Chatbot must avoid recommending jobs user has already applied to
- **UR-5.8**: System must implement rate limiting (20 requests per 60 seconds)

**UR-6: Assistive Tools Discovery**
- **UR-6.1**: Users must be able to browse assistive tools
- **UR-6.2**: Users must be able to filter tools by:
  - Disability type
  - Category (screen readers, speech-to-text, etc.)
  - Platform (Windows, Mac, Mobile, Web, All)
  - Cost (free, paid, freemium)
- **UR-6.3**: System must recommend tools based on user's disabilities
- **UR-6.4**: Users must be able to view tool details (description, features, website link, platform, cost)

**UR-7: Accessibility Features**
- **UR-7.1**: Users must be able to toggle dark/light mode
- **UR-7.2**: Users must be able to adjust font size (12px to 24px)
- **UR-7.3**: Users must be able to enable high contrast mode
- **UR-7.4**: Users must be able to enable reduced motion mode
- **UR-7.5**: System must be keyboard navigable
- **UR-7.6**: System must support screen readers (ARIA labels)
- **UR-7.7**: System must persist accessibility settings in localStorage
- **UR-7.8**: System must provide skip-to-content link

### 3.2.2. Administrator Requirements

**UR-8: User Management**
- **UR-8.1**: Admins must be able to view all registered users (with pagination)
- **UR-8.2**: Admins must be able to view user details (profile, disabilities, skills, applications)
- **UR-8.3**: Admins must be able to edit user information
- **UR-8.4**: Admins must be able to delete users
- **UR-8.5**: Admins must be able to create admin accounts
- **UR-8.6**: System must use eager loading to prevent N+1 queries

**UR-9: Job Management**
- **UR-9.1**: Admins must be able to create new job postings
- **UR-9.2**: Admins must be able to edit job details
- **UR-9.3**: Admins must be able to delete jobs
- **UR-9.4**: Admins must be able to associate jobs with:
  - Companies
  - Locations (city, state, country, address)
  - Required skills (multiple requirements)
  - Supported disabilities (multiple disabilities)
- **UR-9.5**: Admins must be able to view all job listings (with pagination)
- **UR-9.6**: System must use eager loading for job relationships

**UR-10: Company Management**
- **UR-10.1**: Admins must be able to create company profiles
- **UR-10.2**: Admins must be able to edit company information (name, description, website, logo)
- **UR-10.3**: Admins must be able to delete companies
- **UR-10.4**: Admins must be able to view all companies (with pagination)

**UR-11: Application Review**
- **UR-11.1**: Admins must be able to view pending applications (with pagination)
- **UR-11.2**: Admins must be able to view application details (CV, cover letter, extracted info, manual info)
- **UR-11.3**: Admins must be able to approve applications
- **UR-11.4**: Admins must be able to reject applications
- **UR-11.5**: Admins must be able to add notes to applications
- **UR-11.6**: Admins must be able to view application history
- **UR-11.7**: System must track reviewer ID and review timestamp
- **UR-11.8**: System must use eager loading for application relationships

**UR-12: Disability Management**
- **UR-12.1**: Admins must be able to create new disability types
- **UR-12.2**: Admins must be able to edit disability information (name, description, category, icon, severity)
- **UR-12.3**: Admins must be able to delete disabilities (with safety checks)
- **UR-12.4**: Admins must be able to view all disabilities
- **UR-12.5**: Admins must be able to filter disabilities by category

**UR-13: Dashboard and Analytics**
- **UR-13.1**: Admins must be able to view dashboard with statistics:
  - Total users
  - Total jobs
  - Total companies
  - Pending applications
- **UR-13.2**: Admins must be able to view security logs
- **UR-13.3**: Admins must be able to view security statistics (by severity, threat type)
- **UR-13.4**: Admins must be able to filter security logs by severity and threat type

**UR-14: Admin Authentication**
- **UR-14.1**: Admins must be able to login with email/username and password
- **UR-14.2**: System must distinguish between user and admin login types
- **UR-14.3**: System must redirect admins to admin dashboard after login
- **UR-14.4**: System must enforce role-based access control

---

## 3.3. System Functional and Non-functional Requirements

### 3.3.1. Functional Requirements

**FR-1: Authentication and Authorization**
- **FR-1.1**: System must authenticate users using email and password
- **FR-1.2**: System must hash passwords using Werkzeug (bcrypt, minimum 12 rounds)
- **FR-1.3**: System must maintain user sessions (via React Context)
- **FR-1.4**: System must enforce role-based access (user/admin)
- **FR-1.5**: System must implement rate limiting (5 login attempts per 5 minutes)
- **FR-1.6**: System must validate email format using regex pattern
- **FR-1.7**: System must support both user and admin login types

**FR-2: Data Management**
- **FR-2.1**: System must store user profiles with disabilities and skills (many-to-many relationships)
- **FR-2.2**: System must store job listings with requirements and disability support
- **FR-2.3**: System must store job applications with CV files and extracted information
- **FR-2.4**: System must maintain relationships between users, jobs, disabilities, and skills
- **FR-2.5**: System must support CRUD operations for all entities
- **FR-2.6**: System must use SQLAlchemy ORM for database operations
- **FR-2.7**: System must implement eager loading (joinedload, selectinload) to prevent N+1 queries
- **FR-2.8**: System must support pagination for large datasets

**FR-3: Intelligent Job Matching**
- **FR-3.1**: System must match jobs to users based on disability support
- **FR-3.2**: System must prioritize jobs that support user's specific disabilities
- **FR-3.3**: System must consider user's skills when matching
- **FR-3.4**: System must exclude jobs user has already applied to (unless requested)
- **FR-3.5**: System must use fuzzy matching for job search queries
- **FR-3.6**: System must calculate relevance scores (0.0 to 1.0) for job matches
- **FR-3.7**: System must support synonym matching (e.g., "developer" matches "programmer", "coder")
- **FR-3.8**: System must extract keywords from search queries
- **FR-3.9**: System must filter jobs intelligently based on user message and profile

**FR-4: AI Chatbot**
- **FR-4.1**: System must integrate with Groq API for AI responses
- **FR-4.2**: System must build context from user profile and job database
- **FR-4.3**: System must filter and format jobs for chatbot context (top 5 most relevant)
- **FR-4.4**: System must remove emojis from AI responses
- **FR-4.5**: System must limit response length to 100 words
- **FR-4.6**: System must format responses as bullet points (no paragraphs)
- **FR-4.7**: System must prioritize jobs marked "PERFECT MATCH" (disability support)
- **FR-4.8**: System must avoid recommending jobs marked "(Already Applied)"
- **FR-4.9**: System must use temperature=0.7 and max_completion_tokens=500 for Groq API

**FR-5: CV Processing**
- **FR-5.1**: System must accept PDF CV uploads (max 5MB)
- **FR-5.2**: System must extract text from PDF files using PyPDF2
- **FR-5.3**: System must extract structured information:
  - Name, email, phone
  - Skills
  - Years of experience
  - Education
- **FR-5.4**: System must store extracted information as JSON string in TEXT column
- **FR-5.5**: System must provide property to parse JSON back to dict
- **FR-5.6**: System must support manual entry as alternative to CV upload

**FR-6: Search and Filtering**
- **FR-6.1**: System must support keyword search in job titles and descriptions
- **FR-6.2**: System must support multi-criteria filtering
- **FR-6.3**: System must implement intelligent search with synonym matching
- **FR-6.4**: System must return paginated results (default 20 per page, configurable)
- **FR-6.5**: System must support flexible matching (partial keywords, synonyms)
- **FR-6.6**: System must calculate word match scores for relevance ranking

**FR-7: File Management**
- **FR-7.1**: System must store profile photos in `uploads/profiles/`
- **FR-7.2**: System must store CV files in `uploads/cvs/`
- **FR-7.3**: System must generate unique filenames to prevent conflicts
- **FR-7.4**: System must serve static files via FastAPI StaticFiles
- **FR-7.5**: System must create upload directories if they don't exist

**FR-8: Security Features**
- **FR-8.1**: System must sanitize all user inputs to prevent XSS
- **FR-8.2**: System must validate all input data (email format, string length, integer ranges)
- **FR-8.3**: System must use parameterized queries to prevent SQL injection
- **FR-8.4**: System must implement rate limiting on sensitive endpoints
- **FR-8.5**: System must log security events (login attempts, suspicious activity)
- **FR-8.6**: System must implement CORS with allowed origins restriction
- **FR-8.7**: System must remove dangerous characters from user input

**FR-9: Logging and Monitoring**
- **FR-9.1**: System must log conversation interactions (ConversationLog table)
- **FR-9.2**: System must log user activities (ActivityLog table)
- **FR-9.3**: System must log security events (SecurityLog table)
- **FR-9.4**: System must track IP addresses for security logs
- **FR-9.5**: System must categorize security events by severity (info, warning, critical)

### 3.3.2. Non-Functional Requirements

**NFR-1: Performance**
- **NFR-1.1**: System must respond to API requests within 2 seconds (95th percentile)
- **NFR-1.2**: System must support at least 100 concurrent users
- **NFR-1.3**: Database queries must use eager loading to prevent N+1 problems
- **NFR-1.4**: System must implement pagination for large datasets
- **NFR-1.5**: System must use connection pooling (pool_size=10, max_overflow=20)
- **NFR-1.6**: System must use pool_pre_ping=True for connection health checks
- **NFR-1.7**: System must limit job queries to 50 for chatbot context

**NFR-2: Security**
- **NFR-2.1**: System must hash all passwords (bcrypt, minimum 12 rounds)
- **NFR-2.2**: System must sanitize all user inputs to prevent XSS
- **NFR-2.3**: System must use parameterized queries to prevent SQL injection
- **NFR-2.4**: System must implement rate limiting on sensitive endpoints
- **NFR-2.5**: System must validate all input data (email format, string length, integer ranges)
- **NFR-2.6**: System must log security events (login attempts, suspicious activity)
- **NFR-2.7**: System must implement CORS with allowed origins restriction
- **NFR-2.8**: System must remove dangerous characters (<, >, ", ', &, ;, |, `, $, etc.)

**NFR-3: Reliability**
- **NFR-3.1**: System must have 99% uptime
- **NFR-3.2**: System must handle database connection failures gracefully
- **NFR-3.3**: System must implement error handling with user-friendly messages
- **NFR-3.4**: System must log errors for debugging
- **NFR-3.5**: System must validate database schema on startup
- **NFR-3.6**: System must continue operation even if database connection fails initially

**NFR-4: Usability**
- **NFR-4.1**: System must be accessible (WCAG AA compliance)
- **NFR-4.2**: System must support keyboard navigation
- **NFR-4.3**: System must provide clear error messages
- **NFR-4.4**: System must have responsive design (mobile, tablet, desktop)
- **NFR-4.5**: System must support dark/light mode
- **NFR-4.6**: System must provide loading indicators for async operations
- **NFR-4.7**: System must support font size adjustment (12px-24px)
- **NFR-4.8**: System must support high contrast mode
- **NFR-4.9**: System must support reduced motion mode

**NFR-5: Maintainability**
- **NFR-5.1**: Code must follow PEP 8 style guide (Python)
- **NFR-5.2**: Code must be modular with clear separation of concerns
- **NFR-5.3**: System must have comprehensive documentation
- **NFR-5.4**: System must use version control (Git)
- **NFR-5.5**: Database migrations must be versioned and reversible

**NFR-6: Scalability**
- **NFR-6.1**: System architecture must support horizontal scaling
- **NFR-6.2**: Database must support indexing on frequently queried columns
- **NFR-6.3**: Static files must be served efficiently
- **NFR-6.4**: API must support caching where appropriate

**NFR-7: Compatibility**
- **NFR-7.1**: System must work on Windows, Linux, and macOS
- **NFR-7.2**: System must support modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-7.3**: System must support MySQL/MariaDB 5.7+
- **NFR-7.4**: System must support Python 3.11+
- **NFR-7.5**: System must support Node.js 16+

