# Chapter 4: System Design

## 4.1. System Architecture Overview

EmpowerWork is a three-tier web application built with FastAPI (backend), React (frontend), and MySQL database:

```
┌─────────────────────┐
│   Frontend (React)  │  
│  - SPA with Vite   │  
│  - Tailwind CSS    │  
│  - Dark Mode       │  
└─────────────────────┘
          │ HTTP/REST (Axios)
          ▼
┌─────────────────────────────────────┐
│    API Layer (FastAPI)              │
│  - 7 route modules                  │
│  - CORS, Rate Limiting              │
│  - Authentication & Authorization   │
└─────────────────────────────────────┘
          │ SQLAlchemy ORM
          ▼
┌─────────────────────┐
│  Data Layer (MySQL) │  
│  - 12 entities      │  
│  - 4 association    │  
│    tables           │  
└─────────────────────┘
```

---

## 4.2. Component Architecture

### Backend Modules

```
backend/src/
├── main.py              # FastAPI app entry point
├── config.py            # Configuration
├── db/
│   ├── database.py      # SQLAlchemy connection
│   └── models.py        # 12 data models + associations
├── routes/
│   ├── users.py         # User CRUD, registration
│   ├── jobs.py          # Job search, listing
│   ├── applications.py  # CV upload, application tracking
│   ├── chat.py          # RAG chatbot endpoint
│   ├── disabilities.py  # Disability management
│   ├── tools.py         # Assistive tools
│   ├── companies.py     # Company CRUD
│   └── security.py      # Security monitoring
├── rag/
│   ├── rag_chat.py      # Groq API integration
│   ├── embedder.py      # Text embeddings (optional)
│   └── retriever.py     # Vector search (optional)
├── middleware/
│   └── security_middleware.py
└── utils/
    ├── security.py              # Validation, sanitization, rate limiting
    ├── search_intelligence.py   # Job matching, filtering, relevance scoring
    └── pdf_extractor.py         # CV text extraction
```

### Frontend Structure

```
frontend/src/
├── App.jsx              # Main app, routing
├── main.jsx             # Entry point
├── context/
│   └── AuthContext.jsx  # User auth state (localStorage)
├── api/
│   └── api.js           # Axios instance, HTTP client
├── components/          # 10 reusable components
│   ├── Navbar.jsx       # Navigation, auth UI
│   ├── Footer.jsx       # Footer
│   ├── JobCard.jsx      # Job card display
│   ├── JobForm.jsx      # Admin job creation
│   ├── UserForm.jsx     # Profile edit form
│   ├── ApplicationModal.jsx   # CV upload & manual entry
│   ├── ChatBox.jsx      # Chatbot interface
│   ├── Table.jsx        # Admin CRUD tables
│   └── AccessibilityControls.jsx  # Accessibility settings
├── pages/               # 15 page components
│   ├── Home.jsx         # Job search & listing
│   ├── Profile.jsx      # User profile
│   ├── Chat.jsx         # Chatbot page
│   ├── Tools.jsx        # Assistive tools
│   ├── Register.jsx     # User registration
│   ├── Login.jsx        # User login
│   └── Admin*.jsx       # 7 admin pages
└── utils/               # Utilities
```

---

## 4.3. Data Flow Diagrams (DFD)

### 4.3.1. DFD Level 0 (Context Diagram)

```mermaid
graph LR
    JobSeeker["Job Seeker<br/>(User with Disability)"]
    Admin["Administrator"]
    System["EmpowerWork<br/>System"]
    External["External APIs<br/>(Groq, OpenAI)"]
    
    JobSeeker -->|Search, Apply,<br/>Chat| System
    System -->|Job Recommendations<br/>Assistive Tools| JobSeeker
    
    Admin -->|Manage Users,<br/>Jobs, Applications| System
    System -->|Dashboard, Reports<br/>Security Logs| Admin
    
    System -->|API Requests<br/>Embeddings, LLM| External
    External -->|AI Responses<br/>Embeddings| System
    
    style System fill:#3B82F6,color:#fff
    style JobSeeker fill:#10B981,color:#fff
    style Admin fill:#F59E0B,color:#fff
    style External fill:#8B5CF6,color:#fff
```

---

### 4.3.2. DFD Level 1 (Process & Data Flows)

#### Main Data Flow: User Registration

```mermaid
graph TD
    User["User<br/>Frontend"]
    API["FastAPI<br/>Backend"]
    Auth["Auth<br/>Process"]
    Validate["Input<br/>Validation"]
    HashPwd["Password<br/>Hashing"]
    FileStore["File<br/>Storage"]
    DB["MySQL<br/>Database"]
    
    User -->|Registration Form<br/>Email, Password, Photo| API
    API -->|Rate Limit<br/>Check| Auth
    Auth -->|Email, Name,<br/>Phone Validation| Validate
    Validate -->|Sanitize &<br/>Normalize| HashPwd
    HashPwd -->|Bcrypt<br/>Hash| DB
    API -->|Save Profile<br/>Photo| FileStore
    API -->|Insert User,<br/>Disabilities, Skills| DB
    DB -->|Return User<br/>ID, Confirmation| API
    API -->|Success Message<br/>Redirect to Login| User
    
    style User fill:#10B981,color:#fff
    style API fill:#3B82F6,color:#fff
    style DB fill:#EF4444,color:#fff
```

