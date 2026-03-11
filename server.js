import 'dotenv/config.js';
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;

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

// Job search endpoint using JSearch API (real job listings)
app.post("/api/search/jobs", async (req, res) => {
  const { query, location } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  if (!JSEARCH_API_KEY) {
    return res.status(500).json({ 
      error: "JSEARCH_API_KEY not configured",
      hint: "Get a free API key from https://rapidapi.com/laimoon-laimoon/api/jsearch"
    });
  }

  try {
    const searchQuery = location ? `${query} in ${location}` : query;
    
    const response = await fetch("https://jsearch.p.rapidapi.com/search", {
      method: "GET",
      headers: {
        "x-rapidapi-key": JSEARCH_API_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
      },
      body: new URLSearchParams({
        query: searchQuery,
        page: "1",
        num_pages: "1",
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`JSearch error: ${response.status} - ${error}`);
      return res.status(500).json({ 
        error: `Job search failed: ${error}`,
        hint: "Check your JSEARCH_API_KEY"
      });
    }

    const data = await response.json();
    const jobs = (data.data || []).map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_location || "Remote",
      platform: "JSsearch",
      salary: job.job_salary_max && job.job_salary_min 
        ? `$${job.job_salary_min}-${job.job_salary_max}`
        : job.job_salary_max 
        ? `$${job.job_salary_max}`
        : "Not listed",
      posted: job.job_posted_at_datetime_utc || "Recently",
      tags: (job.job_required_skills || []).slice(0, 4),
      easyApply: false,
      url: job.job_apply_link || job.job_google_link || "",
      description: job.job_description || "",
    }));

    res.json(jobs);
  } catch (error) {
    console.error("Error calling JSearch API:", error);
    res.status(500).json({ 
      error: error.message,
      hint: "Make sure JSEARCH_API_KEY is set correctly"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Using Ollama at ${OLLAMA_API_URL} with model "${OLLAMA_MODEL}"`);
  console.log(`🔍 Job search: ${JSEARCH_API_KEY ? "✅ JSearch API configured" : "⚠️ JSearch API key not set"}`);
});
