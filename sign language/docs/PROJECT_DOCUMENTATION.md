# EmpowerWork - Complete Project Documentation

## Chapter 1: Introduction

EmpowerWork is a comprehensive job assistance platform specifically designed for people with disabilities. The system provides intelligent job matching, personalized recommendations, assistive tools discovery, and an AI-powered chatbot assistant to help users find suitable employment opportunities that accommodate their specific needs.

### 1.1. Project Overview

EmpowerWork addresses the critical challenge of employment accessibility for people with disabilities by combining modern web technologies, artificial intelligence, and accessibility best practices. The platform enables users to search for jobs that support their specific disabilities, apply with ease (via CV upload or manual entry), and receive personalized recommendations through an intelligent chatbot.

### 1.2. Objectives

- Provide an accessible job search platform for people with disabilities
- Enable intelligent job matching based on disability support and user skills
- Offer AI-powered job recommendations through a chatbot interface
- Facilitate easy job application process with CV processing
- Provide assistive tools discovery and recommendations
- Ensure WCAG AA compliance for accessibility

---

## Chapter 2: Related Work

> **Note**: This chapter has been moved to a separate file for better organization.
> 
> See: **[Chapter 2: Related Work](CHAPTER_02_RELATED_WORK.md)**

---

## Chapter 3: Requirements Analysis

> **Note**: This chapter has been moved to a separate file for better organization.
> 
> See: **[Chapter 3: Requirements Analysis](CHAPTER_03_REQUIREMENTS_ANALYSIS.md)**

---

## Chapter 4: System Design

### 4.1. Sequence Diagrams

#### 4.1.1. User Registration Sequence

```
User → Frontend: Fill registration form (name, email, password, disabilities, skills, photo)
Frontend → Backend API: POST /users/add_user (FormData with photo)
Backend API → Security: Rate limit check (5 requests per 5 minutes)
Backend API → Security: Input validation (email, name, phone format)
Backend API → Database: Check if email exists
Database → Backend API: Return result
Backend API → Security: Hash password (Werkzeug bcrypt)
Backend API → Database: Insert user record
Backend API → Database: Insert user_disabilities records (many-to-many)
Backend API → Database: Insert user_skills records (many-to-many)
Backend API → File System: Save profile photo (uploads/profiles/)
Backend API → Frontend: Return user object (without password)
Frontend → User: Show success message, redirect to login
```

#### 4.1.2. Job Application Sequence (with CV Upload)

```
User → Frontend: Click "Apply" button on job card
Frontend → User: Show application modal
User → Frontend: Upload CV (PDF), write cover letter
Frontend → Backend API: POST /applications/apply (FormData with CV)
Backend API → Security: Rate limit check (10 requests per 5 minutes)
Backend API → Security: Input validation (job_id, user_id, cover_letter)
Backend API → File System: Save CV file (uploads/cvs/, unique filename)
Backend API → PDF Extractor: Extract CV information (PyPDF2)
PDF Extractor → Backend API: Return extracted data (name, email, phone, skills, experience, education)
Backend API → Backend API: Serialize extracted info to JSON string
Backend API → Database: Insert job_application record (cv_path, cv_extracted_info, status='pending')
Database → Backend API: Return application ID
Backend API → Frontend: Return application object with status
Frontend → User: Show success message, update UI
```

#### 4.1.3. Job Application Sequence (Manual Entry)

```
User → Frontend: Click "Apply" button, select "Manual Entry"
Frontend → User: Show manual entry form (pre-filled with profile data)
User → Frontend: Fill/confirm form fields (name, email, phone, skills, experience, education)
Frontend → Backend API: POST /applications/apply_manual (FormData)
Backend API → Security: Rate limit check
Backend API → Security: Input validation
Backend API → Backend API: Build extracted_info dict from form data
Backend API → Backend API: Serialize extracted_info to JSON string
Backend API → Database: Insert job_application record (manual_info, cv_extracted_info, status='pending')
Database → Backend API: Return application ID
Backend API → Frontend: Return application object
Frontend → User: Show success message
```

#### 4.1.4. Chatbot Interaction Sequence

