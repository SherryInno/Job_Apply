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
console.log(`🚀 Job Apply Tool Backend Startup`);
console.log(`💼 Sources: WWR + Remotive + The Muse + Jobicy`);

// ── RSS parser ────────────────────────────────────────────────────────────────
function parseRSSItems(xml) {
  const items = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const block of blocks) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${tag}>`));
      return m ? (m[1] ?? m[2] ?? "").trim() : "";
    };
    // <link> in RSS is text node between tags (not CDATA)
    const linkMatch = block.match(/<link>([^<]+)<\/link>/);
    items.push({
      title:       get("title"),
      link:        linkMatch ? linkMatch[1].trim() : get("guid"),
      pubDate:     get("pubDate"),
      skills:      get("skills"),
      region:      get("region"),
      category:    get("category"),
      description: get("description").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    });
  }
  return items;
}

// We Work Remotely category feeds
const WWR_FEEDS = {
  product:     "https://weworkremotely.com/categories/remote-product-jobs.rss",
  management:  "https://weworkremotely.com/categories/remote-management-jobs.rss",
  engineering: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  design:      "https://weworkremotely.com/categories/remote-design-jobs.rss",
  data:        "https://weworkremotely.com/categories/remote-data-science-jobs.rss",
  devops:      "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
  all:         "https://weworkremotely.com/remote-jobs.rss",
};

function pickFeeds(query) {
  // Always include "all" for broad coverage; add specific categories for better precision
  const q = query.toLowerCase();
  if (/product|pm\b|roadmap/.test(q))                      return ["all", "product", "management"];
  if (/engineer|develop|frontend|backend|fullstack|node|react|python|java/.test(q)) return ["all", "engineering"];
  if (/design|ux|ui|figma/.test(q))                        return ["all", "design"];
  if (/data|ml|machine learning|analytics|scientist/.test(q)) return ["all", "data"];
  if (/devops|sre|infra|kubernetes|docker|cloud/.test(q))  return ["all", "devops"];
  if (/manager|director|vp|lead|head of/.test(q))          return ["all", "management"];
  return ["all"];
}

async function fetchWWR(query) {
  const feeds = pickFeeds(query);
  const results = await Promise.allSettled(
    feeds.map(f => fetch(WWR_FEEDS[f], { headers: { "User-Agent": "JobApplyTool/1.0" } })
      .then(r => r.ok ? r.text() : Promise.reject(r.status)))
  );
  const queryLower = query.toLowerCase();
  const jobs = [];
  let id = 1;

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const items = parseRSSItems(r.value);
    for (const item of items) {
      if (!item.title || !item.link) continue;
      // Title format: "Company Name: Job Title"
      const colonIdx = item.title.indexOf(": ");
      const company = colonIdx > -1 ? item.title.slice(0, colonIdx).trim() : "Unknown";
      const title   = colonIdx > -1 ? item.title.slice(colonIdx + 2).trim() : item.title;

      // Filter by keyword relevance — title takes priority, fall back to exact phrase in full text
      const titleLower = title.toLowerCase();
      const words = queryLower.split(/\s+/).filter(w => w.length > 3);
      const titleMatches = titleLower.includes(queryLower) || (words.length > 0 && words.every(w => titleLower.includes(w)));
      const searchable = `${title} ${item.category} ${item.description}`.toLowerCase();
      const exactBodyMatch = searchable.includes(queryLower);  // exact phrase in body only
      if (!titleMatches && !exactBodyMatch) continue;

      const tags = item.skills
        ? item.skills.split(",").map(s => s.trim()).filter(Boolean).slice(0, 4)
        : [item.category].filter(Boolean);

      jobs.push({
        id: id++,
        title,
        company,
        location: item.region || "Remote",
        platform: "Remote.co",
        salary: "Not listed",
        posted: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Recently",
        tags,
        easyApply: false,
        url: item.link,
        description: item.description.substring(0, 500),
      });
    }
  }
  return jobs;
}

async function fetchRemotive(query) {
  try {
    // Remotive searches exact phrases; use first significant word for broader recall
    const searchTerm = query.split(/\s+/).find(w => w.length > 3) || query;
    const r = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchTerm)}&limit=30`);
    if (!r.ok) return [];
    const data = await r.json();
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter(w => w.length > 3);
    return (data.jobs || [])
      .filter(job => {
        const t = (job.title || "").toLowerCase();
        return t.includes(queryLower) || (words.length > 0 && words.every(w => t.includes(w)));
      })
      .map((job, i) => ({
        id: 1000 + i,
        title: job.title || "Unknown",
        company: job.company_name || "Unknown",
        location: job.candidate_required_location || "Remote",
        platform: "Remote.co",
        salary: job.salary || "Not listed",
        posted: job.publication_date ? new Date(job.publication_date).toLocaleDateString() : "Recently",
        tags: (job.tags || []).slice(0, 4),
        easyApply: false,
        url: job.url || "",
        description: (job.description || "").replace(/<[^>]*>/g, " ").substring(0, 500),
      }));
  } catch { return []; }
}

// The Muse category mapping (free public API, no key needed)
const MUSE_CATEGORIES = {
  "product":    "Product Management",
  "engineer":   "Software Engineering",
  "develop":    "Software Engineering",
  "frontend":   "Software Engineering",
  "backend":    "Software Engineering",
  "fullstack":  "Software Engineering",
  "data":       "Data Science",
  "design":     "Design & UX",
  "devops":     "DevOps",
  "marketing":  "Marketing & PR",
  "sales":      "Sales",
  "finance":    "Finance",
};

