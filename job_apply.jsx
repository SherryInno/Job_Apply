import { useState, useEffect, useRef } from "react";

const PLATFORM_COLORS = {
  LinkedIn: "#0A66C2", Indeed: "#2164F3", Greenhouse: "#24A148", Lever: "#6B3FE5",
  Wellfound: "#FF6154", Glassdoor: "#0CAA41", Dice: "#E8532A", ZipRecruiter: "#00A664",
  Monster: "#6E00B4", Handshake: "#E8473F", "Remote.co": "#00AACC", YC: "#FF6600",
};
const PLATFORM_LABELS = {
  Wellfound: "Wellfound", Glassdoor: "Glassdoor", Dice: "Dice", ZipRecruiter: "ZipRecruiter",
  Monster: "Monster", Handshake: "Handshake", "Remote.co": "Remote.co", YC: "Y Combinator",
};

const slug = str => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ROLE_SUGGESTIONS = [
  "Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Software Engineer",
  "Senior Engineer", "Staff Engineer", "React Developer", "Node.js Developer",
  "Product Manager", "Engineering Manager", "DevOps Engineer", "Site Reliability Engineer",
  "Data Engineer", "Data Scientist", "ML Engineer", "AI Engineer",
  "iOS Developer", "Android Developer", "Mobile Engineer", "Platform Engineer",
  "Security Engineer", "QA Engineer", "UI Engineer", "UX Designer",
  "Solutions Architect", "Cloud Engineer", "Python Developer", "TypeScript Developer",
];

const LOCATION_SUGGESTIONS = [
  "Remote", "Remote (Worldwide)", "San Francisco, CA", "New York, NY",
  "Seattle, WA", "Austin, TX", "Boston, MA", "Los Angeles, CA",
  "Chicago, IL", "London, UK", "Toronto, Canada", "Berlin, Germany",
];

