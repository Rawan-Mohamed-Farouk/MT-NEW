# RAG Chatbot System

## 📁 Files

### `rag_chat.py`
Main chatbot implementation using Groq:
- System prompt configuration
- Context building from user profile
- Job filtering and formatting
- Response generation
- Emoji removal and formatting

**Key Features:**
- Disability-aware responses
- Application history awareness
- Concise summary format
- No emojis or paragraphs

### `embedder.py`
Text embedding generation:
- OpenAI embeddings API
- Text-to-vector conversion
- JSON serialization

**Note:** Currently using Groq-only mode, embeddings optional.

### `retriever.py`
Vector database retrieval:
- ChromaDB integration
- Vector similarity search
- Document storage

**Note:** Currently using Groq-only mode, ChromaDB optional.

## 🤖 Chatbot Behavior

### Response Format
- No emojis
- Bullet points or short sentences
- Maximum 100 words
- Summary style

### Context Awareness
- User disabilities
- Application history
- Skills and preferences
- Location and job type

### Job Recommendations
- Prioritizes disability matches
- Excludes already-applied jobs
- Suggests 2-3 best matches
- Explains accommodations

## 🔧 Configuration

Set in `.env`:
```env
GROQ_API_KEY=your_key
GROQ_MODEL=openai/gpt-oss-120b
OPENAI_API_KEY=your_key (optional)
```

## 📊 Flow

1. User sends message
2. Build context from profile
3. Filter relevant jobs
4. Format jobs for context
5. Send to Groq API
6. Post-process response
7. Return to user

