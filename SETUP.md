# 🚀 Setup Instructions

## Prerequisites
- Node.js 18+ installed
- **Ollama** installed (free, open source)
  - Download from: https://ollama.ai
  - Or via Homebrew: `brew install ollama`

(No additional API keys needed! We use RemoteOK API which is completely free)

## Installation

### Step 1: Set up Ollama (for resume enhancement)

1. **Install Ollama**:
   ```bash
   brew install ollama  # macOS
   # or download from https://ollama.ai
   ```

2. **Pull a model** (first time only):
   ```bash
   ollama pull mistral
   # Other options: llama2, neural-chat, orca-mini, etc.
   ```

3. **Start Ollama** (keep this running):
   ```bash
   ollama serve
   ```
   It will listen on `http://localhost:11434`

### Step 2: Install dependencies

1. **Install dependencies**:
   ```bash
   npm install
   ```

No additional setup needed! RemoteOK API is free and requires no authentication.

## Running the App

### Option 1: Run Backend & Frontend Together (Recommended)
```bash
npm run dev:all
```

### Option 2: Run Backend & Frontend Separately
**Terminal 1 - Make sure Ollama is running:**
```bash
ollama serve
```

**Terminal 2 - Backend Server:**
```bash
npm run dev:backend
```

**Terminal 3 - Frontend (Vite):**
```bash
npm run dev
```

The app will open at `http://localhost:3000` with the backend running on port 3001 🚀

## Features

- **🔍 Real Job Search**: Uses JSearch API to find actual job openings with real URLs
- **📄 Resume Enhancement**: Ollama-powered resume optimization for ATS
- **✉️ Cover Letter Generation**: AI-generated cover letters tailored to each job
- **⚡ Auto-Apply**: Apply to multiple jobs at once
- **🎯 Resume Tailoring**: Auto-adjust resume for each job's keywords

## Switching Models

To use a different open source model:

1. **Pull the model:**
   ```bash
   ollama pull llama2
   ```

2. **Run with the new model:**
   ```bash
   OLLAMA_MODEL=llama2 npm run dev:all
   ```

### Recommended Models

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| **mistral** | 4GB | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ |
| llama2 | 7GB (14GB) | ⚡⚡ Medium | ⭐⭐⭐⭐ |
| neural-chat | 5GB | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ |
| orca-mini | 1.7GB | ⚡⚡⚡ Fast | ⭐⭐⭐ |
| zephyr | 4GB | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ |

## Architecture

- **Frontend:** React + Vite (runs on port 3000)
- **Backend:** Express server (runs on port 3001)
- **Job Search:** RemoteOK API - real remote job listings, completely free, no API key needed ✅
- **LLM:** Ollama - open source, runs locally, no additional API keys ✅
- All API calls are proxied through the backend for security 🔒

## Troubleshooting

**"Job search failed" or "No jobs found"**
- RemoteOK focuses on remote jobs, so generic keywords like "frontend" work best
- Try searching for: "Frontend", "Backend", "Developer", "Engineer", "Designer"
- Remote.co mirrors RemoteOK data, so results reflect remote positions

**"Ollama API error"**
- Make sure Ollama is running: `ollama serve`
- Check that the model is installed: `ollama pull mistral`

**Backend won't start**
- Ensure port 3001 is not in use: `lsof -i :3001`
- Check that express is installed: `npm list express`

**Frontend can't connect to backend**
- Check that the backend is running and accessible at `http://localhost:3001`
- Ensure `OLLAMA_API_URL` matches where Ollama is running (default: `http://localhost:11434`)


