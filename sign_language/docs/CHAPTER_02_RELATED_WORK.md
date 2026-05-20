# Chapter 2: Related Work

## 2.1. Related Articles

### 2.1.1. Employment Challenges for People with Disabilities

Research indicates that people with disabilities face significant barriers in the job market. According to studies, the unemployment rate for people with disabilities is approximately twice that of people without disabilities. Key challenges include:

- **Lack of Accessible Job Platforms**: Most job search platforms do not adequately filter or highlight jobs that accommodate specific disabilities
- **Limited Disability-Aware Matching**: Traditional job matching algorithms do not consider disability accommodations as a primary factor
- **Information Accessibility**: Job descriptions often lack clear information about workplace accommodations and accessibility features

### 2.1.2. AI-Powered Job Matching Systems

Recent research in AI-powered job matching has shown that incorporating user context, skills, and preferences significantly improves match quality. Studies on Retrieval-Augmented Generation (RAG) systems demonstrate that combining semantic search with large language models provides more accurate and contextually relevant recommendations.

Key findings from related research:
- **Semantic Search**: Vector embeddings improve job matching accuracy by understanding job requirements and user profiles semantically
- **Context-Aware Recommendations**: Systems that consider user history and preferences show higher user satisfaction
- **Accessibility in AI Systems**: Research emphasizes the importance of making AI-powered systems accessible to users with disabilities

### 2.1.3. Accessibility in Web Applications

The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA compliance is essential for ensuring that web applications are usable by people with disabilities. Research shows that:

- **Keyboard Navigation**: Full keyboard accessibility is crucial for users with motor disabilities
- **Screen Reader Support**: Proper ARIA labels and semantic HTML improve accessibility for visually impaired users
- **Customizable UI**: Features like font size adjustment, high contrast mode, and reduced motion benefit users with various disabilities

### 2.1.4. RAG (Retrieval-Augmented Generation) Systems

RAG systems combine information retrieval with language generation, allowing AI assistants to provide accurate, context-aware responses. In the context of job matching:

- **Vector Databases**: Storing job embeddings in vector databases enables fast semantic similarity search
- **Context Building**: Combining user profile, application history, and job database provides rich context for recommendations
- **Response Quality**: RAG systems produce more accurate responses compared to pure language models by grounding responses in retrieved information

## 2.2. Currently Available Solutions (Applications) and Features Matrix

### 2.2.1. Existing Job Platforms

| Platform | Disability Filtering | AI Recommendations | Accessibility Features | CV Processing | Assistive Tools | Cost |
|----------|---------------------|-------------------|----------------------|---------------|-----------------|------|
| **LinkedIn** | ❌ Limited | ✅ Basic | ⚠️ Partial WCAG | ✅ Yes | ❌ No | Freemium |
| **Indeed** | ⚠️ Basic | ⚠️ Basic | ⚠️ Partial WCAG | ✅ Yes | ❌ No | Free |
| **Glassdoor** | ❌ No | ⚠️ Basic | ⚠️ Partial WCAG | ✅ Yes | ❌ No | Free |
| **Monster** | ❌ No | ⚠️ Basic | ⚠️ Partial WCAG | ✅ Yes | ❌ No | Free |
| **AbilityJobs** | ✅ Yes | ❌ No | ⚠️ Partial WCAG | ✅ Yes | ❌ No | Free |
| **DisabilityJobs** | ✅ Yes | ❌ No | ⚠️ Partial WCAG | ✅ Yes | ❌ No | Free |
| **EmpowerWork** | ✅ Advanced | ✅ RAG-Based | ✅ WCAG AA | ✅ Yes | ✅ Yes | Free |

### 2.2.2. Feature Comparison

**Disability Filtering:**
- **LinkedIn/Indeed/Glassdoor**: Limited or no disability-specific filtering
- **AbilityJobs/DisabilityJobs**: Basic disability filtering but limited job database
- **EmpowerWork**: Advanced filtering with 25+ disability types, intelligent matching, and relevance scoring

**AI Recommendations:**
- **LinkedIn**: Basic job suggestions based on profile
- **Indeed**: Simple keyword matching
- **EmpowerWork**: RAG-powered chatbot with disability-aware recommendations, context building, and personalized suggestions

**Accessibility Features:**
- **Most Platforms**: Partial WCAG compliance, limited customization
- **EmpowerWork**: Full WCAG AA compliance, font size adjustment, high contrast mode, reduced motion, keyboard navigation

**CV Processing:**
- **All Platforms**: Basic CV upload
- **EmpowerWork**: PDF extraction, manual entry option, structured data storage

**Assistive Tools Discovery:**
- **All Other Platforms**: Not available
- **EmpowerWork**: Comprehensive assistive tools database with 24+ tools, personalized recommendations, platform filtering

