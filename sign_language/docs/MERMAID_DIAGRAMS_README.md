# Mermaid Diagram Files

This directory contains Mermaid diagram files that can be rendered in various tools and platforms.

## Files

- **ERD.mmd** - Entity Relationship Diagram
- **SequenceDiagrams.mmd** - Sequence Diagrams (5 scenarios)
- **UseCase.mmd** - Use Case Diagrams (3 diagrams)
- **StateDiagram.mmd** - State Diagrams (2 scenarios)
- **DFD.mmd** - Data Flow Diagrams (Level 0 and Level 1)
- **UserActivityDiagram.mmd** - User Activity Diagram (Complete workflow)
- **UserActivityDiagram_Simplified.mmd** - User Activity Diagram (Simplified version)
- **RAG_Workflow.mmd** - RAG System Workflow Diagram
- **RAG_ComponentDiagram.mmd** - RAG System Component Diagram
- **RAG_SequenceDiagram.mmd** - RAG System Sequence Diagram
- **RAG_DataFlow.mmd** - RAG System Data Flow Diagram

## How to View/Edit

### Option 1: Online (Recommended)
1. Go to https://mermaid.live/
2. Copy and paste the content from any `.mmd` file
3. View the rendered diagram
4. Export as PNG, SVG, or PDF

### Option 2: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension in VS Code
2. Or install "Mermaid Preview" extension
3. Open any `.mmd` file
4. Preview the diagram

### Option 3: GitHub/GitLab
- Mermaid diagrams render automatically in Markdown files on GitHub and GitLab
- Just wrap the diagram code in ` ```mermaid ` code blocks

### Option 4: Documentation Sites
- **MkDocs**: Use `mkdocs-mermaid2-plugin`
- **Docusaurus**: Built-in Mermaid support
- **GitBook**: Native Mermaid support
- **Notion**: Supports Mermaid diagrams

### Option 5: Command Line
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i ERD.mmd -o ERD.png

# Generate SVG
mmdc -i ERD.mmd -o ERD.svg
```

## Diagram Descriptions

### ERD (Entity Relationship Diagram)
Shows all database entities and their relationships:
- 12 main entities (User, Job, Disability, Skill, Company, Location, JobApplication, JobRequirement, AssistiveTool, ConversationLog, ActivityLog, SecurityLog)
- 4 association tables (user_disabilities, user_skills, job_disability_support, disability_tools)
- All foreign key relationships
- Field specifications with data types and constraints

### Sequence Diagrams
Show step-by-step interactions:
1. **Job Application (CV Upload)**: User applies → CV processing → Database storage
2. **Job Application (Manual Entry)**: User applies → Manual form → Database storage
3. **Chatbot**: User message → AI processing → Response
4. **User Registration**: Registration flow with validation
5. **Admin Review**: Admin reviews and approves/rejects applications

### Use Case Diagrams
Show user interactions with the system:
- **Job Seeker**: 12 use cases (register, search, apply, chat, etc.)
- **Administrator**: 9 use cases (manage users, jobs, review applications, etc.)
- **System**: 9 use cases (match jobs, extract CV, generate AI responses, etc.)

### State Diagrams
Show state transitions:
- **Application States**: Pending → Under Review → Approved/Rejected
- **User Session**: Logged Out → Authenticating → Logged In (User/Admin)

### Data Flow Diagrams
Show data flow through the system:
- **Level 0**: High-level system context
- **Level 1**: Detailed data processing layers (Application, Processing, Storage)

### User Activity Diagrams
Show complete user workflows and activities:
- **Complete Version**: Detailed activity diagram showing all user actions including:
  - Registration and Login
  - Job Search and Application (CV Upload & Manual Entry)
  - Profile Management
  - Chatbot Interaction
  - Assistive Tools Browsing
  - Accessibility Settings
  - Logout
- **Simplified Version**: High-level overview of main user workflows

### RAG System Diagrams
Show the Retrieval-Augmented Generation chatbot system:
- **RAG_Workflow.mmd**: Complete workflow from user message to response, including:
  - Data retrieval (user profile, jobs, applications)
  - Intelligent job filtering with relevance scoring
  - Context building and prompt construction
  - Groq API call and response processing
  - Post-processing (emoji removal, word limiting)
- **RAG_ComponentDiagram.mmd**: System architecture showing all components:
  - Frontend Layer (Chat Interface)
  - API Layer (Route Handler, Security)
  - Data Retrieval Layer (User, Job, Application Retrievers)
  - Intelligence Layer (Filtering, Scoring, Formatting)
  - Context Building Layer
  - Generation Layer (RAG Chat, Groq API)
  - Post-Processing Layer
- **RAG_SequenceDiagram.mmd**: Step-by-step sequence of RAG system interactions
- **RAG_DataFlow.mmd**: Data flow through the RAG system from input to output

## Advantages of Mermaid

1. **Widely Supported**: Works in GitHub, GitLab, VS Code, documentation tools
2. **Text-Based**: Easy to version control and edit
3. **No External Tools**: Renders directly in Markdown
4. **Multiple Formats**: Can export to PNG, SVG, PDF
5. **Lightweight**: Simple syntax, easy to learn

## Comparison: PlantUML vs Mermaid

| Feature | PlantUML | Mermaid |
|---------|----------|---------|
| GitHub Support | ❌ (requires plugin) | ✅ Native |
| GitLab Support | ❌ (requires plugin) | ✅ Native |
| VS Code | ✅ Extension | ✅ Extension |
| Online Editor | ✅ plantuml.com | ✅ mermaid.live |
| Syntax | More verbose | More concise |
| Learning Curve | Moderate | Easy |

## Usage in Markdown

To use these diagrams in Markdown files:

````markdown
```mermaid
erDiagram
    User ||--o{ JobApplication : "applies"
    ...
```
````

Or include the file:

````markdown
```mermaid
{{% include "docs/diagrams/ERD.mmd" %}}
```
````

## Tips

1. **For GitHub/GitLab**: Use `.mmd` files or embed directly in Markdown
2. **For Documentation**: Include in your docs site with Mermaid plugin
3. **For Presentations**: Export as PNG/SVG and include in slides
4. **For Reports**: Export as PDF or include in LaTeX documents

