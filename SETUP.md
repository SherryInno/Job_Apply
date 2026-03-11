# 🚀 Setup Instructions

## Prerequisites
- Node.js 18+ installed
- **Ollama** installed (free, open source)
  - Download from: https://ollama.ai
  - Or via Homebrew: `brew install ollama`
- **FREE JSearch API key** (for real job listings)
  - Sign up at: https://rapidapi.com
  - Subscribe to [JSsearch API](https://rapidapi.com/laimoon-laimoon/api/jsearch) (free tier: 100 requests/month)

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

### Step 2: Set up JSearch API (for real job listings)

1. **Sign up at RapidAPI**:
   - Go to https://rapidapi.com and create a free account

2. **Subscribe to JSsearch API**:
   - Find [JSsearch API](https://rapidapi.com/laimoon-laimoon/api/jsearch)
   - Click "Subscribe to Test" (free tier)

3. **Get your API key**:
   - Go to your [RapidAPI Dashboard](https://rapidapi.com/developer/dashboard)
   - Find "JSsearch API" under "My Subscriptions"
   - Copy your API key

### Step 3: Configure the app

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add your API key**:
   - Edit `.env.local`
   - Add your JSearch API key:
   ```
   JSEARCH_API_KEY=your_actual_api_key_here
   ```

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
- **Job Search:** JSearch API - real job listings with actual URLs ✅
- **LLM:** Ollama - open source, runs locally, no additional API keys ✅
- All API calls are proxied through the backend for security 🔒

## Troubleshooting

**"Job search failed: JSearch API error"**
- Make sure `JSEARCH_API_KEY` is set in `.env.local`
- Check your API key at https://rapidapi.com/developer/dashboard
- Verify you're subscribed to JSsearch API

**"Ollama API error"**
- Make sure Ollama is running: `ollama serve`
- Check that the model is installed: `ollama pull mistral`

**No jobs found**
- The free tier has 100 requests/month limit
- Try a different search term
- Upgrade your RapidAPI plan for more requests

**Backend won't start**
- Ensure port 3001 is not in use: `lsof -i :3001`
- Check that express is installed: `npm list express`

**Frontend can't connect to backend**
- Check that the backend is running and accessible at `http://localhost:3001`
- Ensure `OLLAMA_API_URL` matches where Ollama is running (default: `http://localhost:11434`)