#### Main Data Flow: Job Search & Matching

```mermaid
graph TD
    User["User<br/>Frontend"]
    API["FastAPI<br/>Backend"]
    Security["Security<br/>Validation"]
    Search["Search<br/>Intelligence"]
    DB["Database<br/>Query"]
    Ranking["Relevance<br/>Scoring"]
    Results["Paginated<br/>Results"]
    
    User -->|Search Query<br/>Filters| API
    API -->|Validate Input<br/>User ID| Security
    Security -->|Extract Keywords<br/>Synonyms| Search
    Search -->|Multi-Criteria<br/>Filter| DB
    DB -->|Jobs Matching<br/>Disabilities, Skills| Ranking
    Ranking -->|Relevance Score<br/>0.0-1.0| Results
    Results -->|Top 20 Jobs<br/>Pagination Info| API
    API -->|Display Results<br/>Cards, Filters| User
    
    style User fill:#10B981,color:#fff
    style API fill:#3B82F6,color:#fff
    style DB fill:#EF4444,color:#fff
```

#### Main Data Flow: Job Application with CV

```mermaid
graph TD
    User["User<br/>Frontend"]
    API["FastAPI<br/>Backend"]
    RateLimit["Rate<br/>Limit"]
    Validate["Validation"]
    FileStore["CV File<br/>Storage"]
    PDFExtract["PDF Text<br/>Extraction"]
    Parse["Parse<br/>Structured Info"]
    DB["Save to<br/>Database"]
    Admin["Admin<br/>Dashboard"]
    
    User -->|Job ID, CV PDF<br/>Cover Letter| API
    API -->|Check Rate<br/>Limit| RateLimit
    RateLimit -->|Validate Job,<br/>User IDs| Validate
    Validate -->|Save CV to<br/>uploads/cvs/| FileStore
    FileStore -->|Extract Text<br/>PyPDF2| PDFExtract
    PDFExtract -->|Parse Name, Email<br/>Phone, Skills, Exp| Parse
    Parse -->|Serialize to<br/>JSON String| DB
    DB -->|Insert Job_Application<br/>Status: pending| API
    API -->|Success, App ID| User
    User -->|Notify User<br/>Applied| User
    DB -->|Pending App<br/>Notification| Admin
    
    style User fill:#10B981,color:#fff
    style API fill:#3B82F6,color:#fff
    style DB fill:#EF4444,color:#fff
    style Admin fill:#F59E0B,color:#fff
```

#### Main Data Flow: Chatbot Interaction

```mermaid
graph TD
    User["User<br/>Frontend"]
    Chat["Chat<br/>Endpoint"]
    RateLimit["Rate Limit<br/>20/60s"]
    LoadUser["Load User<br/>Profile"]
    LoadJobs["Load Jobs<br/>Up to 50"]
    Filter["Filter Jobs<br/>by User"]
    Context["Build<br/>Prompt Context"]
    Groq["Groq LLM<br/>API Call"]
    Format["Format<br/>Response"]
    Return["Return to<br/>User"]
    
    User -->|Message<br/>User ID| Chat
    Chat -->|Check Rate<br/>Limit| RateLimit
    RateLimit -->|Load Disabilities<br/>Skills| LoadUser
    LoadUser -->|Query All<br/>Jobs| LoadJobs
    LoadJobs -->|Filter Relevant<br/>Jobs| Filter
    Filter -->|Build System Prompt<br/>+ Context| Context
    Context -->|Top 5 Jobs<br/>Format| Groq
    Groq -->|AI Response<br/>0.7 temp| Format
    Format -->|Remove Emojis<br/>≤100 words| Return
    Return -->|Display in<br/>Chat UI| User
    
    style User fill:#10B981,color:#fff
    style Chat fill:#3B82F6,color:#fff
    style Groq fill:#8B5CF6,color:#fff
```

---

## 4.4. State Diagrams

### 4.4.1. Job Application State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: User submits application
    
    Pending --> UnderReview: Admin opens application
    
    UnderReview --> Approved: Admin clicks Approve
    UnderReview --> Rejected: Admin clicks Reject
    
    Approved --> [*]: Final state
    Rejected --> [*]: Final state
    
    note right of Pending
        Default status
        Waiting for admin review
    end note
    
    note right of UnderReview
        Admin is reviewing
        CV & cover letter
    end note
    
    note right of Approved
        User application
        accepted by company
    end note
    
    note right of Rejected
        Admin rejected
        application with notes
    end note