function pickMuseCategory(query) {
  const q = query.toLowerCase();
  for (const [kw, cat] of Object.entries(MUSE_CATEGORIES)) {
    if (q.includes(kw)) return cat;
  }
  return null; // no category filter — let title filter handle it
}

async function fetchMuse(query) {
  try {
    const category = pickMuseCategory(query);
    const url = category
      ? `https://www.themuse.com/api/public/jobs?category=${encodeURIComponent(category)}&page=1`
      : `https://www.themuse.com/api/public/jobs?page=1`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter(w => w.length > 3);
    return (data.results || [])
      .filter(job => {
        const t = (job.name || "").toLowerCase();
        return t.includes(queryLower) || (words.length > 0 && words.every(w => t.includes(w)));
      })
      .map((job, i) => ({
        id: 2000 + i,
        title: job.name || "Unknown",
        company: job.company?.name || "Unknown",
        location: job.locations?.map(l => l.name).join(", ") || "Remote",
        platform: "The Muse",
        salary: "Not listed",
        posted: job.publication_date ? new Date(job.publication_date).toLocaleDateString() : "Recently",
        tags: (job.categories || []).map(c => c.name).slice(0, 3),
        easyApply: false,
        url: job.refs?.landing_page || "",
        description: (job.contents || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 500),
      }));
  } catch { return []; }
}

// Jobicy — free, no key, real remote jobs (tagged as Indeed)
const JOBICY_CATEGORIES = {
  "product":   "product",
  "engineer":  "engineering",
  "develop":   "engineering",
  "frontend":  "engineering",
  "backend":   "engineering",
  "design":    "design",
  "data":      "data-science",
  "devops":    "devops-sysadmin",
  "marketing": "marketing",
  "sales":     "sales",
  "finance":   "finance",
};

function pickJobicyTag(query) {
  const q = query.toLowerCase();
  for (const [kw, tag] of Object.entries(JOBICY_CATEGORIES)) {
    if (q.includes(kw)) return tag;
  }
  return null;
}

async function fetchJobicy(query) {
  try {
    const tag = pickJobicyTag(query);
    const url = tag
      ? `https://jobicy.com/api/v2/remote-jobs?count=20&tag=${encodeURIComponent(tag)}`
      : `https://jobicy.com/api/v2/remote-jobs?count=20`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter(w => w.length > 3);
    return (data.jobs || [])
      .filter(job => {
        const t = (job.jobTitle || "").toLowerCase();
        return t.includes(queryLower) || (words.length > 0 && words.every(w => t.includes(w)));
      })
      .map((job, i) => ({
        id: 3000 + i,
        title: job.jobTitle || "Unknown",
        company: job.companyName || "Unknown",
        location: job.jobGeo || "Remote",
        platform: "Indeed",
        salary: "Not listed",
        posted: job.pubDate ? new Date(job.pubDate).toLocaleDateString() : "Recently",
        tags: (job.jobIndustry || []).slice(0, 3),
        easyApply: false,
        url: job.url || "",
        description: (job.jobExcerpt || "").replace(/<[^>]+>/g, " ").trim().substring(0, 500),
      }));
  } catch { return []; }
}


app.use(cors());
app.use(express.json());

// Proxy endpoint — forwards to Groq API (OpenAI-compatible), returns Anthropic-shaped response
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
app.post("/api/anthropic/v1/messages", async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY is not set in .env.local" });
  }
  try {
    // Convert Anthropic message format → OpenAI/Groq format
    const messages = (req.body.messages || []).map(m => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content
        : Array.isArray(m.content)
          ? m.content.filter(b => b.type === "text").map(b => b.text).join("\n")
          : String(m.content),
    }));

    const groqBody = {
      model: GROQ_MODEL,
      max_tokens: req.body.max_tokens || 4000,
      messages,
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(groqBody),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }

    // Convert OpenAI response → Anthropic-shaped response (frontend expects content[0].text)
    res.json({
      content: [{ type: "text", text: data.choices?.[0]?.message?.content || "" }],
      model: GROQ_MODEL,
      usage: {
        input_tokens: data.usage?.prompt_tokens || 0,
        output_tokens: data.usage?.completion_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    res.status(500).json({ error: error.message });
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

// Job search — We Work Remotely + Remotive + The Muse + optional Adzuna
app.post("/api/search/jobs", async (req, res) => {
  const { query, location } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    console.log(`🔍 Searching for: "${query}"${location ? ` in ${location}` : ""}`);
    const [wwrJobs, remotiveJobs, museJobs, jobicyJobs] = await Promise.all([
      fetchWWR(query), fetchRemotive(query), fetchMuse(query), fetchJobicy(query),
    ]);

    // Merge, deduplicate by title+company, limit to 40
    const seen = new Set();
    const all = [...wwrJobs, ...remotiveJobs, ...museJobs, ...jobicyJobs].filter(j => {
      const key = `${j.title}|${j.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 40);

    console.log(`✅ Returning ${all.length} jobs (${wwrJobs.length} WWR + ${remotiveJobs.length} Remotive + ${museJobs.length} Muse + ${jobicyJobs.length} Jobicy)`);
    if (all.length === 0) return res.status(404).json({ error: "No jobs found. Try a different role or location." });
    res.json(all);
  } catch (error) {
    console.error("❌ Job search error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Using Ollama at ${OLLAMA_API_URL} with model "${OLLAMA_MODEL}"`);
  console.log(`💼 Job search: We Work Remotely + Remotive RSS (free, no key needed)`);
});
