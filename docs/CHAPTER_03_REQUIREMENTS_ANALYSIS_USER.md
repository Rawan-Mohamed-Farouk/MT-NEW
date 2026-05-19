```markdown
# Chapter 3: Requirements Analysis

## 3.1 Business Requirements Identification

### Software Development Methodology: Agile (Scrum)

Selection justification:
- Iterative delivery enables frequent user feedback, critical for accessibility and AI features that evolve with user needs.
- Scrum provides short sprints for incremental improvements to the RAG chatbot, search intelligence, and accessibility controls.
- Agile mitigates risk by enabling early testing with real users (people with disabilities) and adapting requirements.
- Cross-functional collaboration between backend, frontend, and AI teams is supported by Scrum ceremonies (planning, daily standups, reviews).

Agile practices to adopt:
- 2-week sprints, sprint planning, backlog grooming
- Definition of Done including accessibility checks (WCAG AA)
- Continuous integration, automated tests, and regular stakeholder demos

## 3.2 User Functional Requirements

### Job Seeker (User) Requirements
- UR-1: Registration & Authentication
  - UR-1.1 Users can register with email, password and profile details
  - UR-1.2 Users can select one or more disabilities during registration
  - UR-1.3 Passwords are validated for strength and stored hashed

- UR-2: Profile Management
  - UR-2.1 View and edit profile (name, phone, location, experience)
  - UR-2.2 Manage disabilities and skills (add/remove)
  - UR-2.3 Upload/change profile photo

- UR-3: Job Search & Discovery
  - UR-3.1 Search by keywords with intelligent synonym matching
  - UR-3.2 Filter by disability support, skills, employment and remote type
  - UR-3.3 View job details and relevance score
  - UR-3.4 Pagination for large result sets

- UR-4: Job Application
  - UR-4.1 Apply with CV upload (PDF) or manual entry
  - UR-4.2 Extract structured info from CVs and store as JSON
  - UR-4.3 View application history and status (pending, reviewing, approved, rejected)

- UR-5: Intelligent Chatbot
  - UR-5.1 Chat with AI assistant for job recommendations
  - UR-5.2 Recommendations are personalized using user's disabilities, skills and history
  - UR-5.3 Bot responses are concise and formatted (bullet points, ≤100 words)

- UR-6: Assistive Tools
  - UR-6.1 Browse and filter assistive tools by disability, platform, and cost
  - UR-6.2 Receive recommendations tailored to user disabilities

- UR-7: Accessibility & Settings
  - UR-7.1 Toggle dark/light mode and high contrast
  - UR-7.2 Adjust font size and enable reduced motion
  - UR-7.3 Keyboard navigation and ARIA support; persist settings in localStorage

### Administrator Requirements
- UR-8: User Management (CRUD, pagination)
- UR-9: Job Management (create, edit, delete, associate with companies, locations, disabilities)
- UR-10: Company Management (CRUD)
- UR-11: Application Review (view, approve, reject, add notes)
- UR-12: Disability Management (CRUD, safety checks)
- UR-13: Dashboard & Analytics (users, jobs, pending applications, security logs)
- UR-14: Admin Authentication & Role-Based Access Control

## 3.3 System Functional and Non-functional Requirements

### 3.3.1 Functional Requirements (summary)
- FR-1 Authentication & Authorization: email/password auth, password hashing, RBAC for admin/user
- FR-2 Data Management: persistent storage of users, jobs, applications, disabilities, skills (SQLAlchemy)
- FR-3 Intelligent Job Matching: relevance scoring, disability prioritization, synonym/fuzzy matching
- FR-4 AI Chatbot: integrate Groq/OpenAI for RAG, build context from profile and jobs, sanitize and format responses
- FR-5 CV Processing: accept PDF, extract text (PyPDF2), parse key fields into JSON
- FR-6 Search & Filtering: multi-criteria search, pagination, flexible matching
- FR-7 File Management: store uploads in `uploads/` with unique filenames, serve via StaticFiles
- FR-8 Security: input sanitization, parameterized queries, rate limiting, CORS
- FR-9 Logging & Monitoring: conversation logs, activity logs, security logs

### 3.3.2 Non-Functional Requirements (summary)
- NFR-1 Performance: API responses within 2s (95th percentile), support ~100 concurrent users, connection pooling
- NFR-2 Security: bcrypt password hashing (≥12 rounds), XSS/SQL injection prevention, rate limiting, secure CORS
- NFR-3 Reliability: graceful DB failure handling, error logging, 99% uptime target
- NFR-4 Usability: WCAG AA compliance, responsive UI, clear errors, accessibility toggles
- NFR-5 Maintainability: PEP8, modular code, documented APIs, versioned migrations
- NFR-6 Scalability: horizontal scaling readiness, DB indexing, caching for heavy queries
- NFR-7 Compatibility: supports Windows/Linux/macOS; modern browsers; MySQL/MariaDB; Python 3.8+; Node.js 16+

---

_This file was created to provide a concise, developer-friendly set of requirements for Chapter 3 as requested._

``` 