```
User → Frontend: Type message in chat interface
Frontend → Backend API: POST /chat/?user_id=X&message=Y
Backend API → Security: Rate limit check (20 requests per 60 seconds)
Backend API → Security: Input validation (message length, user_id)
Backend API → Database: Load user profile with eager loading (disabilities, skills)
Database → Backend API: Return user data
Backend API → Database: Load user's applications (last 10, with job details)
Database → Backend API: Return applications
Backend API → Database: Load all jobs with eager loading (company, location, requirements, disabilities, limit 50)
Database → Backend API: Return jobs
Backend API → Search Intelligence: Filter jobs based on message and user profile
Search Intelligence → Backend API: Return filtered relevant jobs (prioritized by disability match)
Backend API → RAG Chat: Build context (user profile, applications, jobs)
Backend API → RAG Chat: Format jobs for context (top 5, mark PERFECT MATCH, Already Applied)
Backend API → Groq API: Send prompt with context (system prompt + user context + message)
Groq API → Backend API: Return AI response
Backend API → RAG Chat: Remove emojis, limit to 100 words
Backend API → Frontend: Return formatted response
Frontend → User: Display response in chat interface
```

#### 4.1.5. Intelligent Job Search Sequence

```
User → Frontend: Enter search query and/or select filters
Frontend → Backend API: GET /jobs/search?query=X&disability_id=Y&skill_id=Z&employment_type=W&remote_type=V
Backend API → Security: Input validation (query length, ID validation)
Backend API → Search Intelligence: Extract keywords from query
Backend API → Search Intelligence: Get synonyms for keywords
Backend API → Database: Query jobs with filters (disability support, skills, employment type, remote type)
Backend API → Database: Apply text search (flexible matching with synonyms)
Database → Backend API: Return matching jobs (with eager loading)
Backend API → Search Intelligence: Calculate relevance scores for each job
Backend API → Search Intelligence: Sort by relevance score (descending)
Backend API → Search Intelligence: Apply pagination (limit, offset)
Backend API → Frontend: Return paginated results with relevance scores
Frontend → User: Display job cards sorted by relevance
```

#### 4.1.6. Admin Application Review Sequence

```
Admin → Frontend: View pending applications page
Frontend → Backend API: GET /applications/pending?limit=100&offset=0
Backend API → Database: Query pending applications with eager loading (job, user)
Database → Backend API: Return applications
Backend API → Frontend: Return application list
Frontend → Admin: Display applications table
Admin → Frontend: Click "Review" on application
Frontend → Backend API: GET /applications/{id}
Backend API → Database: Load application with relationships (job, user, reviewer)
Database → Backend API: Return application details (CV path, extracted info, manual info, cover letter)
Backend API → Frontend: Return application details
Frontend → Admin: Show review modal (CV preview, extracted info, cover letter, notes field)
Admin → Frontend: Approve/Reject with notes
Frontend → Backend API: PUT /applications/{id}/review (status, admin_notes, reviewer_id)
Backend API → Database: Update application (status, admin_notes, reviewer_id, reviewed_at=now())
Database → Backend API: Return updated application
Backend API → Frontend: Return success
Frontend → Admin: Show updated status, refresh list
```

---

### 4.2. Entity Relationship Diagram (ERD)

**Complete Database Schema:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(100)) NOT NULL                                │
│     email (VARCHAR(255)) UNIQUE NOT NULL INDEX                  │
│     password (VARCHAR(255))                                     │
│     user_type (VARCHAR(20)) DEFAULT 'user'                      │
│     photo (VARCHAR(500))                                        │
│     phone (VARCHAR(50))                                         │
│     age (INT)                                                   │
│     gender (VARCHAR(20))                                        │
│     location (VARCHAR(255))                                      │
│     experience_level (VARCHAR(50))                              │
│     preferred_job_type (VARCHAR(50))                           │
│     created_at (DATETIME)                                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         │                    │                    │
    ┌────┴────┐         ┌──────┴──────┐      ┌──────┴──────┐
    │         │         │             │      │             │
    ▼         ▼         ▼             ▼      ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│USER_    │ │USER_    │ │JOB_          │ │JOB_          │ │SECURITY_     │