### 2.2.3. Limitations of Existing Solutions

1. **Limited Disability Awareness**: Most platforms do not prioritize disability accommodations in job matching
2. **No AI-Powered Assistance**: Lack of intelligent chatbot for personalized recommendations
3. **Insufficient Accessibility**: Many platforms do not meet WCAG AA standards
4. **No Assistive Tools Integration**: Existing platforms do not provide assistive tools discovery
5. **Poor User Experience**: Complex interfaces that are difficult to navigate for users with disabilities

## 2.3. Tools Background

### 2.3.1. Backend Technologies

**FastAPI**
- **Purpose**: Modern Python web framework for building REST APIs
- **Selection Rationale**: 
  - High performance (comparable to Node.js and Go)
  - Automatic API documentation (OpenAPI/Swagger)
  - Type hints and validation
  - Async/await support
  - Easy integration with SQLAlchemy

**SQLAlchemy**
- **Purpose**: Python SQL toolkit and Object-Relational Mapping (ORM)
- **Selection Rationale**:
  - Database abstraction layer
  - Eager loading support (prevents N+1 queries)
  - Migration support
  - Cross-database compatibility

**MySQL/MariaDB**
- **Purpose**: Relational database management system
- **Selection Rationale**:
  - Widely used and stable
  - Good performance for relational data
  - XAMPP integration for easy local development
  - ACID compliance for data integrity

**Groq API**
- **Purpose**: Large Language Model API for AI responses
- **Selection Rationale**:
  - Fast inference speed
  - Cost-effective
  - GPT-OSS-120B model support
  - Good for RAG applications

**OpenAI API**
- **Purpose**: Text embeddings for semantic search
- **Selection Rationale**:
  - High-quality embeddings (text-embedding-3-small)
  - Reliable API
  - Good documentation

**Werkzeug**
- **Purpose**: Password hashing and security utilities
- **Selection Rationale**:
  - Secure password hashing (bcrypt)
  - Industry standard
  - Part of Flask ecosystem (well-tested)

**PyPDF2**
- **Purpose**: PDF text extraction for CV processing
- **Selection Rationale**:
  - Pure Python library
  - Good PDF parsing capabilities
  - Easy integration

### 2.3.2. Frontend Technologies

**React.js**
- **Purpose**: JavaScript library for building user interfaces
- **Selection Rationale**:
  - Component-based architecture
  - Large ecosystem
  - Good performance
  - Strong accessibility support

**Vite**
- **Purpose**: Build tool and development server
- **Selection Rationale**:
  - Fast development server
  - Optimized production builds
  - Modern tooling
  - Better than Create React App

**TailwindCSS**
- **Purpose**: Utility-first CSS framework
- **Selection Rationale**:
  - Rapid UI development
  - Consistent design system
  - Responsive design utilities
  - Customizable theme

**React Router**
- **Purpose**: Client-side routing
- **Selection Rationale**:
  - Standard routing solution for React
  - Protected route support
  - Good documentation

**Axios**
- **Purpose**: HTTP client for API requests
- **Selection Rationale**:
  - Promise-based API
  - Request/response interceptors
  - Error handling
  - Wide browser support

**React Hot Toast**
- **Purpose**: Toast notification library
- **Selection Rationale**:
  - Lightweight
  - Accessible
  - Easy to use
  - Good UX

### 2.3.3. Development Tools

**Git**
- **Purpose**: Version control system
- **Selection Rationale**:
  - Industry standard
  - Distributed version control
  - Branch management
  - Collaboration support

**XAMPP**
- **Purpose**: Local development environment
- **Selection Rationale**:
  - Easy MySQL setup
  - Cross-platform
  - Includes phpMyAdmin
  - Quick local development

**Python 3.11+**
- **Purpose**: Backend programming language
- **Selection Rationale**:
  - Strong typing support
  - Rich ecosystem
  - Good performance
  - Easy to learn

**Node.js 16+**
- **Purpose**: JavaScript runtime for frontend tooling
- **Selection Rationale**:
  - Required for React development
  - npm package management
  - Vite requires Node.js

### 2.3.4. AI/ML Technologies

**RAG (Retrieval-Augmented Generation)**
- **Purpose**: Combining retrieval and generation for accurate AI responses
- **Selection Rationale**:
  - Provides context-aware responses
  - Reduces hallucinations
  - Grounds responses in actual data
  - Better than pure language models for job recommendations

**ChromaDB (Optional)**
- **Purpose**: Vector database for embeddings
- **Selection Rationale**:
  - Lightweight
  - Easy to integrate
  - Good for semantic search
  - Can be embedded in application

**Vector Embeddings**
- **Purpose**: Semantic representation of text
- **Selection Rationale**:
  - Enables semantic search
  - Better than keyword matching
  - Understands context and meaning