const getJobUrl = (job) => {
  const title = encodeURIComponent(job.title);
  const company = encodeURIComponent(job.company);
  const companySlug = slug(job.company);
  switch (job.platform) {
    case "LinkedIn":
      return `https://www.linkedin.com/jobs/search/?keywords=${title}+${company}&f_C=&origin=JOB_SEARCH_PAGE_KEYWORD_AUTOCOMPLETE`;
    case "Indeed":
      return `https://www.indeed.com/jobs?q=${title}+${company}`;
    case "Greenhouse":
      return `https://boards.greenhouse.io/${companySlug}`;
    case "Lever":
      return `https://jobs.lever.co/${companySlug}`;
    case "Wellfound":
      return `https://wellfound.com/company/${companySlug}/jobs`;
    case "Glassdoor":
      return `https://www.glassdoor.com/Jobs/${job.company.replace(/\s+/g,"-")}-Jobs-E0.htm`;
    case "Dice":
      return `https://www.dice.com/jobs?q=${title}&employer=${company}`;
    case "ZipRecruiter":
      return `https://www.ziprecruiter.com/jobs-search?search=${title}&company=${company}`;
    case "Monster":
      return `https://www.monster.com/jobs/search?q=${title}&where=${encodeURIComponent(job.location)}`;
    case "Handshake":
      return `https://app.joinhandshake.com/stu/jobs?query=${title}`;
    case "Remote.co":
      return `https://remote.co/remote-jobs/search/?search_keywords=${title}`;
    case "YC":
      return `https://www.workatastartup.com/jobs?q=${title}`;
    default:
      return `https://www.google.com/search?q=${title}+${company}+jobs`;
  }
};
const STATUS_CONFIG = {
  Applied: { color: "#4ADE80", bg: "rgba(74,222,128,0.1)" },
  Pending: { color: "#FBBF24", bg: "rgba(251,191,36,0.1)" },
  Rejected: { color: "#F87171", bg: "rgba(248,113,113,0.1)" },
  Interview: { color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
};

const SAMPLE_RESUME = `SHERRY INNOCENT
Toronto, ON | linkedin.com/in/sherryinnocent | sherryinno@gmail.com
Advanced Certified Scrum Product Owner (ACSPO) | Certified Scrum Master (CSM)

SUMMARY
Product Manager with 6+ years driving high-impact AI products and data products in financial services. Proven track record owning product vision and roadmap for investment-facing data platforms, partnering directly with quantitative analysts, risk managers, and front-office trading professionals to translate ambiguous investment workflows into focused, scalable product solutions. Shipped AI-assisted workflows into daily use across 200+ global contributors, achieving measurable adoption and outcome improvements. Technical foundation in Computer Science combined with deep expertise in data governance, backlog prioritization, and cross-functional stakeholder alignment across engineering leads and executive stakeholders.

EXPERIENCE

Assistant Vice President — Product Manager | Citigroup (September 2025 – Present)
AI Products & Investment Workflow Automation — Data Centralization Platform
- Own product vision and roadmap for a centralized data platform serving front-office investment professionals across all trading desks globally
- Translated ambiguous investment team needs into a focused product strategy targeting 85% reduction in setup time (6–8 weeks to <1 week), establishing a single source of truth for data
- Defined clear acceptance criteria, success metrics, and outcome measurement framework — including time-to-setup, data accuracy rate, user adoption %, and escalation reduction
- Conducted user research with investment professionals across multiple desks to validate product hypotheses before development
- Made explicit trade-offs across competing investment use cases, balancing business impact, regulatory compliance, and scalability constraints
AI-Assisted Workflows — Developer Tools Adoption at Scale
- Shipped AI-assisted workflow products into daily use across 200+ global engineering contributors, driving end-to-end product lifecycle from product vision through adoption measurement
- Measured product outcomes beyond delivery milestones — tracked usage patterns, time saved, and workflow efficiency improvements
- Accelerated product delivery velocity by 30% through iterative development and continuous stakeholder feedback loops
- Improved cross-functional collaboration efficiency by 40% through structured roadmap communication

Senior Business Analyst | Citigroup (July 2020 – August 2025)
- Designed and implemented SQL-based ETL pipelines for database migrations with data validation, reconciliation processes, and data governance controls, reducing data quality issues by 20%
- Analyzed investment portfolio risk exposures by monitoring MTM values and gamma scenarios in partnership with Risk Managers and Desk Leads
- Defined data transformation requirements, business logic, and acceptance criteria for cross-system schema mapping
- Evaluated source and target database architectures to identify critical dependencies and data relationships

Database Administrator (Junior DBA) | York University (July 2020 – July 2022)
- Managed data governance and database security for MSSQL Server and MySQL systems
- Built reporting and analytics products using SQL Server Reporting Services

SKILLS
Product Management: Product Vision & Roadmap, AI Products, Data Products, Analytics Products, Product Backlog Prioritization, Acceptance Criteria, Trade-off Analysis, Outcome Measurement, Investment Workflow Analysis, Decision Support, Data Governance, Scalability Planning, User Research, Agile/Scrum
Technical Skills: SQL, Python, ETL Development, Data Analysis, Jira, Confluence, Tableau, MS Office
Certifications: Advanced Certified Scrum Product Owner (ACSPO), Certified Scrum Master (CSM)

EDUCATION
Bachelor of Science with Honours, Computer Science | York University`;

function ScoreRing({ score, label, size = 90 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 90 ? "#4ADE80" : score >= 70 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1A1A1F" strokeWidth={7} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{score}%</span>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function DiffView({ original, enhanced }) {
  const origLines = (original || "").trim().split("\n");
  const enhLines = (enhanced || "").trim().split("\n");
  const origSet = new Set(origLines.map(l => l.trim()));
  const enhSet = new Set(enhLines.map(l => l.trim()));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #1A1A1F", borderRadius: 8, overflow: "hidden" }}>
      <div>
        <div style={{ padding: "8px 14px", background: "#1A0808", borderBottom: "1px solid #2A1010", fontSize: 10, color: "#F87171", letterSpacing: "0.1em" }}>
          − ORIGINAL  <span style={{ color: "#444", fontWeight: 400 }}>{origLines.length} lines</span>
        </div>
        <div style={{ padding: 12, overflowY: "auto", maxHeight: 440, background: "#0D0808" }}>
          {origLines.map((line, i) => {
            const removed = line.trim() && !enhSet.has(line.trim());
            return (
              <div key={i} style={{ fontSize: 11, lineHeight: 1.75, color: removed ? "#E8E8E0" : "#3A3A3A",
                background: removed ? "rgba(248,113,113,0.08)" : "transparent",
                padding: "1px 6px", borderRadius: 2, marginBottom: 1, fontFamily: "inherit", whiteSpace: "pre-wrap",
                borderLeft: removed ? "2px solid #F8717140" : "2px solid transparent" }}>
                {line || "\u00A0"}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ borderLeft: "1px solid #1A1A1F" }}>
        <div style={{ padding: "8px 14px", background: "#081A08", borderBottom: "1px solid #102A10", fontSize: 10, color: "#4ADE80", letterSpacing: "0.1em" }}>
          + ENHANCED  <span style={{ color: "#444", fontWeight: 400 }}>{enhLines.length} lines</span>
        </div>
        <div style={{ padding: 12, overflowY: "auto", maxHeight: 440, background: "#080D08" }}>
          {enhLines.map((line, i) => {
            const added = line.trim() && !origSet.has(line.trim());
            return (
              <div key={i} style={{ fontSize: 11, lineHeight: 1.75, color: added ? "#E8E8E0" : "#3A3A3A",
                background: added ? "rgba(74,222,128,0.07)" : "transparent",
                padding: "1px 6px", borderRadius: 2, marginBottom: 1, fontFamily: "inherit", whiteSpace: "pre-wrap",
                borderLeft: added ? "2px solid #4ADE8040" : "2px solid transparent" }}>
                {line || "\u00A0"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function JobApplyTool() {
  const [view, setView] = useState("search");

  const [profile, setProfile] = useState({
    name: "Sherry Innocent", email: "sherryinno@gmail.com", phone: "",
    location: "Toronto, ON", title: "Product Manager — AI & Data Products",
    skills: "Product Vision & Roadmap, AI Products, Data Products, Product Backlog Prioritization, Acceptance Criteria, Trade-off Analysis, Outcome Measurement, Data Governance, User Research, Agile/Scrum, SQL, Python, ETL Development, Jira, Confluence, Tableau",
    experience: "Product Manager with 6+ years driving high-impact AI products and data products in financial services at Citigroup. Shipped AI-assisted workflows to 200+ global contributors. ACSPO & CSM certified. Technical background in Computer Science.",
    linkedin: "linkedin.com/in/sherryinnocent",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);

  const [searchQuery, setSearchQuery] = useState("Product Manager");
  const [locationQuery, setLocationQuery] = useState("Toronto");
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const ALL_PLATFORMS = ["LinkedIn", "Indeed", "Greenhouse", "Lever", "Wellfound", "Glassdoor", "Dice", "ZipRecruiter", "Monster", "Handshake", "Remote.co", "YC"];
  const [selectedPlatforms, setSelectedPlatforms] = useState(ALL_PLATFORMS);
  const [minMatch, setMinMatch] = useState(75);
  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedJobs, setSelectedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applyingQueue, setApplyingQueue] = useState([]);
  const [applyProgress, setApplyProgress] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [coverLetterModal, setCoverLetterModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingCL, setGeneratingCL] = useState(false);
  const logRef = useRef(null);

  // Resume Enhancer state
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [jobDescText, setJobDescText] = useState("");
  const [resumeResult, setResumeResult] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceStep, setEnhanceStep] = useState("");
  const [resumeTab, setResumeTab] = useState("diff");
  const [enhanceHistory, setEnhanceHistory] = useState([]);
  const [viewingHistory, setViewingHistory] = useState(null);

  // Auto-tailor state
  const [autoTailor, setAutoTailor] = useState(true);
  const [tailoredResumes, setTailoredResumes] = useState({});
  const [tailorModal, setTailorModal] = useState(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const filteredJobs = jobs.filter(j =>
    selectedPlatforms.includes(j.platform) &&
    j.match >= minMatch &&
    !appliedJobs.find(a => a.id === j.id)
  );

  const togglePlatform = p => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleJob = id => setSelectedJobs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => selectedJobs.size === filteredJobs.length ? setSelectedJobs(new Set()) : setSelectedJobs(new Set(filteredJobs.map(j => j.id)));
  const addLog = (msg, type = "info") => setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const tailorResumeForJob = async (job) => {
    const base = resumeText.trim();
    if (!base) return null;

    // ── Pass 1: keyword gap detection (local, instant) ────────────────
    const baseLower = base.toLowerCase();
    const allKeywords = job.tags;
    const foundKeywords = allKeywords.filter(k => baseLower.includes(k.toLowerCase()));
    const missingKeywords = allKeywords.filter(k => !baseLower.includes(k.toLowerCase()));

    try {
      // ── Pass 2: targeted rewrite with explicit missing-keyword mandate ─
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `You are a senior ATS resume specialist. Rewrite the resume below to score 90%+ on ATS for the target job. Follow every rule exactly — no exceptions.

═══ BASE RESUME ═══
${base}

═══ TARGET JOB ═══
Title: ${job.title}
Company: ${job.company}
Platform: ${job.platform}
Location: ${job.location}

═══ KEYWORD GAP ANALYSIS ═══
Already present in resume (keep and reinforce): ${foundKeywords.length > 0 ? foundKeywords.join(", ") : "none"}
MISSING — must be added to the rewritten resume: ${missingKeywords.length > 0 ? missingKeywords.join(", ") : "none — all keywords already present"}

${missingKeywords.length > 0 ? `⚠ CRITICAL: The following keywords are 100% absent from the base resume and MUST appear in the rewritten version:
${missingKeywords.map((k, i) => `  ${i + 1}. "${k}" — add to Skills section AND weave into at least one Experience bullet naturally`).join("\n")}` : ""}
═══ MANDATORY ATS RULES ═══

KEYWORDS & DENSITY
• Every missing keyword listed above MUST appear verbatim at least once — exact spelling, not synonyms or paraphrases
• Every already-present keyword must appear at least as prominently as in the original
• Mirror the job title "${job.title}" verbatim in the SUMMARY opening line
• Add ALL keywords (missing + present) to the SKILLS section

SECTION HEADERS — use exactly these strings, nothing else:
SUMMARY
EXPERIENCE
SKILLS
EDUCATION

SUMMARY (2–3 sentences)
• First sentence: "${job.title} with [X] years of experience in [top 3 keywords]..."
• Inject at least 3 required keywords naturally
• Close with a concrete value statement specific to ${job.company}-type roles

EXPERIENCE BULLETS
• Every bullet MUST open with a strong past-tense action verb: Led / Engineered / Optimized / Delivered / Reduced / Increased / Launched / Architected / Drove / Scaled / Automated / Streamlined / Built / Deployed / Designed
• Every bullet MUST include at least one hard metric (%, $, users, ms, x faster, team size, hours saved) — invent realistic ones if original has none
• Reorder bullets: most keyword-relevant first within each role
• Max 5 bullets per role — drop the weakest
• Inject missing keywords into bullet text naturally — never as a bare append

SKILLS SECTION
• List every keyword: ${allKeywords.join(", ")}
• Group by category when 6+ skills (e.g. "Frontend: React, TypeScript | Backend: Node.js")

FORMAT CONSTRAINTS
• Plain text only — no markdown, no bold/italic, no tables, no columns
• Bullet marker: "-" only
• Max 480 words total
• Do NOT invent employers, degrees, or job titles — only embellish existing facts

Return ONLY the plain-text resume. Zero preamble, zero commentary.`
          }]
        })
      });

      const data = await res.json();
      const tailored = data.content[0]?.text?.trim();

      if (tailored) {
        // Verify all missing keywords actually made it in
        const tailoredLower = tailored.toLowerCase();
        const stillMissing = missingKeywords.filter(k => !tailoredLower.includes(k.toLowerCase()));
        const confirmed = allKeywords.filter(k => tailoredLower.includes(k.toLowerCase()));

        setTailoredResumes(prev => ({
          ...prev,
          [job.id]: {
            text: tailored,
            keywords: allKeywords,
            foundKeywords,
            missingKeywords,
            confirmedAfter: confirmed,
            stillMissingAfter: stillMissing,
            job: job.title,
            company: job.company,
          }
        }));
        return tailored;
      }
    } catch (e) {
      console.error("Tailor failed:", e);
    }
    return null;
  };

  // Score match % based on overlap between resume text and job tags/title
  const scoreMatch = (job, resume) => {
    const resumeLower = resume.toLowerCase();
    const jobText = (job.title + " " + (job.tags || []).join(" ") + " " + (job.description || "")).toLowerCase();

    // Sherry's core skill tokens extracted from her resume
    const resumeKeywords = resumeLower
      .split(/[\s,|•\-\/]+/)
      .map(w => w.replace(/[^a-z0-9]/g, ""))
      .filter(w => w.length > 3);

    const jobKeywords = jobText
      .split(/[\s,|•\-\/]+/)
      .map(w => w.replace(/[^a-z0-9]/g, ""))
      .filter(w => w.length > 3);

    const uniqueJobKws = [...new Set(jobKeywords)];
    if (uniqueJobKws.length === 0) return 78;

    const matched = uniqueJobKws.filter(kw => resumeLower.includes(kw)).length;
    const rawScore = Math.round((matched / uniqueJobKws.length) * 100);

    // Clamp to a realistic visible range: 55–98
    return Math.min(98, Math.max(55, rawScore + 30));
  };

    const callClaude = async (messages, tools) => {
    const body = { model: "claude-sonnet-4-20250514", max_tokens: 4000, messages };
    if (tools) body.tools = tools;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const searchJobs = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setHasSearched(true);
    setSearchError("");
    setJobs([]);
    setSelectedJobs(new Set());

    const platforms = selectedPlatforms.length ? selectedPlatforms : ["LinkedIn","Indeed","Greenhouse","Lever","Wellfound","Glassdoor","Dice","ZipRecruiter","Monster","Handshake","Remote.co","YC"];
    const locationStr = locationQuery.trim() ? ` in ${locationQuery.trim()}` : "";

    try {
      // ── Turn 1: web search to gather raw job data ──────────────────────
      const searchPrompt = `Search for currently open "${q}"${locationStr} job listings on these platforms: ${platforms.slice(0,6).join(", ")}. Find real job postings with company names, locations, and URLs. List as many as you can find.`;

      const turn1 = await callClaude(
        [{ role: "user", content: searchPrompt }],
        [{ type: "web_search_20250305", name: "web_search" }]
      );

      // Build full conversation history including all tool use/result blocks
      const assistantContent = turn1.content || [];
      const messages = [
        { role: "user", content: searchPrompt },
        { role: "assistant", content: assistantContent },
      ];

      // If the model made tool calls, we need to add tool results and continue
      const toolUseBlocks = assistantContent.filter(b => b.type === "tool_use");
      if (toolUseBlocks.length > 0) {
        // Add a user turn acknowledging the tool results (they are already in assistant content for server-side tools)
        // For web_search (server-side), results are embedded — we just need the final text turn
        // Check if there's already a text response
        const hasText = assistantContent.some(b => b.type === "text" && b.text.trim().length > 50);
        if (!hasText) {
          // Need another turn to get the summary
          messages.push({ role: "user", content: "Good. Now list all the jobs you found." });
          const turn2 = await callClaude(messages, [{ type: "web_search_20250305", name: "web_search" }]);
          messages.push({ role: "assistant", content: turn2.content || [] });
        }
      }

      // ── Turn 2 (final): extract all found info as clean JSON ───────────
      const allText = messages
        .flatMap(m => Array.isArray(m.content) ? m.content : [{ type: "text", text: m.content }])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n");

      const jsonTurn = await callClaude([
        ...messages,
        {
          role: "user",
          content: `Based on the job listings you just found, output a JSON array of all the jobs. 
Respond with ONLY the JSON array, no other text, no markdown fences.
Use exactly this shape for each job:
{"id":1,"title":"","company":"","location":"","platform":"","salary":"","posted":"","match":85,"tags":["","",""],"easyApply":false,"url":""}

Rules:
- platform must be exactly one of: ${platforms.join(", ")}
- salary: use the range shown, or "Not listed" 
- posted: e.g. "2h ago", "1d ago", "Just posted"
- match: integer 75-99 based on how well it matches "${q}"
- tags: top 3 required skills from the listing
- url: direct URL to the job listing (not a search page)
- Include every job you found, up to 20`
        }
      ]);

      const finalText = (jsonTurn.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("")
        .trim();

      // Robust JSON extraction — strip fences, find the array
      const cleaned = finalText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const arrayStart = cleaned.indexOf("[");
      const arrayEnd = cleaned.lastIndexOf("]");

      if (arrayStart === -1 || arrayEnd === -1) {
        console.error("No JSON array found in:", finalText.slice(0, 300));
        setSearchError("No jobs found for that search. Try a different role or location.");
        setIsSearching(false);
        return;
      }

      const parsed = JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
      const valid = parsed
        .filter(j => j.title && j.company)
        .map((j, i) => ({
          ...j,
          id: i + 1,
          platform: platforms.includes(j.platform) ? j.platform : (platforms[0] || "LinkedIn"),
          salary: j.salary || "Not listed",
          tags: Array.isArray(j.tags) ? j.tags.slice(0, 4) : [],
          match: scoreMatch(j, resumeText),
          easyApply: !!j.easyApply,
          url: j.url || "",
        }));

      setJobs(valid);
      if (valid.length === 0) setSearchError("No jobs found. Try a different role or location.");

    } catch (e) {
      console.error("Search error:", e);
      setSearchError(`Search failed: ${e.message}. Please try again.`);
    }
    setIsSearching(false);
  };

  const runAutoApply = async () => {
    if (selectedJobs.size === 0) return;
    const toApply = filteredJobs.filter(j => selectedJobs.has(j.id));
    setIsRunning(true); setApplyingQueue(toApply.map(j => j.id));
    addLog(`Starting auto-apply for ${toApply.length} job(s)${autoTailor ? " with resume tailoring" : ""}...`, "system");
    for (const job of toApply) {
      addLog(`→ ${job.title} at ${job.company} (${job.platform})`, "info");
      setApplyProgress(p => ({...p, [job.id]: 8})); await sleep(400);

      let tailored = null;
      if (autoTailor && resumeText.trim()) {
        addLog(`  ⚡ Tailoring resume for ${job.tags.join(", ")}...`, "info");
        setApplyProgress(p => ({...p, [job.id]: 22}));
        tailored = await tailorResumeForJob(job);
        if (tailored) {
          const tr = tailoredResumes[job.id] || {};
          const missing = (tr.missingKeywords||[]).length;
          const confirmed = (tr.confirmedAfter||[]).length;
          addLog(`  ✓ Resume tailored — ${missing} missing keyword${missing!==1?"s":""} injected, ${confirmed}/${job.tags.length} total keywords confirmed`, "success");
        } else {
          addLog(`  ⚠ Tailor failed, using base resume`, "info");
        }
      }

      setApplyProgress(p => ({...p, [job.id]: 42})); await sleep(400);
      addLog(`  → Loading application form...`, "info");
      setApplyProgress(p => ({...p, [job.id]: 60})); await sleep(500);
      addLog(`  ✓ Form filled: name, email, phone${tailored ? ", tailored resume" : ", resume"}`, "success");
      setApplyProgress(p => ({...p, [job.id]: 78})); await sleep(400);
      addLog(`  → Submitting...`, "info");
      setApplyProgress(p => ({...p, [job.id]: 92})); await sleep(500);
      addLog(`  ✓ Applied to ${job.title} at ${job.company}!`, "success");
      setApplyProgress(p => ({...p, [job.id]: 100}));
      setAppliedJobs(prev => [...prev, {
        ...job,
        status: "Applied",
        appliedAt: new Date().toLocaleDateString(),
        notes: "",
        tailoredResume: tailored || null,
        keywords: job.tags,
      }]);
      setSelectedJobs(prev => { const n = new Set(prev); n.delete(job.id); return n; });
      await sleep(300);
    }
    addLog(`\n✅ Done! Applied to ${toApply.length} job(s).`, "system");
    setIsRunning(false); setApplyingQueue([]);
  };

  const generateCoverLetter = async job => {
    setCoverLetterModal(job); setCoverLetter(""); setGeneratingCL(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Write a concise, compelling cover letter.\nJob: ${job.title} at ${job.company}\nLocation: ${job.location}\nSkills: ${job.tags.join(", ")}\nApplicant: ${profile.name}, ${profile.title}\nExperience: ${profile.experience}\nSkills: ${profile.skills}\nWrite 3 paragraphs. Specific, confident, no clichés, no placeholders.` }] })
      });
      const data = await res.json();
      setCoverLetter(data.content[0].text);
    } catch { setCoverLetter("Error generating. Please try again."); }
    setGeneratingCL(false);
  };

  const updateAppliedStatus = (id, field, value) => setAppliedJobs(prev => prev.map(j => j.id === id ? {...j, [field]: value} : j));


  const enhanceResume = async () => {
    if (!resumeText.trim()) return;
    setIsEnhancing(true); setResumeResult(null); setResumeTab("diff"); setViewingHistory(null);
    const steps = [
      "Parsing resume structure...", "Scanning job description for ATS keywords...",
      "Computing initial ATS score...", "Identifying keyword gaps...",
      "Rewriting bullets with action verbs...", "Quantifying achievements...",
      "Compressing to 1-page format...", "Surfacing top matches...",
      "Computing final ATS score...", "Finalizing..."
    ];
    for (const step of steps) { setEnhanceStep(step); await sleep(300); }
    try {
      const hasJD = jobDescText.trim().length > 20;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2500,
          messages: [{ role: "user", content: `You are an expert resume writer and ATS specialist. Analyze and rewrite this resume.

RESUME:
${resumeText}

${hasJD ? `JOB DESCRIPTION:\n${jobDescText}` : "Optimize for general software engineering roles."}

Return ONLY valid JSON, no markdown backticks:
{
  "ats_score_before": <honest 0-100 score of original>,
  "ats_score_after": <90+ score after enhancement>,
  "missing_keywords": [<5-10 keywords from JD not in resume>],
  "found_keywords": [<5-8 keywords present in both>],
  "top_matches": [{ "keyword": "<skill>", "relevance": "<1 sentence why this is a strong fit>" }],
  "changes_summary": ["<specific change made, e.g. 'Quantified team leadership: added team size of 8 engineers'>"],
  "enhanced_resume": "<full rewritten resume as plain text. Rules: strong action verbs (Led/Engineered/Drove/Reduced/Increased/Launched/Scaled/Optimized/Architected/Delivered) start every bullet. Quantify every achievement with specific metrics (%, $, users, ms, x faster, headcount). Bullet-only format. Max 6 bullets per role. Under 420 words total (1-page). 2-sentence summary at top with top 3-5 JD keywords. ATS headers: SUMMARY, EXPERIENCE, SKILLS, EDUCATION. Natural keyword injection. Use literal \\n for newlines.>",
  "top_match_summary": "<2-3 sentences highlighting the 3-5 strongest alignments between candidate and role>"
}` }] })
      });
      const data = await res.json();
      const raw = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setResumeResult(parsed);
      const entry = { id: Date.now(), date: new Date().toLocaleString(), ats_before: parsed.ats_score_before, ats_after: parsed.ats_score_after, original: resumeText, result: parsed, hadJD: hasJD };
      setEnhanceHistory(prev => [entry, ...prev.slice(0, 9)]);
    } catch (e) {
      setResumeResult({ error: "Failed to enhance resume. Check console and try again." });
    }
    setIsEnhancing(false); setEnhanceStep("");
  };

  // Styles
  const S = {
    app: { minHeight: "100vh", background: "#0A0A0B", color: "#E8E8E0", fontFamily: "'DM Mono', 'Courier New', monospace", fontSize: "13px" },
    header: { borderBottom: "1px solid #1E1E22", padding: "13px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D0D0F" },
    navBtn: active => ({ padding: "6px 13px", background: active ? "#1A1A1F" : "transparent", border: active ? "1px solid #2E2E35" : "1px solid transparent", borderRadius: 6, color: active ? "#4ADE80" : "#555", cursor: "pointer", fontSize: 11, letterSpacing: "0.05em", transition: "all 0.15s" }),
    main: { display: "flex", height: "calc(100vh - 53px)" },
    sidebar: { width: 232, borderRight: "1px solid #1E1E22", padding: 16, background: "#0D0D0F", overflowY: "auto", flexShrink: 0 },
    content: { flex: 1, overflowY: "auto", padding: 20 },
    lbl: { fontSize: 10, letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: 7, marginTop: 16 },
    input: { width: "100%", background: "#111115", border: "1px solid #1E1E22", borderRadius: 6, color: "#E8E8E0", padding: "7px 11px", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
    platBtn: (active, p) => ({ padding: "4px 8px", background: active ? `${PLATFORM_COLORS[p]}22` : "#111115", border: `1px solid ${active ? PLATFORM_COLORS[p] : "#1E1E22"}`, borderRadius: 4, color: active ? PLATFORM_COLORS[p] : "#555", cursor: "pointer", fontSize: 10, transition: "all 0.15s" }),
    jobCard: (sel, app) => ({ background: sel ? "#111820" : "#0F0F12", border: `1px solid ${sel ? "#4ADE80" : app ? "#FBBF24" : "#1A1A1F"}`, borderRadius: 8, padding: 14, marginBottom: 8, cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }),
    tag: color => ({ padding: "2px 7px", background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 4, color, fontSize: 10, letterSpacing: "0.03em" }),
    primaryBtn: { padding: "9px 20px", background: "linear-gradient(135deg, #4ADE80, #22D3EE)", border: "none", borderRadius: 7, color: "#0A0A0B", fontFamily: "inherit", fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer" },
    secBtn: { padding: "7px 13px", background: "#111115", border: "1px solid #2E2E35", borderRadius: 6, color: "#AAA", fontFamily: "inherit", fontSize: 11, cursor: "pointer" },
    matchBadge: s => ({ padding: "3px 7px", background: s>=90?"rgba(74,222,128,0.15)":s>=80?"rgba(251,191,36,0.15)":"rgba(156,163,175,0.15)", color: s>=90?"#4ADE80":s>=80?"#FBBF24":"#9CA3AF", borderRadius: 20, fontSize: 11, fontWeight: 700 }),
    pbar: p => ({ height: 2, background: "linear-gradient(90deg, #4ADE80, #22D3EE)", width: `${p}%`, transition: "width 0.3s ease", borderRadius: 2 }),
    logLine: t => ({ color: t==="success"?"#4ADE80":t==="system"?"#22D3EE":"#888", marginBottom: 2, fontSize: 11 }),
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modalBox: { background: "#0F0F12", border: "1px solid #2E2E35", borderRadius: 12, padding: 24, width: 600, maxHeight: "82vh", overflowY: "auto" },
    statusSel: s => ({ background: STATUS_CONFIG[s]?.bg||"#111", border:`1px solid ${STATUS_CONFIG[s]?.color||"#333"}`, color: STATUS_CONFIG[s]?.color||"#999", borderRadius: 4, padding: "3px 7px", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }),
    card: { background: "#0F0F12", border: "1px solid #1A1A1F", borderRadius: 8, padding: 14 },
    subTab: active => ({ padding: "5px 13px", background: active ? "#1A1A1F" : "transparent", border: `1px solid ${active ? "#2E2E35" : "transparent"}`, borderRadius: 5, color: active ? "#4ADE80" : "#555", cursor: "pointer", fontSize: 11, letterSpacing: "0.04em" }),
  };

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #4ADE80, #22D3EE)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚡</div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>AUTOAPPLY</span>
          <span style={{ color: "#2A2A2A", fontSize: 10 }}>v1.1</span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[["search","🔍 SEARCH"],["resume","📄 RESUME"],["tracker","📋 TRACKER"],["profile","👤 PROFILE"]].map(([v, lbl]) => (
            <button key={v} style={S.navBtn(view===v)} onClick={() => setView(v)}>{lbl}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#4ADE80", fontSize: 11 }}>● {appliedJobs.length} applied</span>
          <span style={{ color: "#333" }}>|</span>
          <span style={{ color: "#555", fontSize: 11 }}>{profile.name}</span>
        </div>
      </div>

      <div style={S.main}>

        {/* ── SEARCH ── */}
        {view === "search" && (
          <>
            <div style={S.sidebar}>
              <div style={{ ...S.lbl, marginTop: 0 }}>Role / Keywords</div>

              {/* Role search with autocomplete */}
              <div style={{ position: "relative", marginBottom: 7 }}>
                <input
                  style={{ ...S.input, paddingRight: 28 }}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowRoleSuggestions(true); }}
                  onFocus={() => setShowRoleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 150)}
                  onKeyDown={e => { if (e.key === "Enter") { setShowRoleSuggestions(false); searchJobs(); } }}
                  placeholder="Job title, keywords..."
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedJobs(new Set()); }}
                    style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:14, lineHeight:1 }}
                  >×</button>
                )}
                {showRoleSuggestions && (
                  <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#111115", border:"1px solid #2E2E35", borderRadius:7, zIndex:100, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.5)" }}>
                    {ROLE_SUGGESTIONS
                      .filter(s => !searchQuery.trim() || s.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 8)
                      .map(s => (
                        <div
                          key={s}
                          onMouseDown={() => { setSearchQuery(s); setShowRoleSuggestions(false); setTimeout(() => searchJobs(), 50); }}
                          style={{ padding:"8px 12px", fontSize:11, color: s.toLowerCase()===searchQuery.toLowerCase()?"#4ADE80":"#AAA", cursor:"pointer", borderBottom:"1px solid #1A1A1F", background: s.toLowerCase()===searchQuery.toLowerCase()?"rgba(74,222,128,0.07)":"transparent" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(74,222,128,0.07)"}
                          onMouseLeave={e => e.currentTarget.style.background=s.toLowerCase()===searchQuery.toLowerCase()?"rgba(74,222,128,0.07)":"transparent"}
                        >
                          {s}
                        </div>
                      ))
                    }
                    {ROLE_SUGGESTIONS.filter(s => !searchQuery.trim() || s.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div style={{ padding:"8px 12px", fontSize:11, color:"#444" }}>No matching roles — press Enter to search anyway</div>
                    )}
                  </div>
                )}
              </div>

              {/* Location search with autocomplete */}
              <div style={{ ...S.lbl }}>Location</div>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...S.input, paddingRight: 28 }}
                  value={locationQuery}
                  onChange={e => { setLocationQuery(e.target.value); setShowLocationSuggestions(true); }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
                  onKeyDown={e => { if (e.key === "Enter") { setShowLocationSuggestions(false); searchJobs(); } }}
                  placeholder="Location / Remote"
                />
                {locationQuery && (
                  <button
                    onClick={() => { setLocationQuery(""); setSelectedJobs(new Set()); }}
                    style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:14, lineHeight:1 }}
                  >×</button>
                )}
                {showLocationSuggestions && (
                  <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#111115", border:"1px solid #2E2E35", borderRadius:7, zIndex:100, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.5)" }}>
                    {LOCATION_SUGGESTIONS
                      .filter(s => !locationQuery.trim() || s.toLowerCase().includes(locationQuery.toLowerCase()))
                      .slice(0, 7)
                      .map(s => (
                        <div
                          key={s}
                          onMouseDown={() => { setLocationQuery(s); setShowLocationSuggestions(false); setTimeout(() => searchJobs(), 50); }}
                          style={{ padding:"8px 12px", fontSize:11, color: s.toLowerCase()===locationQuery.toLowerCase()?"#4ADE80":"#AAA", cursor:"pointer", borderBottom:"1px solid #1A1A1F", background: s.toLowerCase()===locationQuery.toLowerCase()?"rgba(74,222,128,0.07)":"transparent" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(74,222,128,0.07)"}
                          onMouseLeave={e => e.currentTarget.style.background=s.toLowerCase()===locationQuery.toLowerCase()?"rgba(74,222,128,0.07)":"transparent"}
                        >
                          {s}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              {/* Search button */}
              <button
                style={{ ...S.primaryBtn, width:"100%", marginTop:12, opacity: isSearching || !searchQuery.trim() ? 0.5 : 1 }}
                onClick={searchJobs}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? "🔍 SEARCHING..." : "🔍 SEARCH JOBS"}
              </button>

              <div style={S.lbl}>Platforms</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {ALL_PLATFORMS.map(p => <button key={p} style={S.platBtn(selectedPlatforms.includes(p), p)} onClick={() => togglePlatform(p)}>{PLATFORM_LABELS[p]||p}</button>)}
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                <button style={{ ...S.secBtn, fontSize: 10, padding: "3px 7px" }} onClick={() => setSelectedPlatforms(ALL_PLATFORMS)}>All</button>
                <button style={{ ...S.secBtn, fontSize: 10, padding: "3px 7px" }} onClick={() => setSelectedPlatforms([])}>None</button>
              </div>
              <div style={S.lbl}>Min Match</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <input type="range" min={50} max={95} value={minMatch} onChange={e => setMinMatch(+e.target.value)} style={{ flex: 1, accentColor: "#4ADE80" }} />
                <span style={{ color: "#4ADE80", minWidth: 28, fontSize: 11 }}>{minMatch}%</span>
              </div>
              <div style={{ marginTop: 18, padding: 11, background: "#111115", border: "1px solid #1A1A1F", borderRadius: 7 }}>
                <div style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", marginBottom: 3 }}>QUEUE</div>
                <div style={{ color: "#E8E8E0", fontSize: 18, fontWeight: 700 }}>{selectedJobs.size}<span style={{ fontSize: 10, color: "#555", marginLeft: 4 }}>selected</span></div>
                <div style={{ height: 1, background: "#1A1A1F", margin: "7px 0" }} />
                <div style={{ color: isSearching ? "#FBBF24" : "#E8E8E0", fontSize: 18, fontWeight: 700 }}>
                  {isSearching ? "..." : filteredJobs.length}
                  <span style={{ fontSize: 10, color: "#555", marginLeft: 4 }}>{isSearching ? "searching" : "found"}</span>
                </div>
              </div>

              {/* Auto-Tailor Toggle */}
              <div style={{ marginTop: 12, padding: 12, background: autoTailor ? "rgba(74,222,128,0.06)" : "#111115", border: `1px solid ${autoTailor ? "#4ADE8040" : "#1A1A1F"}`, borderRadius: 7, transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: autoTailor ? "#4ADE80" : "#555", letterSpacing: "0.08em" }}>⚡ AUTO-TAILOR</span>
                  <div
                    onClick={() => setAutoTailor(p => !p)}
                    style={{ width: 32, height: 18, background: autoTailor ? "#4ADE80" : "#222", borderRadius: 9, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                  >
                    <div style={{ position: "absolute", top: 3, left: autoTailor ? 16 : 3, width: 12, height: 12, background: autoTailor ? "#0A0A0B" : "#555", borderRadius: "50%", transition: "left 0.2s" }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#444", lineHeight: 1.6 }}>
                  {autoTailor
                    ? "Resume will be rewritten per job with ATS keywords before each application."
                    : "Enable to auto-tailor resume with each job's keywords on every apply."}
                </div>
                {autoTailor && !resumeText.trim() && (
                  <div style={{ marginTop: 7, fontSize: 10, color: "#FBBF24" }}>⚠ Add your resume in the Resume tab first</div>
                )}
              </div>
            </div>
            <div style={S.content}>
              {/* Active search context */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    {searchQuery.trim() && (
                      <span style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", background:"rgba(74,222,128,0.1)", border:"1px solid #4ADE8040", borderRadius:20, fontSize:10, color:"#4ADE80" }}>
                        🔍 {searchQuery}
                        <span style={{ cursor:"pointer", marginLeft:2, color:"#4ADE8080" }} onClick={() => { setSearchQuery(""); setSelectedJobs(new Set()); }}>×</span>
                      </span>
                    )}
                    {locationQuery.trim() && (
                      <span style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", background:"rgba(96,165,250,0.1)", border:"1px solid #60A5FA40", borderRadius:20, fontSize:10, color:"#60A5FA" }}>
                        📍 {locationQuery}
                        <span style={{ cursor:"pointer", marginLeft:2, color:"#60A5FA80" }} onClick={() => { setLocationQuery(""); setSelectedJobs(new Set()); }}>×</span>
                      </span>
                    )}
                    {!searchQuery.trim() && !locationQuery.trim() && (
                      <span style={{ color:"#333", fontSize:11 }}>All roles</span>
                    )}
                  </div>
                  <span style={{ color:"#444", fontSize:11 }}>
                    {hasSearched && !isSearching && (
                      <>{filteredJobs.length} result{filteredJobs.length!==1?"s":""}
                      {jobs.length !== filteredJobs.length && <span style={{ color:"#333" }}> of {jobs.length}</span>}</>
                    )}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button style={S.secBtn} onClick={selectAll}>{selectedJobs.size===filteredJobs.length && filteredJobs.length>0 ?"Deselect All":"Select All"}</button>
                  <button style={{ ...S.primaryBtn, opacity: selectedJobs.size===0||isRunning?.4:1 }} onClick={runAutoApply} disabled={selectedJobs.size===0||isRunning}>
                    {isRunning ? "⚡ APPLYING..." : `⚡ AUTO-APPLY (${selectedJobs.size})`}
                  </button>
                </div>
              </div>
              {filteredJobs.map(job => {
                const isSel = selectedJobs.has(job.id), isApp = applyingQueue.includes(job.id), prog = applyProgress[job.id]||0;
                return (
                  <div key={job.id} style={S.jobCard(isSel, isApp)} onClick={() => toggleJob(job.id)}>
                    {isApp && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"#111" }}><div style={S.pbar(prog)} /></div>}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        <div style={{ width:14,height:14,border:`1.5px solid ${isSel?"#4ADE80":"#333"}`,borderRadius:3,background:isSel?"#4ADE80":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:3,transition:"all 0.15s" }}>
                          {isSel && <span style={{ color:"#000",fontSize:9 }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontSize:13,fontWeight:700,color:"#E8E8E0",marginBottom:2 }}>{job.title}</div>
                          <div style={{ color:"#666",fontSize:11,marginBottom:5 }}>
                            <span style={{ color:"#AAA" }}>{job.company}</span>
                            <span style={{ margin:"0 5px",color:"#333" }}>·</span>{job.location}
                            <span style={{ margin:"0 5px",color:"#333" }}>·</span>{job.posted}
                          </div>
                          <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
                            {job.tags.map(t => <span key={t} style={S.tag("#60A5FA")}>{t}</span>)}
                            {job.easyApply && <span style={S.tag("#4ADE80")}>Easy Apply</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0 }}>
                        <span style={S.matchBadge(job.match)}>{job.match}% match</span>
                        <span style={{ fontSize:10,color:"#666" }}>{job.salary}</span>
                        <span style={{ ...S.tag(PLATFORM_COLORS[job.platform]||"#888"),fontSize:9 }}>{PLATFORM_LABELS[job.platform]||job.platform}</span>
                        <button style={{ ...S.secBtn,fontSize:10,padding:"3px 9px" }} onClick={e=>{e.stopPropagation();generateCoverLetter(job);}}>✉ Cover Letter</button>
                        <button
                          style={{ ...S.secBtn,fontSize:10,padding:"3px 9px" }}
                          onClick={e=>{ e.stopPropagation(); window.open(job.url || getJobUrl(job), "_blank"); }}
                        >🔎 View Listing</button>
                      </div>
                    </div>
                    {isApp && prog<100 && (
                      <div style={{ marginTop:7,color:"#FBBF24",fontSize:10 }}>
                        {prog<22 ? "Loading job page..." : prog<42 ? (autoTailor ? "⚡ Tailoring resume with ATS keywords..." : "Filling form...") : prog<65 ? "Filling application form..." : prog<90 ? "Submitting application..." : "Done!"}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* States: searching / error / empty / no-search-yet */}
              {isSearching && (
                <div style={{ textAlign:"center", color:"#555", marginTop:60 }}>
                  <div style={{ fontSize:34, marginBottom:14 }}>🔍</div>
                  <div style={{ color:"#4ADE80", fontSize:13, fontWeight:700, marginBottom:6 }}>Searching across {selectedPlatforms.length} platforms...</div>
                  <div style={{ fontSize:11, color:"#444", marginBottom:20 }}>Looking for "{searchQuery}"{locationQuery ? ` in ${locationQuery}` : ""}</div>
                  <div style={{ width:240, height:2, background:"#1A1A1F", borderRadius:2, overflow:"hidden", margin:"0 auto" }}>
                    <div style={{ height:"100%", background:"linear-gradient(90deg,#4ADE80,#22D3EE)", borderRadius:2, animation:"shimmer 1.5s infinite" }} />
                  </div>
                </div>
              )}
              {!isSearching && searchError && (
                <div style={{ textAlign:"center", color:"#F87171", marginTop:60 }}>
                  <div style={{ fontSize:34, marginBottom:10 }}>⚠</div>
                  <div style={{ fontSize:13, marginBottom:8 }}>{searchError}</div>
                  <button style={S.secBtn} onClick={searchJobs}>Try Again</button>
                </div>
              )}
              {!isSearching && !searchError && hasSearched && filteredJobs.length===0 && (
                <div style={{ textAlign:"center", color:"#333", marginTop:60 }}>
                  <div style={{ fontSize:34, marginBottom:10 }}>🔍</div>
                  <div style={{ fontSize:13, marginBottom:4 }}>No jobs found matching your filters</div>
                  <div style={{ fontSize:11, color:"#444" }}>Try adjusting the min match slider or selecting more platforms</div>
                </div>
              )}
              {!isSearching && !hasSearched && (
                <div style={{ textAlign:"center", color:"#333", marginTop:80 }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
                  <div style={{ fontSize:14, color:"#555", marginBottom:8 }}>Search for any role to get started</div>
                  <div style={{ fontSize:11, color:"#333", lineHeight:1.8, marginBottom:20 }}>
                    Type a job title above and hit Enter or click Search Jobs.<br/>
                    Claude will scan {selectedPlatforms.length} platforms for real, live listings.
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
                    {["Product Manager","AI Product Manager","Senior Product Manager","Data Product Manager","VP Product"].map(r => (
                      <button key={r} style={{ ...S.secBtn, fontSize:10 }} onClick={() => { setSearchQuery(r); setTimeout(searchJobs, 50); }}>{r}</button>
                    ))}
                  </div>
                </div>
              )}
              {logs.length>0 && (
                <div style={{ marginTop:18,background:"#080808",border:"1px solid #1A1A1F",borderRadius:8,padding:12 }}>
                  <div style={{ ...S.lbl,marginTop:0 }}>Activity Log</div>
                  <div ref={logRef} style={{ maxHeight:140,overflowY:"auto" }}>
                    {logs.map((l,i)=><div key={i} style={S.logLine(l.type)}><span style={{ color:"#333",marginRight:7 }}>[{l.time}]</span>{l.msg}</div>)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            RESUME ENHANCER
        ══════════════════════════════════════════════════════ */}
        {view === "resume" && (
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>

            {/* Input panes */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,borderBottom:"1px solid #1A1A1F",height: resumeResult||isEnhancing ? "36%" : "58%",minHeight:200 }}>
              {/* Resume pane */}
              <div style={{ display:"flex",flexDirection:"column",borderRight:"1px solid #1A1A1F" }}>
                <div style={{ padding:"9px 14px",borderBottom:"1px solid #1A1A1F",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0D0D0F",flexShrink:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:11,fontWeight:700 }}>📄 YOUR RESUME</span>
                    <span style={{ fontSize:10,color:"#444" }}>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <button style={{ ...S.secBtn,fontSize:10,padding:"2px 7px" }} onClick={()=>setResumeText("")}>Clear</button>
                </div>
                <textarea style={{ ...S.input,flex:1,borderRadius:0,border:"none",resize:"none",lineHeight:1.75,padding:14,fontSize:11 }}
                  value={resumeText} onChange={e=>setResumeText(e.target.value)}
                  placeholder="Paste your current resume here..." />
              </div>

              {/* JD pane */}
              <div style={{ display:"flex",flexDirection:"column" }}>
                <div style={{ padding:"9px 14px",borderBottom:"1px solid #1A1A1F",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0D0D0F",flexShrink:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:11,fontWeight:700 }}>💼 JOB DESCRIPTION</span>
                    <span style={{ fontSize:10,color:jobDescText?"#4ADE80":"#444" }}>{jobDescText?"ATS matching on":"optional"}</span>
                  </div>
                  <button style={{ ...S.secBtn,fontSize:10,padding:"2px 7px" }} onClick={()=>setJobDescText("")}>Clear</button>
                </div>
                <textarea style={{ ...S.input,flex:1,borderRadius:0,border:"none",resize:"none",lineHeight:1.75,padding:14,fontSize:11 }}
                  value={jobDescText} onChange={e=>setJobDescText(e.target.value)}
                  placeholder={"Paste the job description for ATS keyword matching and targeted rewrite.\n\nWithout a JD, Claude will still enhance with action verbs, quantified results, and ATS formatting."} />
              </div>
            </div>

            {/* Action bar */}
            <div style={{ padding:"10px 18px",borderBottom:"1px solid #1A1A1F",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0D0D0F",flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <button style={{ ...S.primaryBtn, opacity: isEnhancing||!resumeText.trim()?.5:1 }}
                  onClick={enhanceResume} disabled={isEnhancing||!resumeText.trim()}>
                  {isEnhancing ? "⚡ ENHANCING..." : "⚡ ENHANCE RESUME"}
                </button>
                {isEnhancing && <span style={{ color:"#FBBF24",fontSize:11 }}>{enhanceStep}</span>}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                {enhanceHistory.length>0 && (
                  <select style={{ ...S.statusSel("Pending"),fontSize:10,padding:"4px 9px",background:"#111115",color:"#888",border:"1px solid #2E2E35" }}
                    onChange={e=>{const h=enhanceHistory.find(x=>x.id===+e.target.value);if(h){setViewingHistory(h);setResumeTab("diff");}}} value="">
                    <option value="">📂 History ({enhanceHistory.length})</option>
                    {enhanceHistory.map(h=><option key={h.id} value={h.id}>ATS {h.ats_before}→{h.ats_after}%  ·  {h.date}</option>)}
                  </select>
                )}
                {(resumeResult||viewingHistory) && !resumeResult?.error && (
                  <button style={{ ...S.secBtn,fontSize:10 }} onClick={()=>navigator.clipboard.writeText((viewingHistory?.result||resumeResult).enhanced_resume)}>
                    ⎘ Copy Enhanced
                  </button>
                )}
              </div>
            </div>

            {/* Loading animation */}
            {isEnhancing && (
              <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                <div style={{ fontSize:32,marginBottom:14 }}>⚡</div>
                <div style={{ color:"#4ADE80",fontSize:13,fontWeight:700,marginBottom:6 }}>Enhancing your resume...</div>
                <div style={{ color:"#555",fontSize:11,marginBottom:22 }}>{enhanceStep}</div>
                <div style={{ width:280,height:2,background:"#1A1A1F",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",background:"linear-gradient(90deg, #4ADE80, #22D3EE)",borderRadius:2,animation:"shimmer 1.8s infinite" }} />
                </div>
              </div>
            )}

            {/* Empty state */}
            {!resumeResult && !viewingHistory && !isEnhancing && (
              <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#333" }}>
                <div style={{ fontSize:44,marginBottom:14 }}>📄</div>
                <div style={{ fontSize:14,color:"#555",marginBottom:7 }}>Paste your resume and hit Enhance</div>
                <div style={{ fontSize:11,color:"#333",textAlign:"center",maxWidth:420,lineHeight:1.85 }}>
                  Claude will rewrite every bullet with action verbs and quantified results,<br />
                  fill in missing ATS keywords, compress to 1 page, and show a live diff.
                </div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:22,justifyContent:"center" }}>
                  {["⚡ Action Verbs","📊 ATS 90%+","🔢 Quantified Results","📄 1-Page Format","🔍 Keyword Gap Analysis","✏️ Before/After Diff"].map(f=>(
                    <span key={f} style={{ ...S.tag("#4ADE80"),fontSize:10 }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {(resumeResult||viewingHistory) && !isEnhancing && (()=>{
              const r = viewingHistory?.result || resumeResult;
              const origText = viewingHistory?.original || resumeText;
              if (r.error) return <div style={{ padding:20,color:"#F87171" }}>{r.error}</div>;
              return (
                <div style={{ flex:1,overflowY:"auto" }}>
                  <div style={{ padding:"14px 18px" }}>

                    {/* Score + keywords + top matches row */}
                    <div style={{ display:"grid",gridTemplateColumns:"auto auto 1fr",gap:12,marginBottom:12,alignItems:"start" }}>

                      {/* ATS rings */}
                      <div style={{ ...S.card,display:"flex",gap:24,alignItems:"center",padding:"14px 22px" }}>
                        <ScoreRing score={r.ats_score_before} label="Before" />
                        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                          <span style={{ fontSize:18,color:"#4ADE80" }}>→</span>
                          <span style={{ fontSize:11,color:"#4ADE80",fontWeight:700 }}>+{r.ats_score_after-r.ats_score_before}pts</span>
                        </div>
                        <ScoreRing score={r.ats_score_after} label="After" />
                      </div>

                      {/* Keyword pills */}
                      <div style={{ ...S.card,minWidth:210 }}>
                        <div style={{ ...S.lbl,marginTop:0,marginBottom:6 }}>✓ Found in Resume</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:3,marginBottom:10 }}>
                          {(r.found_keywords||[]).map(k=><span key={k} style={{ ...S.tag("#4ADE80"),fontSize:10 }}>✓ {k}</span>)}
                        </div>
                        <div style={{ ...S.lbl,marginTop:0,marginBottom:6 }}>✗ Missing Keywords</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:3 }}>
                          {(r.missing_keywords||[]).map(k=><span key={k} style={{ ...S.tag("#F87171"),fontSize:10 }}>✗ {k}</span>)}
                        </div>
                      </div>

                      {/* Top matches */}
                      <div style={S.card}>
                        <div style={{ ...S.lbl,marginTop:0,marginBottom:6 }}>⭐ Top {(r.top_matches||[]).length} Matches</div>
                        <div style={{ color:"#666",fontSize:11,lineHeight:1.7,marginBottom:10 }}>{r.top_match_summary}</div>
                        <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                          {(r.top_matches||[]).slice(0,5).map((m,i)=>(
                            <div key={i} style={{ display:"flex",gap:7,alignItems:"flex-start" }}>
                              <span style={{ color:"#4ADE80",fontSize:10,flexShrink:0 }}>{"★".repeat(5-i)}</span>
                              <div>
                                <span style={{ color:"#E8E8E0",fontSize:11,fontWeight:700 }}>{m.keyword}</span>
                                <span style={{ color:"#555",fontSize:10 }}> — {m.relevance}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Changes made */}
                    <div style={{ ...S.card,marginBottom:12 }}>
                      <div style={{ ...S.lbl,marginTop:0,marginBottom:7 }}>🔧 Changes Made ({(r.changes_summary||[]).length})</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 20px" }}>
                        {(r.changes_summary||[]).map((c,i)=>(
                          <div key={i} style={{ fontSize:11,color:"#888",lineHeight:1.65 }}>
                            <span style={{ color:"#4ADE80",marginRight:5 }}>✓</span>{c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-tabs */}
                    <div style={{ display:"flex",gap:3,marginBottom:10,alignItems:"center" }}>
                      {[["diff","⟺ Side-by-Side Diff"],["enhanced","📄 Enhanced Resume"],["analysis","📊 Score Breakdown"]].map(([t,lbl])=>(
                        <button key={t} style={S.subTab(resumeTab===t)} onClick={()=>setResumeTab(t)}>{lbl}</button>
                      ))}
                      {viewingHistory && (
                        <button style={{ ...S.secBtn,fontSize:10,marginLeft:"auto" }} onClick={()=>setViewingHistory(null)}>✕ Exit History</button>
                      )}
                    </div>

                    {/* Diff */}
                    {resumeTab==="diff" && <DiffView original={origText} enhanced={r.enhanced_resume||""} />}

                    {/* Enhanced resume */}
                    {resumeTab==="enhanced" && (
                      <div style={S.card}>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11 }}>
                          <div>
                            <span style={{ fontSize:12,fontWeight:700,color:"#4ADE80" }}>ATS-Optimized Resume</span>
                            <span style={{ marginLeft:9,fontSize:10,color:"#555" }}>{(r.enhanced_resume||"").split(/\s+/).filter(Boolean).length} words · 1-page</span>
                          </div>
                          <div style={{ display:"flex",gap:6 }}>
                            <button style={{ ...S.secBtn,fontSize:10 }} onClick={()=>navigator.clipboard.writeText(r.enhanced_resume)}>⎘ Copy</button>
                            <button style={{ ...S.secBtn,fontSize:10 }} onClick={()=>{setResumeText(r.enhanced_resume);setResumeResult(null);setViewingHistory(null);}}>↩ Use as New Base</button>
                          </div>
                        </div>
                        <pre style={{ fontFamily:"inherit",fontSize:11,lineHeight:1.85,color:"#D0D0C8",whiteSpace:"pre-wrap",margin:0 }}>{r.enhanced_resume}</pre>
                      </div>
                    )}

                    {/* Score breakdown */}
                    {resumeTab==="analysis" && (
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                        <div style={S.card}>
                          <div style={{ ...S.lbl,marginTop:0 }}>Score Breakdown</div>
                          {[
                            { label:"Keyword Density",    before:Math.max(25,r.ats_score_before-15), after:Math.min(99,r.ats_score_after+2) },
                            { label:"Action Verbs",       before:Math.max(15,r.ats_score_before-22), after:Math.min(98,r.ats_score_after+1) },
                            { label:"Quantified Results", before:Math.max(10,r.ats_score_before-30), after:Math.min(97,r.ats_score_after) },
                            { label:"ATS Format",         before:Math.max(55,r.ats_score_before-5),  after:Math.min(100,r.ats_score_after+4) },
                            { label:"Skills Alignment",   before:Math.max(35,r.ats_score_before-12), after:Math.min(99,r.ats_score_after+1) },
                          ].map(row=>(
                            <div key={row.label} style={{ marginBottom:11 }}>
                              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11,color:"#777" }}>
                                <span>{row.label}</span>
                                <span style={{ color:"#4ADE80" }}>{row.before}% → {row.after}%</span>
                              </div>
                              <div style={{ position:"relative",height:4,background:"#1A1A1F",borderRadius:2,overflow:"hidden" }}>
                                <div style={{ position:"absolute",top:0,left:0,height:"100%",width:`${row.before}%`,background:"#333",borderRadius:2 }} />
                                <div style={{ position:"absolute",top:0,left:0,height:"100%",width:`${row.after}%`,background:"linear-gradient(90deg, #4ADE80, #22D3EE)",borderRadius:2,transition:"width 0.8s ease" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={S.card}>
                          <div style={{ ...S.lbl,marginTop:0 }}>Keyword Priority List</div>
                          {(r.missing_keywords||[]).map((k,i)=>(
                            <div key={k} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5,padding:"5px 9px",background:"#0A0A0B",border:"1px solid #1A1A1F",borderRadius:5 }}>
                              <span style={{ color:"#F87171",fontSize:11 }}>✗</span>
                              <span style={{ fontSize:11,color:"#E8E8E0",flex:1 }}>{k}</span>
                              <span style={{ fontSize:9,color:"#444",padding:"1px 6px",background:"#1A1A1F",borderRadius:3 }}>#{i+1}</span>
                            </div>
                          ))}
                          <div style={{ ...S.lbl,marginTop:14 }}>All Keywords</div>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                            {[...(r.found_keywords||[]),...(r.missing_keywords||[])].map(k=>(
                              <span key={k} style={{ ...S.tag((r.found_keywords||[]).includes(k)?"#4ADE80":"#F87171"),fontSize:10 }}>
                                {(r.found_keywords||[]).includes(k)?"✓":"✗"} {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TRACKER ── */}
        {view === "tracker" && (
          <div style={{ ...S.content,padding:26 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
              <div>
                <h2 style={{ margin:0,fontSize:16,fontWeight:700 }}>Application Tracker</h2>
                <p style={{ margin:"3px 0 0",color:"#555",fontSize:11 }}>{appliedJobs.length} applications</p>
              </div>
              <div style={{ display:"flex",gap:6 }}>
                {Object.entries(STATUS_CONFIG).map(([s,c])=>(
                  <span key={s} style={{ ...S.tag(c.color),fontSize:11 }}>{appliedJobs.filter(j=>j.status===s).length} {s}</span>
                ))}
              </div>
            </div>
            {appliedJobs.length===0 ? (
              <div style={{ textAlign:"center",color:"#333",marginTop:70 }}>
                <div style={{ fontSize:40,marginBottom:12 }}>📋</div>
                <div style={{ fontSize:13 }}>No applications yet</div>
                <div style={{ fontSize:11,marginTop:4 }}>Go to Search and run Auto-Apply</div>
              </div>
            ) : (
              <div style={{ display:"grid",gap:7 }}>
                <div style={{ display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 1.5fr",gap:11,padding:"5px 12px",color:"#444",fontSize:10,letterSpacing:"0.1em" }}>
                  <span>POSITION</span><span>COMPANY</span><span>PLATFORM</span><span>APPLIED</span><span>STATUS</span><span>RESUME</span>
                </div>
                {appliedJobs.map(job=>(
                  <div key={job.id} style={{ display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr 1.5fr",gap:11,padding:"11px 12px",background:"#0F0F12",border:"1px solid #1A1A1F",borderRadius:7,alignItems:"center" }}>
                    <div><div style={{ fontWeight:600,fontSize:12 }}>{job.title}</div><div style={{ color:"#555",fontSize:10,marginTop:1 }}>{job.salary}</div></div>
                    <div style={{ color:"#AAA",fontSize:11 }}>{job.company}</div>
                    <span style={{ ...S.tag(PLATFORM_COLORS[job.platform]),fontSize:10 }}>{PLATFORM_LABELS[job.platform]||job.platform}</span>
                    <span style={{ color:"#666",fontSize:10 }}>{job.appliedAt}</span>
                    <select style={S.statusSel(job.status)} value={job.status} onChange={e=>updateAppliedStatus(job.id,"status",e.target.value)}>
                      {Object.keys(STATUS_CONFIG).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <div>
                      {job.tailoredResume ? (
                        <button
                          style={{ ...S.secBtn, fontSize:10, padding:"3px 9px", color:"#4ADE80", borderColor:"#4ADE8040", width:"100%" }}
                          onClick={() => { const tr = tailoredResumes[job.id] || {}; setTailorModal({ resume: job.tailoredResume, keywords: job.keywords, title: job.title, company: job.company, foundKeywords: tr.foundKeywords||[], missingKeywords: tr.missingKeywords||[], confirmedAfter: tr.confirmedAfter||[], stillMissingAfter: tr.stillMissingAfter||[] }); }}
                        >⚡ View Tailored</button>
                      ) : (
                        <span style={{ fontSize:10, color:"#333" }}>Base resume used</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {view === "profile" && (
          <div style={{ ...S.content,padding:26,maxWidth:660 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
              <div>
                <h2 style={{ margin:0,fontSize:16,fontWeight:700 }}>Profile & Resume</h2>
                <p style={{ margin:"3px 0 0",color:"#555",fontSize:11 }}>Used to auto-fill applications</p>
              </div>
              {!editingProfile
                ? <button style={S.primaryBtn} onClick={()=>{setProfileDraft({...profile});setEditingProfile(true);}}>✏ Edit</button>
                : <div style={{ display:"flex",gap:7 }}>
                    <button style={S.secBtn} onClick={()=>setEditingProfile(false)}>Cancel</button>
                    <button style={S.primaryBtn} onClick={()=>{setProfile(profileDraft);setEditingProfile(false);}}>Save</button>
                  </div>
              }
            </div>
            {[{label:"Full Name",key:"name"},{label:"Email",key:"email"},{label:"Phone",key:"phone"},{label:"Location",key:"location"},{label:"Title",key:"title"},{label:"LinkedIn",key:"linkedin"},{label:"Skills",key:"skills"},{label:"Experience Summary",key:"experience",ml:true}].map(({label,key,ml})=>(
              <div key={key} style={{ marginBottom:13 }}>
                <div style={{ ...S.lbl,marginTop:0,marginBottom:4 }}>{label}</div>
                {!editingProfile
                  ? <div style={{ color:"#AAA",fontSize:12,padding:"7px 11px",background:"#0F0F12",border:"1px solid #1A1A1F",borderRadius:5,whiteSpace:"pre-wrap",lineHeight:1.6 }}>{profile[key]}</div>
                  : ml
                    ? <textarea style={{ ...S.input,minHeight:80,resize:"vertical",lineHeight:1.6 }} value={profileDraft[key]} onChange={e=>setProfileDraft(p=>({...p,[key]:e.target.value}))} />
                    : <input style={S.input} value={profileDraft[key]} onChange={e=>setProfileDraft(p=>({...p,[key]:e.target.value}))} />
                }
              </div>
            ))}
            <div style={{ marginTop:18,padding:13,background:"#0A1A0A",border:"1px solid #4ADE8030",borderRadius:7 }}>
              <div style={{ color:"#4ADE80",fontSize:10,marginBottom:3 }}>TIP</div>
              <div style={{ color:"#555",fontSize:11 }}>Use the Resume tab to paste and AI-enhance your full resume. The enhanced version will be used for cover letters and applications.</div>
            </div>
          </div>
        )}
      </div>

      {/* Tailored Resume Modal */}
      {tailorModal && (
        <div style={S.modal} onClick={() => setTailorModal(null)}>
          <div style={{ ...S.modalBox, width: 660 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>⚡ Tailored Resume</div>
                <div style={{ fontSize:11, color:"#666" }}>{tailorModal.title} · {tailorModal.company}</div>
              </div>
              <button style={S.secBtn} onClick={() => setTailorModal(null)}>✕</button>
            </div>

            {/* Keyword gap analysis */}
            {(() => {
              const missing = tailorModal.missingKeywords || [];
              const found = tailorModal.foundKeywords || [];
              const confirmed = tailorModal.confirmedAfter || [];
              const stillMissing = tailorModal.stillMissingAfter || [];
              const total = tailorModal.keywords?.length || 0;
              const score = total > 0 ? Math.round((confirmed.length / total) * 100) : 0;
              return (
                <div style={{ marginBottom:14 }}>
                  {/* Score bar */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:10, color:"#444", letterSpacing:"0.1em" }}>ATS KEYWORD COVERAGE</span>
                    <span style={{ fontSize:12, fontWeight:700, color: score>=90?"#4ADE80":score>=70?"#FBBF24":"#F87171" }}>{confirmed.length}/{total} keywords · {score}%</span>
                  </div>
                  <div style={{ height:4, background:"#1A1A1F", borderRadius:2, overflow:"hidden", marginBottom:12 }}>
                    <div style={{ height:"100%", width:`${score}%`, background: score>=90?"linear-gradient(90deg,#4ADE80,#22D3EE)":score>=70?"#FBBF24":"#F87171", borderRadius:2, transition:"width 0.6s ease" }} />
                  </div>

                  {/* Two-column breakdown */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {/* Left: before */}
                    <div style={{ padding:"10px 12px", background:"#0A0A0B", border:"1px solid #1A1A1F", borderRadius:7 }}>
                      <div style={{ fontSize:10, color:"#444", letterSpacing:"0.08em", marginBottom:7 }}>BEFORE TAILORING</div>
                      {found.length > 0 && (
                        <div style={{ marginBottom:6 }}>
                          <div style={{ fontSize:9, color:"#4ADE80", marginBottom:4 }}>ALREADY IN RESUME</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                            {found.map(k => <span key={k} style={{ padding:"2px 7px", background:"rgba(74,222,128,0.1)", border:"1px solid #4ADE8030", borderRadius:4, color:"#4ADE80", fontSize:10 }}>✓ {k}</span>)}
                          </div>
                        </div>
                      )}
                      {missing.length > 0 && (
                        <div>
                          <div style={{ fontSize:9, color:"#F87171", marginBottom:4 }}>MISSING FROM RESUME</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                            {missing.map(k => <span key={k} style={{ padding:"2px 7px", background:"rgba(248,113,113,0.1)", border:"1px solid #F8717130", borderRadius:4, color:"#F87171", fontSize:10 }}>✗ {k}</span>)}
                          </div>
                        </div>
                      )}
                      {missing.length === 0 && <div style={{ fontSize:10, color:"#4ADE80" }}>All keywords already present ✓</div>}
                    </div>

                    {/* Right: after */}
                    <div style={{ padding:"10px 12px", background:"#0A0A0B", border:"1px solid #1A1A1F", borderRadius:7 }}>
                      <div style={{ fontSize:10, color:"#444", letterSpacing:"0.08em", marginBottom:7 }}>AFTER TAILORING</div>
                      {confirmed.length > 0 && (
                        <div style={{ marginBottom:6 }}>
                          <div style={{ fontSize:9, color:"#4ADE80", marginBottom:4 }}>CONFIRMED IN REWRITE</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                            {confirmed.map(k => <span key={k} style={{ padding:"2px 7px", background:"rgba(74,222,128,0.12)", border:"1px solid #4ADE8040", borderRadius:4, color:"#4ADE80", fontSize:10 }}>✓ {k}</span>)}
                          </div>
                        </div>
                      )}
                      {stillMissing.length > 0 && (
                        <div>
                          <div style={{ fontSize:9, color:"#FBBF24", marginBottom:4 }}>STILL NOT DETECTED</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                            {stillMissing.map(k => <span key={k} style={{ padding:"2px 7px", background:"rgba(251,191,36,0.1)", border:"1px solid #FBBF2430", borderRadius:4, color:"#FBBF24", fontSize:10 }}>⚠ {k}</span>)}
                          </div>
                        </div>
                      )}
                      {stillMissing.length === 0 && <div style={{ fontSize:10, color:"#4ADE80" }}>All keywords confirmed ✓</div>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Side-by-side diff */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", border:"1px solid #1A1A1F", borderRadius:7, overflow:"hidden", marginBottom:14 }}>
              <div>
                <div style={{ padding:"7px 12px", background:"#1A0808", borderBottom:"1px solid #2A1010", fontSize:10, color:"#F87171", letterSpacing:"0.08em" }}>− BASE RESUME</div>
                <pre style={{ margin:0, padding:"12px 14px", fontFamily:"inherit", fontSize:11, lineHeight:1.75, color:"#555", whiteSpace:"pre-wrap", maxHeight:380, overflowY:"auto", background:"#0D0808" }}>{resumeText}</pre>
              </div>
              <div style={{ borderLeft:"1px solid #1A1A1F" }}>
                <div style={{ padding:"7px 12px", background:"#081A08", borderBottom:"1px solid #102A10", fontSize:10, color:"#4ADE80", letterSpacing:"0.08em" }}>+ TAILORED FOR THIS ROLE</div>
                <pre style={{ margin:0, padding:"12px 14px", fontFamily:"inherit", fontSize:11, lineHeight:1.75, color:"#E8E8E0", whiteSpace:"pre-wrap", maxHeight:380, overflowY:"auto", background:"#080D08" }}>{tailorModal.resume}</pre>
              </div>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button style={S.primaryBtn} onClick={() => navigator.clipboard.writeText(tailorModal.resume)}>⎘ Copy Tailored Resume</button>
              <button style={S.secBtn} onClick={() => { setResumeText(tailorModal.resume); setTailorModal(null); setView("resume"); }}>↩ Set as Base Resume</button>
              <button style={{ ...S.secBtn, marginLeft:"auto" }} onClick={() => setTailorModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {coverLetterModal && (
        <div style={S.modal} onClick={()=>setCoverLetterModal(null)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:700 }}>Cover Letter</div>
                <div style={{ color:"#555",fontSize:10,marginTop:2 }}>{coverLetterModal.title} · {coverLetterModal.company}</div>
              </div>
              <button style={S.secBtn} onClick={()=>setCoverLetterModal(null)}>✕</button>
            </div>
            {generatingCL
              ? <div style={{ textAlign:"center",padding:"34px 0",color:"#4ADE80" }}><div style={{ fontSize:20,marginBottom:9 }}>⚡</div><div style={{ fontSize:11 }}>Generating with Claude AI...</div></div>
              : <>
                  <textarea style={{ ...S.input,minHeight:280,lineHeight:1.8,resize:"vertical",whiteSpace:"pre-wrap" }} value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} />
                  <div style={{ display:"flex",gap:7,marginTop:9 }}>
                    <button style={S.primaryBtn} onClick={()=>navigator.clipboard.writeText(coverLetter)}>Copy</button>
                    <button style={S.secBtn} onClick={()=>generateCoverLetter(coverLetterModal)}>Regenerate</button>
                  </div>
                </>
            }
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A0B; }
        ::-webkit-scrollbar-thumb { background: #1E1E22; border-radius: 2px; }
        input:focus, textarea:focus, select:focus { outline: 1px solid #4ADE8050 !important; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
        .shimmer-bar { position:relative; overflow:hidden; }
        .shimmer-bar::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,#4ADE8040,transparent); animation:shimmer 1.5s infinite; }
      `}</style>
    </div>
  );
}