```

### 4.4.2. User Session State Machine

```mermaid
stateDiagram-v2
    [*] --> LoggedOut: Initial state
    
    LoggedOut --> Authenticating: User/Admin login form submit
    
    Authenticating --> LoggedIn_User: Valid user credentials
    Authenticating --> LoggedIn_Admin: Valid admin credentials
    Authenticating --> LoggedOut: Invalid credentials or rate limited
    
    LoggedIn_User --> LoggedOut: User logs out
    LoggedIn_Admin --> LoggedOut: Admin logs out
    
    note right of LoggedOut
        No active session
        Can access: Login, Register, Home
    end note
    
    note right of Authenticating
        Checking email/password
        Verifying rate limit
    end note
    
    note right of LoggedIn_User
        User session active
        Can: Search, Apply, Chat, Tools
    end note
    
    note right of LoggedIn_Admin
        Admin session active
        Can: Dashboard, CRUD all entities
    end note
```

### 4.4.3. Job Search Filter State

```mermaid
stateDiagram-v2
    [*] --> NoFilter: User opens job search
    
    NoFilter --> FilterSet: User selects filters
    FilterSet --> Searching: Query jobs
    Searching --> ResultsDisplay: Show matching jobs
    
    ResultsDisplay --> NoFilter: Clear filters
    ResultsDisplay --> FilterSet: Modify filters
    ResultsDisplay --> ViewJobDetail: Click job card
    
    ViewJobDetail --> ResultsDisplay: Back to results
    ViewJobDetail --> ApplyModal: Click Apply
    
    ApplyModal --> ResultsDisplay: Cancel application
    ApplyModal --> Applying: Submit application
    
    Applying --> ResultsDisplay: Application submitted
    Applying --> ResultsDisplay: Application error
    
    note right of ResultsDisplay
        Display jobs with
        relevance scores,
        pagination
    end note
```

---

## 4.5. Use Case Diagrams

### 4.5.1. Job Seeker Use Cases

```mermaid
graph TB
    JobSeeker["🧑 Job Seeker"]
    
    JobSeeker -->|UC-1| Register["Register Account<br/>+ Disabilities, Skills"]
    JobSeeker -->|UC-2| Login["Login"]
    JobSeeker -->|UC-3| Profile["View/Edit Profile"]
    
    JobSeeker -->|UC-4| Search["Search Jobs<br/>Intelligent Filtering"]
    JobSeeker -->|UC-5| View["View Job Details"]
    
    JobSeeker -->|UC-6| ApplyCv["Apply with CV<br/>PDF Upload"]
    JobSeeker -->|UC-7| ApplyManual["Apply Manual Entry<br/>No CV"]
    
    JobSeeker -->|UC-8| ViewApps["View Applications<br/>History & Status"]
    
    JobSeeker -->|UC-9| Chat["Chat AI Assistant<br/>Job Recommendations"]
    
    JobSeeker -->|UC-10| Tools["Browse Assistive Tools<br/>Filter by Disability"]
    
    JobSeeker -->|UC-11| Accessibility["Configure Accessibility<br/>Font, Contrast, Motion"]
    
    style JobSeeker fill:#10B981,color:#fff
    style Register fill:#3B82F6,color:#fff
    style Search fill:#3B82F6,color:#fff
    style ApplyCv fill:#3B82F6,color:#fff
    style Chat fill:#3B82F6,color:#fff
    style Tools fill:#3B82F6,color:#fff
    style Accessibility fill:#3B82F6,color:#fff
```

### 4.5.2. Administrator Use Cases

```mermaid
graph TB
    Admin["👨‍💼 Administrator"]
    
    Admin -->|UC-12| AdminLogin["Admin Login"]
    
    Admin -->|UC-13| Dashboard["View Dashboard<br/>Statistics"]
    
    Admin -->|UC-14| ManageUsers["Manage Users<br/>CRUD + Pagination"]
    Admin -->|UC-15| ManageJobs["Manage Jobs<br/>CRUD, Associate"]
    Admin -->|UC-16| ManageCompanies["Manage Companies<br/>CRUD"]
    Admin -->|UC-17| ManageDis["Manage Disabilities<br/>CRUD, Safety Check"]
    Admin -->|UC-18| ManageTools["Manage Assistive Tools<br/>CRUD"]
    
    Admin -->|UC-19| Review["Review Applications<br/>Approve/Reject + Notes"]
    
    Admin -->|UC-20| ViewLogs["View Security Logs<br/>Filter by Severity"]
    
    style Admin fill:#F59E0B,color:#fff
    style AdminLogin fill:#3B82F6,color:#fff
    style Dashboard fill:#3B82F6,color:#fff
    style ManageUsers fill:#3B82F6,color:#fff
    style Review fill:#3B82F6,color:#fff
