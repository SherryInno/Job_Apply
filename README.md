# Job Apply Tool

An AI-powered job search and application tool. Search real job listings, enhance your resume for ATS, generate tailored cover letters, and auto-apply to multiple jobs at once.

## Features

- **Job Search** — pulls real listings from We Work Remotely, Remotive, The Muse, and Jobicy (free, no key needed)
- **Resume Enhancement** — AI-powered ATS optimization with keyword gap analysis
- **Cover Letter Generation** — tailored cover letters for each job
- **Auto-Tailor** — automatically adjusts your resume to match each job's keywords before applying
- **Application Tracker** — track applied jobs with status, notes, and tailored resumes

## Requirements

- Node.js 18+
- A [Groq API key](https://console.groq.com) (free) — required for AI features

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Groq API key

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then open `.env.local` and replace the placeholder with your key:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com).

> `.env.local` is gitignored — your key will never be committed.

### 3. Run the app

```bash
npm run dev:all
```

This starts both the backend (port 3001) and frontend (port 3000). The app will open at [http://localhost:3000](http://localhost:3000).

## Running separately

```bash
# Terminal 1 — backend
npm run dev:backend

# Terminal 2 — frontend
npm run dev
```

## Architecture

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React + Vite | Port 3000 |
| Backend | Express | Port 3001 |
| Job Search | RSS feeds (WWR, Remotive, The Muse, Jobicy) | Free, no key needed |
| AI (resume, cover letters) | Groq — `llama-3.3-70b-versatile` | Requires `GROQ_API_KEY` |

## Troubleshooting

**AI features return an error**
- Make sure `GROQ_API_KEY` is set in `.env.local`
- Restart the backend after editing `.env.local`

**No jobs found**
- Try a broader search term (e.g. "Product Manager" instead of a very specific title)
- The RSS feeds focus on remote roles — remote-friendly titles return the most results

**Port already in use**
```bash
lsof -i :3001   # find what's using the port
kill -9 <PID>
```