│DISABIL- │ │SKILLS   │ │APPLICATIONS  │ │APPLICATIONS  │ │LOGS          │
│ITIES    │ │         │ │(as applicant)│ │(as reviewer) │ │              │
└─────────┘ └─────────┘ └──────────────┘ └──────────────┘ └──────────────┘
    │             │              │              │              │
    │             │              │              │              │
    ▼             ▼              │              │              │
┌─────────────────────────────────────────────────────────────────┐
│                    DISABILITIES                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) UNIQUE NOT NULL                         │
│     description (TEXT)                                         │
│     category (VARCHAR(100))                                    │
│     icon (VARCHAR(100))                                         │
│     severity (VARCHAR(50))                                      │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────┴────┐         ┌──────┴──────┐      ┌──────┴──────┐
    │         │         │             │      │             │
    ▼         ▼         ▼             ▼      ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐
│USER_    │ │JOB_     │ │DISABILITY_   │ │ASSISTIVE_    │
│DISABIL- │ │DISABIL- │ │TOOLS         │ │TOOLS         │
│ITIES    │ │ITY_     │ │              │ │              │
│         │ │SUPPORT  │ │              │ │              │
└─────────┘ └─────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         SKILLS                                   │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) UNIQUE NOT NULL                         │
└─────────────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐
│USER_    │
│SKILLS   │
└─────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         JOBS                                    │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     title (VARCHAR(255)) NOT NULL                               │
│     description (TEXT)                                         │
│     employment_type (VARCHAR(50))                              │
│     remote_type (VARCHAR(50))                                   │
│ FK: company_id (INT) → companies.id                            │
│ FK: location_id (INT) → locations.id                           │
│     created_at (DATETIME)                                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────┴────┐         ┌──────┴──────┐      ┌──────┴──────┐
    │         │         │             │      │             │
    ▼         ▼         ▼             ▼      ▼             ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐
│JOB_     │ │JOB_     │ │JOB_          │ │COMPANIES     │
│REQUIRE- │ │DISABIL- │ │APPLICATIONS  │ │              │
│MENTS    │ │ITY_     │ │              │ │              │
│         │ │SUPPORT  │ │              │ │              │
└─────────┘ └─────────┘ └──────────────┘ └──────────────┘
    │             │              │              │
    │             │              │              │
    ▼             ▼              │              │
┌─────────────────────────────────────────────────────────────────┐
│                    JOB_REQUIREMENTS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: job_id (INT) NOT NULL → jobs.id                            │
│     requirement (VARCHAR(500)) NOT NULL                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    JOB_APPLICATIONS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: job_id (INT) NOT NULL → jobs.id                            │
│ FK: user_id (INT) NOT NULL → users.id (applicant)             │
│ FK: reviewer_id (INT) → users.id (admin reviewer)             │
│     cover_letter (TEXT)                                         │
│     cv_path (VARCHAR(500))                                      │
│     cv_file_path (VARCHAR(500))                                │
│     cv_extracted_info (TEXT) [JSON string]                     │
│     manual_info (TEXT)                                         │
│     status (VARCHAR(50)) DEFAULT 'pending'                     │
│     admin_notes (TEXT)                                         │
│     applied_at (DATETIME)                                      │
│     reviewed_at (DATETIME)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       COMPANIES                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) NOT NULL                               │
│     description (TEXT)                                         │
│     website (VARCHAR(500))                                      │
│     logo (VARCHAR(500))                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       LOCATIONS                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     city (VARCHAR(100))                                        │
│     state (VARCHAR(100))                                       │
│     country (VARCHAR(100))                                      │
│     address (VARCHAR(500))                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ASSISTIVE_TOOLS                              │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│     name (VARCHAR(255)) NOT NULL                               │
│     description (TEXT)                                         │
│     category (VARCHAR(100))                                    │
│     tool_type (VARCHAR(100))                                   │
│     platform (VARCHAR(100))                                    │
│     cost (VARCHAR(50))                                         │
│     website_url (VARCHAR(500))                                 │
│     icon (VARCHAR(100))                                        │
│     features (TEXT)                                            │
└─────────────────────────────────────────────────────────────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐
│DISABIL- │
│ITY_     │
│TOOLS    │
└─────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATION_LOGS                            │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: user_id (INT) → users.id                                   │
│     message (TEXT) NOT NULL                                    │
│     response (TEXT)                                            │
│     created_at (DATETIME)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       ACTIVITY_LOG                              │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: user_id (INT) → users.id                                   │
│     action (VARCHAR(255)) NOT NULL                             │
│     detail (TEXT)                                              │
│     created_at (DATETIME)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       SECURITY_LOGS                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (INT)                                                     │
│ FK: user_id (INT) → users.id                                   │
│     ip_address (VARCHAR(45)) NOT NULL [IPv6 support]          │
│     action (VARCHAR(255)) NOT NULL                            │
│     severity (VARCHAR(20)) DEFAULT 'info'                      │
│     threat_type (VARCHAR(100))                                 │
│     details (TEXT)                                             │
│     detected_by (VARCHAR(50)) DEFAULT 'system'                 │
│     blocked (BOOLEAN) DEFAULT FALSE                            │
│     created_at (DATETIME)                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Association Tables (Many-to-Many):**
- `user_disabilities`: user_id ↔ disability_id
- `user_skills`: user_id ↔ skill_id
- `job_disability_support`: job_id ↔ disability_id
- `disability_tools`: disability_id ↔ tool_id

