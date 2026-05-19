<<<<<<< HEAD
# EmpowerWork - Job Assistance Platform for People with Disabilities

## 🚀 Live Demo
🟢 **Frontend Website:** [👉 Click Here to view the Live Website!](https://mt-new-yc7d.vercel.app/)
⚙️ **Backend API Docs:** [👉 Click Here for Live API Docs](https://mt-new-sigma.vercel.app/docs)

*Note: This platform is fully deployed on Vercel and connected to a live cloud MySQL Database.*

## 🎯 Project Overview

EmpowerWork is a comprehensive job assistance platform designed specifically for people with disabilities. It provides intelligent job matching, personalized recommendations, assistive tools, an AI-powered chatbot, and accessibility-first UI to support inclusive employment.

## 👥 Project Team
- **Rawan Mohamed Farouk**
- **Khaled Ghalwash**
- **Mohamed Gamal**
- **Mohamed Hassen**
- **Mazen Hossam**
- **Nadeen Ehab**

## 🏗️ Project Structure

```
k-main/
├── README.md                 # This file - Main project documentation
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (create from .env.example)
├── docs/                     # All project documentation
│   ├── setup/               # Setup guides
│   ├── features/            # Feature documentation
│   └── guides/              # User and admin guides
├── backend/                 # FastAPI Backend
│   ├── src/                # Source code
│   │   ├── main.py        # FastAPI application entry point
│   │   ├── config.py      # Configuration settings
│   │   ├── db/            # Database models and connection
│   │   ├── routes/        # API route handlers
│   │   ├── rag/           # RAG chatbot implementation
│   │   └── utils/         # Utility functions
│   └── scripts/            # Database scripts
│       ├── migrations/    # Database migration scripts
│       └── seeds/         # Data seeding scripts
├── frontend/               # React Frontend
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── uploads/               # User uploads (profiles, CVs)
    ├── profiles/          # Profile photos
    └── cvs/               # CV files
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- XAMPP (MySQL/MariaDB)
- MySQL running on localhost

### Backend Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run Migrations**
   ```bash
   python backend/scripts/migrations/migrate_disabilities.py
   python backend/scripts/migrations/migrate_tools.py
   ```

4. **Seed Database**
   ```bash
   python backend/scripts/seeds/seed_disabilities.py
   python backend/scripts/seeds/seed_assistive_tools.py
   python backend/scripts/seeds/seed_jobs.py
   ```

5. **Start Backend**
   ```bash
   uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup (React + Vite)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

> **Note**: Make sure MySQL is running in XAMPP and `.env` is configured (copied from `env.khaled` without committing secrets to Git).

## 📚 Documentation

- **[Setup Guide](docs/setup/)** - Installation and configuration
- **[Features](docs/features/)** - Feature documentation
- **[User Guides](docs/guides/)** - User and admin guides

## 🛠️ Technologies

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL/MariaDB** - Database (via XAMPP)
- **Groq** - LLM for intelligent chatbot
- **OpenAI** - Embeddings for semantic search
- **Werkzeug** - Password hashing
- **PyPDF2** - PDF processing

### Frontend
- **React.js** - UI framework
- **TailwindCSS** - Utility-first CSS
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### AI & Intelligence
- **Groq Whisper (whisper-large-v3-turbo)** - Speech-to-text for voice input
- **Groq LLM** - Personalized job recommendations in the chatbot
- **OpenAI Embeddings** - Semantic search and future vector search
- **ChromaDB** - Vector store (for RAG and semantic retrieval)

## ✨ Key Features

- **Intelligent Job Matching** - AI-powered job recommendations based on disabilities
- **Disability Management** - Comprehensive disability system with 25+ types
- **Assistive Tools** - 24+ tools and resources for various disabilities
- **Accessible Design** - WCAG AA compliant with accessibility controls
- **Admin Dashboard** - Complete admin interface for managing the platform
- **Chatbot Assistant** - Intelligent chatbot with disability-aware recommendations
- **Application System** - Job application tracking with CV processing
- **Voice Interaction** - Speech-to-text for sending messages and text-to-speech for reading chatbot replies

**##In order to connect to DB on mac using terminal commands**
- **step1:** brew install mysql-client
- **step2:** echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
- **stsep3:** mysql --version
- **step4:** mysql --user avnadmin --password=YOUR_PASSWORD \
--host mysql-24ce7436-rawanmohamedf.i.aivencloud.com \
--port 10506 defaultdb
- **step5:** SHOW DATABASES; USE defaultdb; SHOW TABLES;

## 🔐 Security Features

- Password hashing (Werkzeug)
- Input sanitization and validation
- Rate limiting
- SQL injection prevention
- XSS protection
- CORS configuration

## 📝 License

This project is proprietary software.

## 📩 Support & Contact

For issues and questions, please refer to the documentation in the `docs/` folder.

For academic or technical inquiries about this graduation project, please contact the project team (Khaled Ghalwash). 
=======
# Hand Gesture Recognition System
Khaled ghalwash


A real-time hand gesture recognition application built with Python, leveraging modern computer vision and machine learning techniques. The system captures hand gestures via webcam, processes them using MediaPipe for hand landmark detection, and classifies gestures using a trained machine learning model. The application features a user-friendly Streamlit interface for real-time interaction and supports containerized deployment with Docker.


## ✨ Features

- **Real-time Hand Tracking**: Utilizes MediaPipe's hand landmark detection for accurate hand tracking
- **Machine Learning Model**: Implements a trained classifier for recognizing various hand gestures
- **Modern Web Interface**: Built with Streamlit for a responsive and interactive user experience
- **Containerized Deployment**: Easy deployment with Docker for consistent environments
- **Model Training Pipeline**: Includes data preprocessing, model training, and evaluation scripts
- **Monitoring**: Integration with MLflow for experiment tracking and model management
- **Testing**: Comprehensive test suite for ensuring code reliability

##  Getting Started

### Prerequisites

- Python 3.8+
- Webcam
- Docker (for containerized deployment)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/khaled-dotcom/depi-project.git
   cd depi-project
   ```

2. **Create and activate a virtual environment**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**
   ```sh
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```sh
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running the Application

#### Development Mode
```sh
streamlit run app.py
```

#### Production Mode with Docker
```bash
# Build the Docker image
docker build -t hand-gesture-app .

# Run the container
docker run -p 8501:8501 --rm hand-gesture-app
```

Access the application at [http://localhost:8501](http://localhost:8501)

##  Project Structure

```
├── .github/              # GitHub Actions workflows
├── artifacts/            # Trained models and artifacts
├── Notebooks/            # Jupyter notebooks for exploration
├── src/                  # Source code
│   ├── __init__.py
│   ├── config.py         # Configuration settings
│   ├── inference.py      # Model inference logic
│   └── preprocessing.py  # Data preprocessing utilities
├── tests/                # Test files
├── .env.example          # Example environment variables
├── app.py                # Streamlit application
├── Dockerfile            # Docker configuration
├── requirements.txt      # Project dependencies
└── README.md             # This file
```

## Dataset

The model is trained on the [Hand Gesture Recognition Dataset](https://www.kaggle.com/datasets/anasalwajdeh/hand-gesture-recognition-dataset-one-hand) from Kaggle, which contains various hand gesture images for classification.

## 🛠️ Development

### Running Tests
```sh
pytest
```

### Model Training
Refer to the `Notebooks/` directory for model training and experimentation notebooks.

### Monitoring
- **MLflow** is used for experiment tracking and model management
- Access the MLflow UI with: `mlflow ui`

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- MediaPipe for hand tracking
- Streamlit for the web interface
- Scikit-learn for machine learning capabilities
- The Kaggle community for the dataset
>>>>>>> d34abbb0 (Add sign language project)
