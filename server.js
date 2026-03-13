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
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

console.log(`🚀 Job Apply Tool Backend Startup`);
console.log(`📝 Ollama: ${OLLAMA_API_URL} (model: ${OLLAMA_MODEL})`);
console.log(`💼 Job search: ${ADZUNA_APP_ID ? "✅ Adzuna API (real listings)" : "⚠️  Adzuna key missing — get a free key at developer.adzuna.com"}`);

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

// Sample realistic job data (structured for easy API swap)
// This data matches the format expected by the frontend
// Can be replaced with any real API without changing frontend code
const REALISTIC_JOBS = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp International",
    location: "San Francisco, CA / Remote",
    salary: "$150,000 - $220,000",
    posted: "2 days ago",
    platform: "LinkedIn",
    tags: ["React", "TypeScript", "Node.js"],
    url: "",
    description: "Looking for a Senior Frontend Engineer with 5+ years experience in React and modern JavaScript. You'll lead our frontend architecture."
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "New York, NY / Remote",
    salary: "$120,000 - $160,000",
    posted: "1 day ago",
    platform: "Indeed",
    tags: ["React", "Python", "PostgreSQL"],
    url: "",
    description: "Join our growing startup building the future of fintech. We need a full stack developer proficient in React, Python, and databases."
  },
  {
    id: "3",
    title: "Backend Engineer - Python",
    company: "DataFlow Systems",
    location: "Austin, TX / Remote",
    salary: "$130,000 - $180,000",
    posted: "3 days ago",
    platform: "Greenhouse",
    tags: ["Python", "Django", "AWS"],
    url: "",
    description: "Build scalable backend systems using Python and Django. Experience with AWS and cloud infrastructure required."
  },
  {
    id: "4",
    title: "Product Manager",
    company: "AI Innovation Labs",
    location: "Mountain View, CA / Remote",
    salary: "$160,000 - $200,000",
    posted: "1 day ago",
    platform: "LinkedIn",
    tags: ["Product Strategy", "Analytics", "Leadership"],
    url: "",
    description: "Lead product vision for our AI platform. You'll work with engineering and design teams to deliver innovative AI features."
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudScale Inc",
    location: "Seattle, WA / Remote",
    salary: "$140,000 - $190,000",
    posted: "2 days ago",
    platform: "Indeed",
    tags: ["Kubernetes", "Docker", "AWS"],
    url: "",
    description: "Design and maintain our cloud infrastructure. Kubernetes, Docker, and AWS expertise essential."
  },
  {
    id: "6",
    title: "Frontend Developer - React",
    company: "Creative Digital Agency",
    location: "Los Angeles, CA / Remote",
    salary: "$100,000 - $150,000",
    posted: "Just posted",
    platform: "Wellfound",
    tags: ["React", "Next.js", "CSS"],
    url: "",
    description: "Join our design-focused team building beautiful web experiences. Strong React and CSS skills required."
  },
  {
    id: "7",
    title: "Data Science Engineer",
    company: "Analytics Pro",
    location: "Chicago, IL / Remote",
    salary: "$130,000 - $170,000",
    posted: "4 days ago",
    platform: "Glassdoor",
    tags: ["Python", "Machine Learning", "SQL"],
    url: "",
    description: "Build ML pipelines and data models. Python, scikit-learn, and SQL expertise needed."
  },
  {
    id: "8",
    title: "Mobile Developer - iOS",
    company: "AppWorks Studio",
    location: "Boston, MA / Remote",
    salary: "$120,000 - $160,000",
    posted: "3 days ago",
    platform: "LinkedIn",
    tags: ["Swift", "iOS", "Objective-C"],
    url: "",
    description: "Develop iOS applications using Swift. Experience with modern iOS development patterns required."
  }
];

// Job search endpoint using Adzuna API (real listings from LinkedIn, Indeed, Glassdoor etc.)
app.post("/api/search/jobs", async (req, res) => {
  const { query, location } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return res.status(503).json({
      error: "Adzuna API key not configured. Get a free key at developer.adzuna.com and add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env.local"
    });
  }

  try {
    console.log(`🔍 Searching Adzuna for: "${query}"${location ? ` in ${location}` : ""}`);

    const queryParams = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: "20",
      what: query,
      content_type: "application/json",
    });

    if (location?.trim()) {
      queryParams.append("where", location);
    }

    const country = "us";
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${queryParams.toString()}`,
      { headers: { "Accept": "application/json" } }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Adzuna API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const rawJobs = data.results || [];
    console.log(`📊 Adzuna returned ${rawJobs.length} jobs`);

    const jobs = rawJobs.map((job, i) => ({
      id: job.id || i,
      title: job.title || "Unknown",
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || location || "Unknown",
      platform: "LinkedIn",
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`
        : "Not listed",
      posted: job.created ? new Date(job.created).toLocaleDateString() : "Recently",
      tags: job.category?.label ? [job.category.label] : [],
      easyApply: false,
      url: job.redirect_url || "",
      description: job.description ? job.description.substring(0, 500) : "",
    }));

    console.log(`✅ Returning ${jobs.length} real jobs from Adzuna`);
    res.json(jobs);

  } catch (error) {
    console.error("❌ Adzuna API error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Using Ollama at ${OLLAMA_API_URL} with model "${OLLAMA_MODEL}"`);
  console.log(`💼 Job search: ${ADZUNA_APP_ID ? "Adzuna API ✅" : "⚠️  Add ADZUNA_APP_ID + ADZUNA_APP_KEY to .env.local (free at developer.adzuna.com)"}`);
});