**Key Relationships:**
- User ↔ Disability: Many-to-Many (via user_disabilities)
- User ↔ Skill: Many-to-Many (via user_skills)
- User → JobApplication: One-to-Many (as applicant)
- User → JobApplication: One-to-Many (as reviewer)
- Job → JobApplication: One-to-Many
- Job → JobRequirement: One-to-Many
- Job ↔ Disability: Many-to-Many (via job_disability_support)
- Job → Company: Many-to-One
- Job → Location: Many-to-One
- Disability ↔ AssistiveTool: Many-to-Many (via disability_tools)
- User → ConversationLog: One-to-Many
- User → ActivityLog: One-to-Many
- User → SecurityLog: One-to-Many

---

### 4.3. Data Flow Diagrams

#### 4.3.1. DFD Level 0 (Context Diagram)

```
                    ┌──────────────────┐
                    │                  │
    Job Seeker ────►│   EmpowerWork    │◄──── Administrator
                    │     System       │
    Job Data ──────►│                  │◄──── Job Postings
                    │                  │
    Assistive ─────►│                  │
    Tools Data       └──────────────────┘
```

#### 4.3.2. DFD Level 1

```
┌─────────────┐
│   User      │
│  Interface  │
│  (React)    │
└──────┬──────┘
       │
       │ User Input (HTTP Requests)
       ▼
┌─────────────────────────────────────────────────────┐
│         Application Layer (FastAPI)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Auth    │  │   Job    │  │  Chatbot │          │
│  │ Process  │  │  Search  │  │  Engine  │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │             │              │                 │
│  ┌────┴─────┐  ┌───┴──────┐  ┌───┴──────┐         │
│  │ Profile  │  │ Search   │  │   RAG    │         │
│  │ Manager  │  │Intelli-   │  │  Chat    │         │
│  │          │  │gence     │  │          │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │              │                 │
│  ┌────┴─────────────┴─────────────┴─────┐         │
│  │   Application Manager                 │         │
│  │   (CV Processing, Review)            │         │
│  └────┬──────────────────────────────────┘         │
└───────┼──────────────────────────────────────────────┘
        │
        │ Data Requests (SQL Queries)
        ▼
┌─────────────────────────────────────────────────────┐
│        Data Processing Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Business│  │   AI      │  │ Security │          │
│  │  Logic  │  │ Service   │  │  Utils   │          │
│  │         │  │ (Groq)   │  │          │          │
│  └────┬────┘  └────┬─────┘  └────┬─────┘          │
│       │             │              │                 │
│  ┌────┴─────────────┴─────────────┴─────┐         │
│  │   Data Validation & Sanitization      │         │
│  │   (Input validation, XSS prevention) │         │
│  └────┬──────────────────────────────────┘         │
└───────┼──────────────────────────────────────────────┘
        │
        │ SQL Queries (SQLAlchemy ORM)
        ▼
┌─────────────────────────────────────────────────────┐
│         Data Storage Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Database │  │   File   │  │   Logs   │          │
│  │ (MySQL/  │  │  System  │  │  (DB)    │          │
│  │ MariaDB) │  │(uploads/)│  │          │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
```

