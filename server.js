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

// RapidAPI JSSearch configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

console.log(`🚀 Job Apply Tool Backend Startup`);
console.log(`📝 Ollama: ${OLLAMA_API_URL} (model: ${OLLAMA_MODEL})`);
console.log(`💼 JSSearch API: ${RAPIDAPI_KEY ? '✅ Configured' : '⚠️  Using fallback (add RAPIDAPI_KEY to .env.local)'}`);

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
    tags: ["React", "TypeScript", "Node.js"],
    url: "https://techjobs.example.com/senior-frontend-1",
    description: "Looking for a Senior Frontend Engineer with 5+ years experience in React and modern JavaScript. You'll lead our frontend architecture."
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "New York, NY / Remote",
    salary: "$120,000 - $160,000",
    posted: "1 day ago",
    tags: ["React", "Python", "PostgreSQL"],
    url: "https://startupsearch.com/fullstack-dev",
    description: "Join our growing startup building the future of fintech. We need a full stack developer proficient in React, Python, and databases."
  },
  {
    id: "3",
    title: "Backend Engineer - Python",
    company: "DataFlow Systems",
    location: "Austin, TX / Remote",
    salary: "$130,000 - $180,000",
    posted: "3 days ago",
    tags: ["Python", "Django", "AWS"],
    url: "https://datasystemsjobs.com/python-backend",
    description: "Build scalable backend systems using Python and Django. Experience with AWS and cloud infrastructure required."
  },
  {
    id: "4",
    title: "Product Manager",
    company: "AI Innovation Labs",
    location: "Mountain View, CA / Remote",
    salary: "$160,000 - $200,000",
    posted: "1 day ago",
    tags: ["Product Strategy", "Analytics", "Leadership"],
    url: "https://aijoins.com/pm-role",
    description: "Lead product vision for our AI platform. You'll work with engineering and design teams to deliver innovative AI features."
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudScale Inc",
    location: "Seattle, WA / Remote",
    salary: "$140,000 - $190,000",
    posted: "2 days ago",
    tags: ["Kubernetes", "Docker", "AWS"],
    url: "https://cloudscalejobs.com/devops",
    description: "Design and maintain our cloud infrastructure. Kubernetes, Docker, and AWS expertise essential."
  },
  {
    id: "6",
    title: "Frontend Developer - React",
    company: "Creative Digital Agency",
    location: "Los Angeles, CA / Remote",
    salary: "$100,000 - $150,000",
    posted: "Just posted",
    tags: ["React", "Next.js", "CSS"],
    url: "https://creativejobs.com/react-dev",
    description: "Join our design-focused team building beautiful web experiences. Strong React and CSS skills required."
  },
  {
    id: "7",
    title: "Data Science Engineer",
    company: "Analytics Pro",
    location: "Chicago, IL / Remote",
    salary: "$130,000 - $170,000",
    posted: "4 days ago",
    tags: ["Python", "Machine Learning", "SQL"],
    url: "https://analyticsjobs.com/ds-engineer",
    description: "Build ML pipelines and data models. Python, scikit-learn, and SQL expertise needed."
  },
  {
    id: "8",
    title: "Mobile Developer - iOS",
    company: "AppWorks Studio",
    location: "Boston, MA / Remote",
    salary: "$120,000 - $160,000",
    posted: "3 days ago",
    tags: ["Swift", "iOS", "Objective-C"],
    url: "https://appworksjobs.com/ios-dev",
    description: "Develop iOS applications using Swift. Experience with modern iOS development patterns required."
  }
];

// Job search endpoint using Adzuna API (free job aggregator)
app.post("/api/search/jobs", async (req, res) => {
  const { query, location } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    console.log(`🔍 Searching JSSearch API for: "${query}"`);
    
    // RapidAPI JSSearch - free job search API
    // Sign up for free at: https://rapidapi.com/laimoon-laimoon/api/jsearch
    if (!RAPIDAPI_KEY) {
      console.warn("⚠️ RAPIDAPI_KEY not configured, using sample data fallback");
      throw new Error("RAPIDAPI_KEY not configured");
    }
    
    const searchUrl = "https://jsearch.p.rapidapi.com/search";
    const queryParams = new URLSearchParams({
      query: query,
      page: "1",
      num_pages: "1"
    });

    if (location?.trim()) {
      queryParams.append("location", location);
    }

    console.log(`📡 Requesting JSSearch API for: ${query}${location ? ` in ${location}` : ""}`);
    
    try {
      const response = await fetch(`${searchUrl}?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "jsearch.p.rapidapi.com"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ JSSearch API returned ${response.status}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 JSSearch returned ${(data.data || []).length} jobs`);
      
      // Transform JSSearch API response to our format
      const jobs = (data.data || [])
        .slice(0, 20)
        .map((job, i) => ({
          id: job.job_id || i,
          title: job.job_title || "Unknown",
          company: job.employer_name || "Unknown",
          location: job.job_location || "Location not specified",
          platform: job.job_employment_type || "Full-time",
          salary: job.job_salary_currency && job.job_min_salary && job.job_max_salary
            ? `${job.job_salary_currency}${job.job_min_salary?.toLocaleString()} - ${job.job_salary_currency}${job.job_max_salary?.toLocaleString()}`
            : "Not listed",
          posted: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : "Recently",
          tags: job.job_required_skills ? job.job_required_skills.slice(0, 3) : [],
          easyApply: job.job_apply_is_direct || false,
          url: job.job_apply_link || job.job_google_link || "",
          description: job.job_description ? job.job_description.substring(0, 500) : "",
        }));

      console.log(`✅ Transformed to ${jobs.length} jobs from JSSearch`);
      
      res.json(jobs);
    } catch (jsearchError) {
      // Fallback to sample data if JSSearch API fails
      console.warn(`⚠️ JSSearch API error: ${jsearchError.message}`);
      console.warn(`📝 Using sample data fallback instead`);
      
      const queryLower = query.toLowerCase();
      const filtered = REALISTIC_JOBS.filter(job => 
        job.title.toLowerCase().includes(queryLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );

      const results = filtered.length > 0 ? filtered : REALISTIC_JOBS.slice(0, 6);
      
      res.json(results);
    }
  } catch (error) {
    console.error("❌ Error in job search:", error);
    
    // Fallback to sample data on any error
    const queryLower = query.toLowerCase();
    const filtered = REALISTIC_JOBS.filter(job => 
      job.title.toLowerCase().includes(queryLower) ||
      job.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );

    const results = filtered.length > 0 ? filtered : REALISTIC_JOBS.slice(0, 6);
    res.json(results);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Using Ollama at ${OLLAMA_API_URL} with model "${OLLAMA_MODEL}"`);
  console.log(`💼 Job search: Using JSSearch API (RapidAPI with fallback to sample data)`);
});
