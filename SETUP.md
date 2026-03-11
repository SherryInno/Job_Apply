# 🚀 Setup Instructions

## Prerequisites
- Node.js 18+ installed
- **Ollama** installed (free, open source)
  - Download from: https://ollama.ai
  - Or via Homebrew: `brew install ollama`

## Installation

1. **Install Ollama** (if not already installed):
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

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Configure Ollama** (optional):
   - Copy `.env.example` to `.env.local` if you want to customize
   - Default model is `mistral` - change `OLLAMA_MODEL` to use a different one

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
- **LLM:** Ollama - open source, runs locally, no API keys needed ✅
- API calls from the frontend are proxied through the backend to Ollama 🔒

## Troubleshooting

**"Ollama API error: unable to find image"**
- Ollama is not running. Start it with: `ollama serve`

**"Model not found"**
- Pull the model first: `ollama pull mistral`

**Responses are slow**
- Try a faster, smaller model: `ollama pull orca-mini`
- Ensure you have enough RAM (at least 8GB recommended)

**Backend won't start**
- Ensure port 3001 is not in use: `lsof -i :3001`
- Check that express is installed: `npm list express`

**Frontend can't connect to backend**
- Check that the backend is running and accessible at `http://localhost:3001/api/anthropic/v1/messages`
- Ensure `OLLAMA_API_URL` matches where Ollama is running (default: `http://localhost:11434`)