**Data Flows:**
1. **User Registration Flow**: User Input → Auth Process → Data Validation → Password Hashing → Database + File System
2. **Job Search Flow**: User Input → Job Search → Search Intelligence → Business Logic → Database → Results
3. **Chatbot Flow**: User Message → Chatbot Engine → AI Service (Groq) → Search Intelligence → Business Logic → Database → Response
4. **Application Flow**: User Input → Application Manager → CV Processing → Data Validation → Database + File System
5. **Admin Review Flow**: Admin Input → Application Manager → Data Validation → Database Update

---

### 4.4. State Diagram

#### 4.4.1. Job Application State Diagram

```
                    [Start]
                      │
                      ▼
              ┌───────────────┐
              │   Pending    │◄──────────┐
              │  (Initial)   │           │
              │              │           │
              │ Status:      │           │
              │ 'pending'    │           │
              └──────┬───────┘           │
                     │                   │
                     │ Admin Opens       │
                     │ Application       │
                     ▼                   │
              ┌───────────────┐         │
              │  Under Review │         │
              │               │         │
              │ Status:       │         │
              │ 'reviewing'   │         │
              └──────┬───────┘         │
                     │                   │
         ┌───────────┴───────────┐      │
         │                       │      │
         │ Admin Approves        │      │
         │                       │      │
         ▼                       ▼      │
  ┌─────────────┐        ┌─────────────┐│
  │  Approved   │        │  Rejected   ││
  │  (Final)    │        │  (Final)    ││
  │             │        │             ││
  │ Status:     │        │ Status:    ││
  │ 'approved'  │        │ 'rejected' ││
  └─────────────┘        └─────────────┘│
                                         │
                    [End]◄───────────────┘
```

**States:**
- **Pending**: Application submitted, waiting for admin review (default status)
- **Under Review**: Admin is reviewing the application (status: 'reviewing')
- **Approved**: Application accepted (status: 'approved', final state)
- **Rejected**: Application declined (status: 'rejected', final state)

**Transitions:**
- Pending → Under Review: Admin opens application for review
- Under Review → Approved: Admin approves application with notes
- Under Review → Rejected: Admin rejects application with notes

**Data Stored:**
- `status`: VARCHAR(50) - 'pending', 'reviewing', 'approved', 'rejected'
- `reviewer_id`: INT - Admin user ID who reviewed
- `reviewed_at`: DATETIME - Timestamp of review
- `admin_notes`: TEXT - Admin's review notes

#### 4.4.2. User Session State Diagram

```
                    [Logged Out]
                      │
                      │ User/Admin Clicks Login
                      ▼
              ┌───────────────┐
              │ Authenticating│
              │               │
              │ - Validate    │
              │   credentials│
              │ - Check rate │
              │   limit      │
              └──────┬───────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         │ Valid User            │ Valid Admin
         │ Credentials           │ Credentials
         │                       │
         ▼                       ▼
  ┌─────────────┐        ┌─────────────┐
  │   Logged    │        │   Logged    │
  │   In (User) │        │  In (Admin) │
  │             │        │             │
  │ - Access:   │        │ - Access:   │
  │   Home,     │        │   Admin     │
  │   Profile,  │        │   Dashboard │
  │   Chat,     │        │   & All     │
  │   Tools     │        │   Admin     │
  │             │        │   Pages     │
  └──────┬──────┘        └──────┬──────┘
         │                       │
         │ Logout                │ Logout
         └───────────┬───────────┘
                     │
                     ▼
              [Logged Out]
```

**States:**
- **Logged Out**: No active session
- **Authenticating**: Validating credentials and checking rate limits
- **Logged In (User)**: Regular user session with access to user features
- **Logged In (Admin)**: Admin session with access to admin dashboard and all features

**Transitions:**
- Logged Out → Authenticating: User/Admin attempts login
- Authenticating → Logged In (User): Valid user credentials
- Authenticating → Logged In (Admin): Valid admin credentials (user_type='admin')
- Authenticating → Logged Out: Invalid credentials or rate limited
- Logged In (User/Admin) → Logged Out: User logs out

---

### 4.5. Use Case Diagrams