```

### 4.5.3. System Use Cases

```mermaid
graph TB
    System["🔧 EmpowerWork System"]
    
    System -->|UC-21| ValidateInput["Validate & Sanitize<br/>All User Input"]
    System -->|UC-22| HashPwd["Hash Passwords<br/>Bcrypt ≥12 rounds"]
    System -->|UC-23| RateLimit["Implement Rate Limiting<br/>By Endpoint"]
    
    System -->|UC-24| Match["Intelligent Job Matching<br/>Disability Prioritization"]
    System -->|UC-25| Score["Calculate Relevance Scores<br/>0.0-1.0"]
    System -->|UC-26| Search["Synonym Matching<br/>Fuzzy Search"]
    
    System -->|UC-27| ExtractCV["Extract CV Info<br/>PyPDF2"]
    System -->|UC-28| StoreFiles["Store Files<br/>uploads/ directory"]
    
    System -->|UC-29| IntegrateRAG["Integrate Groq API<br/>RAG Chatbot"]
    System -->|UC-30| ContextBuild["Build Prompt Context<br/>User + Jobs"]
    System -->|UC-31| FormatResponse["Format AI Response<br/>Sanitize & Limit"]
    
    System -->|UC-32| LogEvents["Log Security Events<br/>Threats & Actions"]
    System -->|UC-33| Monitor["Monitor Performance<br/>Query Times"]
    
    style System fill:#8B5CF6,color:#fff
    style ValidateInput fill:#3B82F6,color:#fff
    style Match fill:#3B82F6,color:#fff
    style IntegrateRAG fill:#3B82F6,color:#fff
```

---

## 4.6. User Interface Design

### 4.6.1. Design System

#### Color Palette

**Light Mode:**
- Primary: `#3B82F6` (Blue)
- Secondary: `#F68E3C` (Orange)
- Accent: `#21978C` (Teal)
- Background: `#FFFFFF` (White)
- Text: `#111827` (Gray-900)
- Border: `#E5E7EB` (Gray-200)

**Dark Mode:**
- Primary: `#60A5FA` (Blue-400)
- Secondary: `#FB923C` (Orange-400)
- Accent: `#14B8A6` (Teal-400)
- Background: `#111827` (Gray-900)
- Text: `#F3F4F6` (Gray-100)
- Border: `#374151` (Gray-700)

**High Contrast Mode:**
- Background: `#000000` (Black)
- Text: `#FFFFFF` (White)
- Accent: `#FFFF00` (Yellow)

#### Typography

- **Heading XL:** Inter Bold 32px, line-height 1.2
- **Heading L:** Inter Bold 24px, line-height 1.3
- **Heading M:** Inter Bold 18px, line-height 1.4
- **Body Large:** Inter Regular 16px, line-height 1.5
- **Body Regular:** Inter Regular 14px, line-height 1.6
- **Small:** Inter Regular 12px, line-height 1.5

#### Spacing

- Base unit: 4px (Tailwind: 1 = 4px)
- Padding: 4, 8, 12, 16, 20, 24, 28, 32px
- Margin: Same scale

#### Responsive Breakpoints

| Device | Width | Columns | Layout |
|--------|-------|---------|--------|
| Mobile | < 640px | 1 | Stack, hamburger menu |
| Tablet | 640-1024px | 2 | Side-by-side, simplified nav |
| Desktop | > 1024px | 3-4 | Full layout, sidebar |

---

### 4.6.2. Page Layouts

#### Page: Login

```
┌─────────────────────────────────────┐
│  NAVBAR: Logo | Dark Mode           │
├─────────────────────────────────────┤
│                                      │
│           ┌──────────────────┐       │
│           │  EmpowerWork     │       │
│           │     LOGIN        │       │
│           │                  │       │
│           │ Login Type:      │       │
│           │ [User ▼]         │       │
│           │                  │       │
│           │ Email:           │       │
│           │ [____________]   │       │
│           │                  │       │
│           │ Password:        │       │
│           │ [____________]   │       │
│           │                  │       │
│           │ [Remember me ☐]  │       │
│           │                  │       │
│           │ [Login Button]   │       │
│           │ [Register Link]  │       │
│           └──────────────────┘       │
│                                      │
├─────────────────────────────────────┤
│  FOOTER: © 2025 | Contact | Privacy │
└─────────────────────────────────────┘
```

#### Page: Home (Job Search & Listing)

```
┌──────────────────────────────────────────────┐
│ NAVBAR: Logo | Search | Profile | Chat | Logout
├──────────────────────────────────────────────┤
│                                               │
│ Search: [________________] [🔍 Search]      │
│                                               │
│ [☰ Filters] [Disability ▼] [Skill ▼]       │
│             [Type ▼] [Remote ▼]            │
│                                               │
│ Results: 42 jobs found                       │
│                                               │
│ ┌──────────────┐ ┌──────────────┐           │
│ │ Job Card     │ │ Job Card     │           │
│ │ ┌──────────┐ │ │ ┌──────────┐ │           │
│ │ │ [Logo]   │ │ │ │ [Logo]   │ │           │
│ │ ├──────────┤ │ │ ├──────────┤ │           │
│ │ │ Title    │ │ │ │ Title    │ │           │
│ │ │ Company  │ │ │ │ Company  │ │           │
│ │ │ Location │ │ │ │ Location │ │           │
│ │ │ Score:95%│ │ │ │ Score:88%│ │           │
│ │ │ [Apply]  │ │ │ │ [Apply]  │ │           │
│ │ └──────────┘ │ │ └──────────┘ │           │
│ └──────────────┘ └──────────────┘           │
│                                               │
│ [◀ Prev] [1] [2] [3] [▶ Next]               │
│                                               │
├──────────────────────────────────────────────┤
│ FOOTER                                        │
└──────────────────────────────────────────────┘
```

