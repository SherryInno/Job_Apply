# 🚀 Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Anthropic API key (get it from https://console.anthropic.com)

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure your API key:**
   - Copy `.env.example` to `.env.local`
   - Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk_your_actual_api_key_here
   ```

## Running the App

### Option 1: Run Backend & Frontend Together (Recommended)
```bash
npm install --save-dev concurrently
npm run dev:all
```

### Option 2: Run Backend & Frontend Separately
**Terminal 1 - Backend Server:**
```bash
ANTHROPIC_API_KEY=sk_your_key npm run dev:backend
```

**Terminal 2 - Frontend (Vite):**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Architecture

- **Frontend:** React + Vite (runs on port 3000)
- **Backend:** Express server (runs on port 3001)
- API calls from the frontend are proxied through the backend to Anthropic's API
- Your API key is kept secure on the backend 🔒

## Troubleshooting

**"Failed to load resource: 401 Unauthorized"**
- Make sure `ANTHROPIC_API_KEY` is set in your environment
- Check that the backend is running on port 3001

**Backend won't start**
- Ensure port 3001 is not in use: `lsof -i :3001`
- Check that express is installed: `npm list express`