#### 4.5.1. Job Seeker Use Cases

```
                    ┌─────────────────┐
                    │  Job Seeker     │
                    │  (User)         │
                    └────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Register    │    │     Login     │    │  View Profile  │
│   Account     │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Edit Profile │    │  Search Jobs   │    │ Apply for Job │
│               │    │  (Intelligent)│    │  (CV/Manual)  │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Chat with AI │    │ View Tools    │    │View Application│
│   Assistant   │    │               │    │    History     │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐
│ Adjust        │    │ Filter Tools  │
│ Accessibility │    │ by Disability │
│ Settings      │    │               │
└───────────────┘    └───────────────┘
```

**Use Case Details:**
- **Register Account**: Includes disability and skill selection, photo upload
- **Search Jobs**: Intelligent search with synonym matching, relevance scoring
- **Apply for Job**: Supports both CV upload (PDF) and manual entry
- **Chat with AI Assistant**: Personalized recommendations based on disabilities
- **View Application History**: Shows status, admin notes, review date

#### 4.5.2. Administrator Use Cases

```
                    ┌─────────────────┐
                    │   Administrator │
                    └────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Manage Users │    │  Manage Jobs  │    │Review Applications│
│  (CRUD)       │    │  (CRUD)       │    │  (Approve/     │
│               │    │               │    │   Reject)      │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Manage        │    │  Manage       │    │ View Dashboard│
│ Disabilities  │    │  Companies    │    │  (Statistics) │
│  (CRUD)       │    │  (CRUD)       │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐
│  View Security│    │  Manage Tools │
│     Logs      │    │  (CRUD)       │
│  (Filter by   │    │               │
│   Severity)   │    │               │
└───────────────┘    └───────────────┘
```

**Use Case Details:**
- **Manage Users**: View all users with pagination, edit, delete, view details
- **Manage Jobs**: Create, edit, delete jobs, associate with companies, locations, disabilities, requirements
- **Review Applications**: View pending applications, review CV/extracted info, approve/reject with notes
- **View Dashboard**: Statistics (users, jobs, companies, pending applications)
- **View Security Logs**: Filter by severity, threat type, view security statistics

#### 4.5.3. System Use Cases

```
                    ┌─────────────────┐
                    │   EmpowerWork   │
                    │     System      │
                    └────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Match Jobs to │    │ Extract CV    │    │  Generate AI  │
│ User Profile  │    │  Information  │    │  Responses     │
│ (Intelligent) │    │  (PyPDF2)     │    │  (Groq API)   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Validate     │    │  Store Files   │    │  Log Security │
│  User Input   │    │  (uploads/)    │    │    Events     │
│  (Sanitize)   │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Hash         │    │  Calculate    │    │  Filter Jobs  │
│  Passwords    │    │  Relevance    │    │  for Chatbot  │
│  (Werkzeug)   │    │  Scores       │    │  Context      │
└───────────────┘    └───────────────┘    └───────────────┘
```

**Use Case Details:**
- **Match Jobs to User Profile**: Intelligent matching with relevance scoring, disability prioritization
- **Extract CV Information**: PDF text extraction, structured data parsing (name, email, phone, skills, experience, education)
- **Generate AI Responses**: Groq API integration, context building, emoji removal, length limiting
- **Validate User Input**: XSS prevention, SQL injection prevention, format validation
- **Log Security Events**: Track login attempts, suspicious activity, IP addresses, severity levels

---

### 4.6. User Interface Design

#### 4.6.1. Design Principles

1. **Accessibility First**: WCAG AA compliant design with ARIA labels
2. **Responsive Design**: Mobile-first approach (mobile < 640px, tablet 640px-1024px, desktop > 1024px)
3. **Consistent UI**: TailwindCSS utility classes for consistency
4. **Dark Mode Support**: Automatic theme switching with localStorage persistence
5. **Clear Navigation**: Intuitive menu structure with role-based access
6. **Loading States**: Visual feedback (spinners) for async operations
7. **Error Handling**: User-friendly error messages with toast notifications
8. **Keyboard Navigation**: Full keyboard support with focus indicators

#### 4.6.2. Page Layouts