#### Page: Profile

```
┌──────────────────────────────────────────────┐
│ NAVBAR: Logo | Search | Profile | Chat | Logout
├──────────────────────────────────────────────┤
│                                               │
│ ┌──────────────────┐  ┌──────────────────┐  │
│ │ PROFILE INFO     │  │ MY APPLICATIONS  │  │
│ ├──────────────────┤  ├──────────────────┤  │
│ │                  │  │                  │  │
│ │ [Profile Photo]  │  │ • Software Dev   │  │
│ │ ┌──────────────┐ │  │   Status: Applied│  │
│ │ │              │ │  │   📝 View        │  │
│ │ │    [100x100] │ │  │                  │  │
│ │ │              │ │  │ • Designer       │  │
│ │ └──────────────┘ │  │   Status: Approved│ │
│ │ [Change Photo]   │  │   ✓ View        │  │
│ │                  │  │                  │  │
│ │ Name: John Doe   │  │ • Manager        │  │
│ │ Email: john@...  │  │   Status: Rejected│ │
│ │ Phone: +1...     │  │   ✗ View        │  │
│ │                  │  │                  │  │
│ │ [Edit Profile]   │  │ [View More...]   │  │
│ │                  │  │                  │  │
│ │ Disabilities:    │  │                  │  │
│ │ [Visual ✕] [Mobility ✕]              │  │
│ │                  │  │                  │  │
│ │ Skills:          │  │                  │  │
│ │ [Python ✕] [React ✕]                 │  │
│ │                  │  │                  │  │
│ │ [Add Skills...]  │  │                  │  │
│ │                  │  │                  │  │
│ └──────────────────┘  └──────────────────┘  │
│                                               │
├──────────────────────────────────────────────┤
│ FOOTER                                        │
└──────────────────────────────────────────────┘
```

#### Page: Chat (Chatbot)

```
┌──────────────────────────────────────────────┐
│ NAVBAR: Logo | Search | Profile | Chat | Logout
├──────────────────────────────────────────────┤
│                                               │
│ ┌────────────────────────────────────────┐   │
│ │ 🤖 EmpowerWork Job Assistant          │   │
│ ├────────────────────────────────────────┤   │
│ │                                         │   │
│ │ Assistant: Hello! 👋 I'm here to help │   │
│ │ you find jobs. Tell me what you're    │   │
│ │ looking for!                          │   │
│ │                                         │   │
│ │                                         │   │
│ │ You: I want remote jobs with good     │   │
│ │ accessibility for screen readers      │   │
│ │                                         │   │
│ │                                         │   │
│ │ Assistant: Great! I found 3 remote    │   │
│ │ jobs perfect for you:                 │   │
│ │                                         │   │
│ │ • Software Engineer - TechCorp        │   │
│ │   (PERFECT MATCH - screen reader)     │   │
│ │   Salary: $100k-120k                  │   │
│ │   [View Job] [Apply]                  │   │
│ │                                         │   │
│ │ • QA Analyst - DataInc                │   │
│ │   (Remote, flexible schedule)         │   │
│ │   [View Job] [Apply]                  │   │
│ │                                         │   │
│ │ [Type message...]         [Send]      │   │
│ │                                         │   │
│ └────────────────────────────────────────┘   │
│                                               │
├──────────────────────────────────────────────┤
│ FOOTER                                        │
└──────────────────────────────────────────────┘
```

#### Modal: Job Application (CV Upload)

```
┌────────────────────────────────────────────────┐
│ Apply for: Software Engineer at TechCorp  [✕]  │
├────────────────────────────────────────────────┤
│                                                 │
│ METHOD: [CV Upload] [Manual Entry]            │
│                                                 │
│ CV Upload:                                     │
│ ┌──────────────────────────────────────────┐  │
│ │ [Choose File] (PDF, max 5MB)             │  │
│ │ No file chosen                           │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ Cover Letter (Optional):                       │
│ ┌──────────────────────────────────────────┐  │
│ │                                          │  │
│ │                                          │  │
│ │ [_______________________________]        │  │
│ │ Max 2000 characters (0/2000)             │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ [Cancel] [Submit Application]                 │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ METHOD: [CV Upload] [Manual Entry]            │
│                                                 │
│ Manual Entry:                                  │
│ ┌──────────────────────────────────────────┐  │
│ │ Name: [John Doe (prefilled)]             │  │
│ │ Email: [john@email.com (prefilled)]      │  │
│ │ Phone: [+1-555-... (prefilled)]          │  │
│ │                                          │  │
│ │ Skills:                                  │  │
│ │ [Python, React, SQL (prefilled)]         │  │
│ │                                          │  │
│ │ Years of Experience:                     │  │
│ │ [5 years]                                │  │
│ │                                          │  │
│ │ Education:                               │  │
│ │ [Bachelor's in CS, University of...]     │  │
│ │ [____________________________________________]  │
│ │                                          │  │
│ │ [Cancel] [Submit Application]            │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
└────────────────────────────────────────────────┘
```

