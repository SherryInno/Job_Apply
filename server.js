import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import cors from "cors";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;

// Debug: Log if API key is loaded
console.log(`🔍 Checking env: JSEARCH_API_KEY = ${JSEARCH_API_KEY ? "✅ Loaded" : "❌ Not loaded"}`);
if (!JSEARCH_API_KEY) {
  console.warn("⚠️  JSEARCH_API_KEY not found in .env.local");
  console.warn(`📝 Make sure .env.local exists at: ${path.join(__dirname, '.env.local')}`);
}

app.use(cors());
app.use(express.json());

// Proxy endpoint for Ollama API (for resume enhancement and cover letters)
app.post("/api/anthropic/v1/messages", async (req, res) => {
  try {
    // Convert Anthropic API format to Ollama format
    const messages = req.body.messages || [];
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Ollama error: ${response.status} - ${error}`);
      return res.status(500).json({ 
        error: `Ollama API error: ${error || response.statusText}`,
        hint: `Make sure Ollama is running at ${OLLAMA_API_URL} with model "${OLLAMA_MODEL}"`
      });
    }

    const data = await response.json();

    // Convert Ollama response to Anthropic-compatible format
    const anthropicResponse = {
      content: [
        {
          type: "text",
          text: data.response || "",
        },
      ],
      model: OLLAMA_MODEL,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    };

    res.json(anthropicResponse);
  } catch (error) {
    console.error("Error calling Ollama API:", error);
    res.status(500).json({ 
      error: error.message,
      hint: `Make sure Ollama is running at ${OLLAMA_API_URL}`
    });
  }
});

// Job search endpoint using RemoteOK API (real job listings - completely free!)
app.post("/api/search/jobs", async (req, res) => {
  const { query, location } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    // RemoteOK API - free, no authentication needed
    // Search for jobs matching the query
    const searchUrl = `https://remoteok.com/api?tag=${encodeURIComponent(query)}`;
    
    console.log(`🔍 Searching RemoteOK with tag: ${query}`);
    
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobApplyTool/1.0)"
      }
    });

    if (!response.ok) {
      throw new Error(`RemoteOK API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📊 API returned ${(data || []).length} total results`);
    
    // Filter and transform the jobs
    const jobs = (data || [])
      .filter(job => job.position_type !== 'meta') // Remove metadata
      .slice(0, 20) // Limit to 20 results
      .map((job, i) => ({
        id: job.id || i,
        title: job.title || "Unknown",
        company: job.company || "Unknown",
        location: job.location || "Remote",
        platform: "RemoteOK",
        salary: job.salary || "Not listed",
        posted: job.date_posted ? new Date(job.date_posted * 1000).toLocaleDateString() : "Recently",
        tags: (job.tags ? job.tags.split(',').slice(0, 4).map(t => t.trim()) : []).filter(t => t),
        easyApply: false,
        url: job.url || `https://remoteok.com/l/${job.id}` || "",
        description: job.description || "",
      }));

    console.log(`✅ Transformed to ${jobs.length} jobs`);
    
    res.json(jobs);
  } catch (error) {
    console.error("❌ Error calling RemoteOK API:", error);
    res.status(500).json({ 
      error: error.message || "Failed to search jobs"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Using Ollama at ${OLLAMA_API_URL} with model "${OLLAMA_MODEL}"`);
  console.log(`🔍 Job search: Using RemoteOK API (completely free!)`);
});