**4.6.2.1. Login Page**
```
┌─────────────────────────────────────┐
│         EmpowerWork Logo            │
│                                     │
│    ┌─────────────────────────┐     │
│    │   Login Type: [User ▼]  │     │
│    │   Email: [___________]   │     │
│    │   Password: [_______]   │     │
│    │   [ ] Remember me       │     │
│    │   [Login Button]        │     │
│    │   [Register Link]       │     │
│    └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

**4.6.2.2. Home Page (Job Search)**
```
┌─────────────────────────────────────────────────┐
│ Navbar: [Logo] [Search] [Profile] [Chat] [Logout]│
├─────────────────────────────────────────────────┤
│                                                   │
│  Search: [___________________] [🔍 Search]     │
│                                                   │
│  [Filter] Button                                 │
│  Filters: [Disability ▼] [Skill ▼] [Type ▼]    │
│           [Remote Type ▼]                        │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Job Card │  │ Job Card │  │ Job Card │      │
│  │ Title    │  │ Title    │  │ Title    │      │
│  │ Company  │  │ Company  │  │ Company  │      │
│  │ Location │  │ Location │  │ Location │      │
│  │ [Apply]  │  │ [Apply]  │  │ [Apply]  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                   │
│  [Load More]                                     │
│                                                   │
└─────────────────────────────────────────────────┘
```

**4.6.2.3. Profile Page**
```
┌─────────────────────────────────────────────────┐
│ Navbar: [Logo] [Search] [Profile] [Chat] [Logout]│
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │ Profile Info │  │  My Applications     │    │
│  │              │  │                      │    │
│  │ [Photo]      │  │  • Job Title         │    │
│  │ Name: ...    │  │    Status: Pending   │    │
│  │ Email: ...   │  │                      │    │
│  │              │  │  • Job Title         │    │
│  │ [Edit Button]│  │    Status: Approved  │    │
│  │              │  │                      │    │
│  │ Disabilities:│  │  • Job Title         │    │
│  │ [Tag] [Tag]  │  │    Status: Rejected  │    │
│  │              │  │                      │    │
│  │ Skills:      │  │                      │    │
│  │ [Tag] [Tag]  │  │                      │    │
│  └──────────────┘  └──────────────────────┘    │
│                                                   │
└─────────────────────────────────────────────────┘
```

**4.6.2.4. Admin Dashboard**
```
┌─────────────────────────────────────────────────┐
│ Admin Navbar: [Dashboard] [Users] [Jobs] [Apps] │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────┐ │
│  │ Users  │  │  Jobs  │  │  Apps  │  │ Comp │ │
│  │  150   │  │   45   │  │   23   │  │  12  │ │
│  └────────┘  └────────┘  └────────┘  └──────┘ │
│                                                   │
│  Recent Activity:                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ • User registered: John Doe             │   │
│  │ • Application submitted: Job #5          │   │
│  │ • Job created: Software Developer       │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
└─────────────────────────────────────────────────┘
```

**4.6.2.5. Chat Interface**
```
┌─────────────────────────────────────────────────┐
│ Chat Assistant                    [Minimize] [X] │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ AI: Hello! How can I help you find      │   │
│  │     jobs today?                         │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ You: I'm looking for remote jobs        │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ AI: Here are 3 remote jobs that match:  │   │
│  │ • Software Developer at TechCorp        │   │
│  │ • Data Analyst at DataInc               │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  [Type your message...]        [Send]            │
│                                                   │
└─────────────────────────────────────────────────┘
```

**4.6.2.6. Application Modal**
```
┌─────────────────────────────────────────────────┐
│ Apply for Job: Software Developer        [X]     │
├─────────────────────────────────────────────────┤
│                                                   │
│  Method: [CV Upload] [Manual Entry]              │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ CV Upload:                              │   │
│  │ [Choose File] PDF (max 5MB)             │   │
│  │                                         │   │
│  │ Cover Letter:                           │   │
│  │ [Text Area]                             │   │
│  │                                         │   │
│  │ [Submit Application]                    │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
│  OR                                              │
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ Manual Entry:                           │   │
│  │ Name: [Pre-filled]                      │   │
│  │ Email: [Pre-filled]                     │   │
│  │ Phone: [Pre-filled]                     │   │
│  │ Skills: [Pre-filled]                     │   │
│  │ Experience: [Text Area]                 │   │
│  │ Education: [Text Area]                   │   │
│  │                                         │   │
│  │ [Submit Application]                    │   │
│  └─────────────────────────────────────────┘   │
│                                                   │
└─────────────────────────────────────────────────┘
```

#### 4.6.3. Component Structure

**Reusable Components:**
- `Navbar` - Navigation bar with auth state, role-based menu items
- `JobCard` - Job listing card component with apply button
- `ApplicationModal` - Job application form (CV upload or manual entry)
- `ChatBox` - Chatbot interface with message history
- `UserForm` - User profile form (edit mode)
- `JobForm` - Job creation/editing form (admin)
- `Table` - Reusable data table with CRUD operations
- `AccessibilityControls` - Floating accessibility settings panel
- `Footer` - Site footer

**Page Components:**
- `Login` - Authentication page with user/admin selector
- `Register` - Registration page with disability/skill selection
- `Home` - Job search and listing with intelligent filters
- `Profile` - User profile management with application history
- `Chat` - Chatbot page with AI assistant
- `Tools` - Assistive tools page with filtering
- `AdminDashboard` - Admin overview with statistics
- `AdminUsers` - User management (CRUD)
- `AdminJobs` - Job management (CRUD)
- `AdminApplications` - Application review interface
- `AdminCompanies` - Company management (CRUD)
- `AdminDisabilities` - Disability management (CRUD)
- `AdminSecurity` - Security logs viewer

#### 4.6.4. Color Scheme

**Light Mode:**
- Primary: Blue (#3B82F6)
- Background: White (#FFFFFF)
- Text: Gray-900 (#111827)
- Accent: Purple (#8B5CF6)
- Border: Gray-200 (#E5E7EB)

**Dark Mode:**
- Primary: Blue-400 (#60A5FA)
- Background: Gray-900 (#111827)
- Text: Gray-100 (#F3F4F6)
- Accent: Purple-400 (#A78BFA)
- Border: Gray-700 (#374151)

**High Contrast Mode:**
- Background: Black (#000000)
- Text: White (#FFFFFF)
- Accent: Yellow (#FFFF00)

#### 4.6.5. Typography

- **Headings**: Inter, Bold (24px, 20px, 18px)
- **Body**: Inter, Regular (16px, adjustable 12px-24px)
- **Small Text**: Inter, Regular (14px)
- **Line Height**: 1.5 for readability
- **Font Size Control**: User-adjustable via accessibility controls

#### 4.6.6. Responsive Breakpoints

- **Mobile**: < 640px (single column, stacked layout, hamburger menu)
- **Tablet**: 640px - 1024px (2 columns, simplified navigation)
- **Desktop**: > 1024px (3-4 columns, full layout, sidebar navigation)

#### 4.6.7. Accessibility Features

- **Font Size**: Adjustable 12px-24px (stored in localStorage)
- **High Contrast Mode**: Toggle for better visibility
- **Reduced Motion**: Toggle to disable animations
- **Keyboard Navigation**: Full keyboard support with focus indicators
- **Screen Reader Support**: ARIA labels, semantic HTML, skip-to-content link
- **Color Contrast**: WCAG AA compliant (4.5:1 for normal text, 3:1 for large text)

---

## Summary

This documentation provides a comprehensive overview of the EmpowerWork system, covering:
- Business requirements and Agile methodology selection with justification
- Detailed user functional requirements (19 user requirements, 14 admin requirements)
- System functional requirements (9 categories) and non-functional requirements (7 categories)
- Complete system design including:
  - 6 sequence diagrams (registration, application with CV, manual entry, chatbot, job search, admin review)
  - Complete ERD with all 12 entities and 4 association tables
  - DFD Level 0 and Level 1 with detailed data flows
  - 2 state diagrams (application state, user session)
  - 3 use case diagrams (job seeker, administrator, system) with detailed use cases
  - Comprehensive UI design specifications (6 page layouts, component structure, color schemes, typography, responsive breakpoints, accessibility features)

The system is designed using Agile methodology to accommodate the evolving needs of users with disabilities, with a focus on accessibility, security, intelligent job matching, and comprehensive admin management capabilities.
