# Diagram Files

This directory contains PlantUML diagram files that can be rendered using various tools.

## Files

- **ERD.puml** - Entity Relationship Diagram
- **UseCase.puml** - Use Case Diagram
- **SequenceDiagrams.puml** - Sequence Diagrams (Job Application, Chatbot, Login)
- **StateDiagram.puml** - State Diagrams (Application State, User Session)
- **DFD.puml** - Data Flow Diagrams (Level 0 and Level 1)

## How to View/Edit

### Option 1: Online (Recommended)
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy and paste the content from any `.puml` file
3. View the rendered diagram

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Option 3: Draw.io
1. Go to https://app.diagrams.net/
2. Create new diagram
3. Use the diagrams as reference to recreate in draw.io format

### Option 4: Command Line
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate ERD.puml -o ERD.png
```

## Diagram Descriptions

### ERD (Entity Relationship Diagram)
Shows all database entities and their relationships:
- Users, Jobs, Companies, Locations
- Many-to-many relationships (User-Disability, Job-Disability, etc.)
- Foreign key relationships

### Use Case Diagram
Shows user interactions with the system:
- Job Seeker use cases (register, search, apply, chat)
- Administrator use cases (manage users, jobs, review applications)

### Sequence Diagrams
Show step-by-step interactions:
- Job Application: User applies → CV processing → Database storage
- Chatbot: User message → AI processing → Response
- Login: Authentication flow

### State Diagrams
Show state transitions:
- Application states: Pending → Under Review → Approved/Rejected
- User session: Logged Out → Authenticating → Logged In

### Data Flow Diagrams
Show data flow through the system:
- Level 0: High-level system context
- Level 1: Detailed data processing layers