#### Page: Admin Dashboard

```
┌────────────────────────────────────────────────┐
│ NAVBAR: EmpowerWork | [Dashboard] [Users] [Jobs]
│         [Companies] [Applications] [Logout]
├────────────────────────────────────────────────┤
│                                                 │
│ DASHBOARD: Admin Overview                      │
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ USERS    │ │ JOBS     │ │ APPS     │        │
│ │   245    │ │   68     │ │   34     │        │
│ │ 📈 +12%  │ │ 📈 +5%   │ │ 🔔 12    │        │
│ │          │ │          │ │ Pending  │        │
│ └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │COMPANIES │ │APPROVALS │ │ SECURITIES        │
│ │   18     │ │   52     │ │Threats: 3        │
│ │ 📈 +2%   │ │ 📈 +8%   │ │⚠️  Investigate   │
│ │          │ │          │ │                  │
│ └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│ Recent Activity:                                │
│ ┌────────────────────────────────────────────┐ │
│ │ • User registered: Alice Johnson            │ │
│ │ • Application submitted: Job #42            │ │
│ │ • Job created: Data Scientist @ CloudCorp  │ │
│ │ • Security Alert: Failed login (3x)        │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
├────────────────────────────────────────────────┤
│ FOOTER                                          │
└────────────────────────────────────────────────┘
```

#### Page: Admin Users (CRUD Table)

```
┌────────────────────────────────────────────────┐
│ NAVBAR: ... [Users] ...                        │
├────────────────────────────────────────────────┤
│                                                 │
│ USERS MANAGEMENT                              │
│                                                 │
│ [+ New User] [🔍 Search] [Filter ▼]           │
│                                                 │
│ ┌────────────────────────────────────────────┐ │
│ │ ID │ Name      │ Email      │ Type │ Actions│ │
│ ├────────────────────────────────────────────┤ │
│ │ 1  │ John Doe  │ john@email  │ User │ View  │ │
│ │    │           │            │      │ Edit  │ │
│ │    │           │            │      │ Delete│ │
│ ├────────────────────────────────────────────┤ │
│ │ 2  │ Jane Smith│ jane@email  │ Admin│ View  │ │
│ │    │           │            │      │ Edit  │ │
│ │    │           │            │      │ Delete│ │
│ ├────────────────────────────────────────────┤ │
│ │ 3  │ Bob Jones │ bob@email   │ User │ View  │ │
│ │    │           │            │      │ Edit  │ │
│ │    │           │            │      │ Delete│ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ Showing 1-3 of 245 users                       │
│ [◀ Prev] [1] [2] [3]...[82] [Next ▶]          │
│                                                 │
├────────────────────────────────────────────────┤
│ FOOTER                                          │
└────────────────────────────────────────────────┘
```

#### Page: Admin Application Review

```
┌────────────────────────────────────────────────┐
│ NAVBAR: ... [Applications] ...                 │
├────────────────────────────────────────────────┤
│                                                 │
│ PENDING APPLICATIONS (12)                      │
│                                                 │
│ ┌────────────────────────────────────────────┐ │
│ │ Job: Software Engineer @ TechCorp          │ │
│ │ Applicant: John Doe (john@email)           │ │
│ │ Applied: Dec 15, 2025                      │ │
│ │                                            │ │
│ │ CV:                                        │ │
│ │ ┌────────────────────────────────────────┐ │
│ │ │ [PDF Preview]                          │ │
│ │ │ Name: John Doe                         │ │
│ │ │ Email: john@email.com                  │ │
│ │ │ Phone: +1-555-1234                     │ │
│ │ │ Skills: Python, React, AWS             │ │
│ │ │ Experience: 5 years at TechCo          │ │
│ │ │ Education: BS Computer Science         │ │
│ │ └────────────────────────────────────────┘ │ │
│ │                                            │ │
│ │ Cover Letter:                              │ │
│ │ "I'm excited to apply for this role..."   │ │
│ │                                            │ │
│ │ Admin Notes:                               │ │
│ │ ┌────────────────────────────────────────┐ │
│ │ │ [Excellent candidate, strong skills]   │ │
│ │ └────────────────────────────────────────┘ │ │
│ │                                            │ │
│ │ [Approve] [Reject] [Cancel]                │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
├────────────────────────────────────────────────┤
│ FOOTER                                          │
└────────────────────────────────────────────────┘
```

---

### 4.6.3. Component Hierarchy

```mermaid
graph TD
    App["App<br/>(Router, AuthProvider)"]
    
    App --> Navbar["Navbar<br/>(Logo, Search, Menu, Dark Mode)"]
    App --> Routes["Routes<br/>(PrivateRoute, AdminRoute)"]
    App --> Footer["Footer<br/>(Links, Copyright)"]
    App --> Accessibility["AccessibilityControls<br/>(Font, Contrast, Motion)"]
    
    Routes --> Home["Home<br/>(Job Search & Listing)"]
    Routes --> Login["Login<br/>(Auth Form)"]
    Routes --> Register["Register<br/>(User Registration)"]
    Routes --> Profile["Profile<br/>(User Profile)"]
    Routes --> Chat["Chat<br/>(Chatbot)"]
    Routes --> Tools["Tools<br/>(Assistive Tools)"]
    Routes --> AdminDash["AdminDashboard<br/>(Overview)"]
    Routes --> AdminUsers["AdminUsers<br/>(CRUD Table)"]
    Routes --> AdminJobs["AdminJobs<br/>(CRUD Table)"]
    Routes --> AdminApps["AdminApplications<br/>(Review)"]
    
    Home --> JobCard["JobCard<br/>(Display)"]
    Home --> ApplicationModal["ApplicationModal<br/>(CV/Manual)"]
    
    Profile --> UserForm["UserForm<br/>(Edit Profile)"]
    
    Chat --> ChatBox["ChatBox<br/>(Messages)"]
    
    AdminUsers --> Table["Table<br/>(Reusable CRUD)"]
    AdminJobs --> Table
    AdminApps --> Table
    
    UserForm --> FileUpload["File Upload<br/>(Profile Photo)"]
    ApplicationModal --> FileUpload
    
    style App fill:#3B82F6,color:#fff
    style Navbar fill:#60A5FA,color:#fff
    style Home fill:#10B981,color:#fff
    style Chat fill:#8B5CF6,color:#fff
    style AdminDash fill:#F59E0B,color:#fff
```

---

### 4.6.4. Accessibility Features

**Implemented in React:**

| Feature | Implementation | Benefit |
|---------|---|---|
| **Dark/Light Mode** | localStorage, CSS classes, tailwind dark: | Reduces eye strain, supports WCAG contrast |
| **Font Size Adjustment** | CSS variable `--font-scale: 0.75-1.5` | Aids users with low vision |
| **High Contrast Mode** | Class toggle, black/white/yellow palette | Improves readability for color-blind users |
| **Reduced Motion** | `prefers-reduced-motion`, disable animations | Helps users with vestibular disorders |
| **Keyboard Navigation** | tabindex, focus indicators, ARIA labels | Supports keyboard-only users |
| **Skip Link** | `sr-only` component with focus:not-sr-only | Jump to main content |
| **Screen Reader Support** | ARIA labels, semantic HTML, ARIA roles | Works with assistive technology |
| **Responsive Design** | Mobile-first, 3 breakpoints | Accessible on all devices |
| **Form Labels** | `<label htmlFor="id">` patterns | Screen reader association |
| **Error Messages** | Semantic, descriptive, ARIA live regions | Clear feedback for accessibility tools |

**WCAG AA Compliance Checklist:**

- ✅ 1.4.3 Contrast (Min) – 4.5:1 for normal text, 3:1 for large text
- ✅ 2.1.1 Keyboard – All functionality available via keyboard
- ✅ 2.1.2 No Keyboard Trap – User can exit any element with keyboard
- ✅ 2.4.3 Focus Order – Logical focus order
- ✅ 2.4.7 Focus Visible – Visible focus indicator on all interactive elements
- ✅ 3.2.4 Consistent Identification – Components behave consistently
- ✅ 4.1.3 Status Messages – ARIA live regions for dynamic updates
- ✅ 3.3.1 Error Identification – Clear error messages and recovery options

---

### 4.6.5. Responsive Design Examples

#### Breakpoint: Mobile (< 640px)

```
Single Column Layout
┌─────────────┐
│   Navbar    │
├─────────────┤
│             │
│ Content     │
│ (Full Width)│
│             │
│             │
├─────────────┤
│   Footer    │
└─────────────┘

Grid: 1 column
Padding: 12px
Cards: Full width
Navigation: Hamburger menu
```

#### Breakpoint: Tablet (640-1024px)

```
Two Column Layout
┌─────────────────────────────┐
│   Navbar (Simplified)       │
├──────────────┬──────────────┤
│              │              │
│  Sidebar     │  Content     │
│              │              │
│              │              │
├──────────────┴──────────────┤
│   Footer                     │
└─────────────────────────────┘

Grid: 2 columns
Padding: 16px
Cards: Side-by-side
Navigation: Simplified menu
```

#### Breakpoint: Desktop (> 1024px)

```
Three+ Column Layout
┌──────────────────────────────────┐
│   Navbar (Full)                  │
├──────────┬──────────┬────────────┤
│          │          │            │
│ Sidebar  │ Main     │ Secondary  │
│          │ Content  │ Content    │
│          │          │            │
├──────────┴──────────┴────────────┤
│   Footer                         │
└──────────────────────────────────┘

Grid: 3-4 columns
Padding: 20-24px
Cards: Multiple per row
Navigation: Full menu + sidebar
```

---

### 4.6.6. Component API Examples

#### JobCard Component

```jsx
<JobCard
  jobId={42}
  title="Senior React Developer"
  company="TechCorp"
  location="Remote"
  relevanceScore={0.95}
  disabilities={["Visual", "Mobility"]}
  employmentType="full-time"
  remoteType="remote"
  onApply={() => openApplicationModal(42)}
/>
```

#### ApplicationModal Component

```jsx
<ApplicationModal
  jobId={42}
  jobTitle="Senior React Developer"
  userId={user.id}
  userEmail={user.email}
  onClose={() => setModalOpen(false)}
  onSuccess={() => {
    refetchApplications();
    setModalOpen(false);
  }}
/>
```

#### ChatBox Component

```jsx
<ChatBox
  userId={user.id}
  onSendMessage={async (message) => {
    const response = await api.post('/chat/', {
      user_id: userId,
      message: message
    });
    return response.data.response;
  }}
/>
```

---

## 4.7. Database Schema Summary

### Entity Relationships

```mermaid
graph LR
    User["User<br/>(245 records)"]
    Disability["Disability<br/>(25+ types)"]
    Skill["Skill<br/>(100+ skills)"]
    Job["Job<br/>(68 listings)"]
    Company["Company<br/>(18 companies)"]
    Location["Location"]
    JobApplication["JobApplication<br/>(34 pending)"]
    AssistiveTool["AssistiveTool<br/>(24+ tools)"]
    
    User -->|many-to-many| Disability
    User -->|many-to-many| Skill
    User -->|one-to-many| JobApplication
    
    Job -->|many-to-many| Disability
    Job -->|one-to-many| JobApplication
    Job -->|many-to-one| Company
    Job -->|many-to-one| Location
    
    Disability -->|many-to-many| AssistiveTool
    
    JobApplication -->|many-to-one| User
    
    style User fill:#10B981,color:#fff
    style Job fill:#3B82F6,color:#fff
    style Disability fill:#F59E0B,color:#fff
    style JobApplication fill:#8B5CF6,color:#fff
```

---

## 4.8. Security & Validation Rules

### Input Validation Pipeline

```mermaid
graph TD
    Input["Raw User<br/>Input"]
    Sanitize["Sanitize<br/>(Remove <,>,&,etc)"]
    Validate["Validate<br/>(Format, Length)"]
    Transform["Transform<br/>(Normalize Case)"]
    Check["Rate Limit<br/>Check"]
    DB["Safe for<br/>Database"]
    
    Input -->|strip tags| Sanitize
    Sanitize -->|regex match| Validate
    Validate -->|lowercase/trim| Transform
    Transform -->|IP, endpoint| Check
    Check -->|threshold OK| DB
    Check -->|BLOCKED| Error["429 Too Many<br/>Requests"]
    
    style Input fill:#EF4444,color:#fff
    style Sanitize fill:#F59E0B,color:#fff
    style Validate fill:#F59E0B,color:#fff
    style DB fill:#10B981,color:#fff
    style Error fill:#EF4444,color:#fff
```

### Rate Limiting Strategy

| Endpoint | Method | Limit | Window |
|----------|--------|-------|--------|
| /users/add_user | POST | 5 | 5 min (300s) |
| /users/login | POST | 5 | 5 min |
| /applications/apply | POST | 10 | 5 min |
| /chat | POST | 20 | 60 sec |
| /jobs/search_jobs | POST | 30 | 1 min |

---

## 4.9. Performance Optimization

### Query Optimization

```python
# ❌ Bad: N+1 Query Problem
jobs = db.query(models.Job).all()
for job in jobs:
    disabilities = job.disabilities  # Extra query per job!

# ✅ Good: Eager Loading
jobs = db.query(models.Job).options(
    selectinload(models.Job.disabilities)
).all()
```

### Database Indexing

```sql
-- Frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_job_company_id ON jobs(company_id);
CREATE INDEX idx_app_job_id ON job_applications(job_id);
CREATE INDEX idx_app_user_id ON job_applications(user_id);
CREATE INDEX idx_app_status ON job_applications(status);
```

---

## Summary

Chapter 4 provides complete system design documentation including:

1. **DFD Level 0 & 1** – Context and detailed data flows (Mermaid)
2. **State Diagrams** – Application, session, and search filter states (Mermaid)
3. **Use Case Diagrams** – Job seeker, admin, and system use cases (Mermaid)
4. **UI Design** – 8 detailed page layouts, component hierarchy, accessibility features
5. **Database Schema** – Entity relationships and optimization strategies
6. **Security** – Input validation, sanitization, rate limiting
7. **Performance** – Query optimization, indexing, eager loading

All diagrams are implemented in Mermaid format for easy rendering in GitHub, Markdown, and documentation tools.
