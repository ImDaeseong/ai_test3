import type { CareerDiffAnalysisResult } from "@/core/types";

/**
 * Stable mock result so the dashboard UI can be built before any LLM
 * integration exists (docs/integration/ANALYSIS_FLOW.md "Mock-first
 * implementation rule"). All content below is synthetic.
 */
export const mockAnalysisResult: CareerDiffAnalysisResult = {
  fitScore: {
    total: 68,
    categories: [
      { label: "Required skills", score: 72, reason: "3 of 4 required skills have direct evidence." },
      { label: "Preferred skills", score: 55, reason: "1 of 3 preferred skills has direct evidence." },
      { label: "Domain fit", score: 80, reason: "Candidate has 2 years in a directly related domain." },
      { label: "Seniority fit", score: 60, reason: "Candidate's scope is slightly narrower than the target level." },
    ],
  },
  summary:
    "Solid backend fundamentals and directly relevant domain experience, but missing hands-on evidence for the required cloud infrastructure skill and no clear leadership examples for the target seniority.",
  jobRequirements: {
    requiredSkills: [
      { id: "req-1", label: "TypeScript", category: "language", confidence: "high" },
      { id: "req-2", label: "Node.js backend services", category: "framework", confidence: "high" },
      { id: "req-3", label: "PostgreSQL", category: "database", confidence: "high" },
      { id: "req-4", label: "AWS (ECS/Lambda)", category: "infrastructure", confidence: "medium" },
    ],
    preferredSkills: [
      { id: "pref-1", label: "GraphQL API design", category: "framework", confidence: "medium" },
      { id: "pref-2", label: "Terraform", category: "infrastructure", confidence: "low" },
      { id: "pref-3", label: "Mentoring junior engineers", category: "leadership", confidence: "medium" },
    ],
    domain: [{ id: "dom-1", label: "B2B SaaS", category: "domain", confidence: "high" }],
    seniority: "Mid to Senior",
    collaboration: [{ id: "collab-1", label: "Cross-functional with product/design", category: "collaboration", confidence: "medium" }],
    deliveryExpectations: [{ id: "del-1", label: "Own a service end-to-end", category: "delivery", confidence: "medium" }],
  },
  candidateEvidence: {
    skills: [
      { id: "ev-1", label: "TypeScript", sourceSnippet: "Built and maintained backend services in TypeScript for 2 years.", confidence: "high" },
      { id: "ev-2", label: "Node.js", sourceSnippet: "Node.js/Express API serving ~500 req/s at peak.", confidence: "high" },
      { id: "ev-3", label: "PostgreSQL", sourceSnippet: "Designed schema and query optimization for a PostgreSQL-backed reporting service.", confidence: "high" },
    ],
    projects: [
      { id: "ev-4", label: "Internal reporting platform", sourceSnippet: "Led backend rewrite of an internal reporting platform used by 40+ internal users.", confidence: "high" },
    ],
    responsibilities: [
      { id: "ev-5", label: "Service ownership", sourceSnippet: "Owned the billing service from design through on-call rotation.", confidence: "medium" },
    ],
    achievements: [
      { id: "ev-6", label: "Latency reduction", sourceSnippet: "Reduced p95 API latency by 35% through query optimization.", confidence: "high" },
    ],
    collaboration: [
      { id: "ev-7", label: "Product collaboration", sourceSnippet: "Worked directly with product managers to scope quarterly roadmap items.", confidence: "medium" },
    ],
  },
  retrievalContext: {
    enabled: false,
    query: "",
    items: [],
    provider: "none",
    filters: {
      visibility: ["private"],
      sourceTypes: [],
      maxPiiRisk: "low",
    },
  },
  matches: {
    strong: [
      { requirement: "TypeScript", status: "strong", reason: "2 years of direct, production TypeScript experience.", evidenceSnippet: "Built and maintained backend services in TypeScript for 2 years." },
      { requirement: "Node.js backend services", status: "strong", reason: "Owned a production Node.js service end-to-end.", evidenceSnippet: "Node.js/Express API serving ~500 req/s at peak." },
      { requirement: "PostgreSQL", status: "strong", reason: "Direct schema design and query optimization experience.", evidenceSnippet: "Designed schema and query optimization for a PostgreSQL-backed reporting service." },
    ],
    weak: [
      { requirement: "GraphQL API design", status: "weak", reason: "No direct evidence, but strong REST API design experience is a reasonable proxy." },
    ],
    missing: [
      { requirement: "AWS (ECS/Lambda)", status: "missing", reason: "No cloud infrastructure evidence found in the provided profile." },
      { requirement: "Terraform", status: "missing", reason: "No infrastructure-as-code evidence found." },
    ],
    risks: [
      { requirement: "Mentoring junior engineers", status: "risk", reason: "Job description implies a mentoring expectation at this seniority, but no mentoring evidence was provided." },
    ],
  },
  resumeSuggestions: {
    bullets: [
      "Owned the billing service end-to-end (design, implementation, on-call), reducing p95 latency by 35% through query optimization.",
      "Led a backend rewrite of an internal reporting platform used by 40+ internal users, migrating to a PostgreSQL-backed architecture.",
    ],
    projectDescriptions: [
      "Internal Reporting Platform — TypeScript/Node.js/PostgreSQL service supporting 40+ internal users; led the backend rewrite and owned schema design.",
    ],
    skillPriority: ["AWS (ECS/Lambda)", "Terraform", "GraphQL API design"],
    atsKeywords: ["TypeScript", "Node.js", "PostgreSQL", "API design", "on-call", "service ownership"],
  },
  miniProjects: [
    {
      title: "Deploy a small Node.js service to AWS ECS with Terraform",
      goal: "Close the AWS/Terraform evidence gap with a concrete, demoable artifact.",
      targetGaps: ["AWS (ECS/Lambda)", "Terraform"],
      deliverables: ["Terraform config for an ECS service", "A short README explaining the architecture decisions", "A public repo link to add to the resume"],
      suggestedDurationDays: 5,
    },
  ],
  interviewPrep: {
    questions: [
      "Walk me through how you designed the billing service you owned end-to-end.",
      "Tell me about a time you optimized a slow query — how did you find the bottleneck?",
      "How would you approach deploying a Node.js service to AWS if you haven't done it before?",
    ],
    weakAreas: ["Cloud infrastructure (AWS/Terraform)", "Mentoring/leadership examples"],
    sevenDayPlan: [
      "Day 1-2: Build the AWS/Terraform mini project.",
      "Day 3: Rewrite resume bullets using the suggestions above.",
      "Day 4: Prepare STAR-format answers for the 3 interview questions.",
      "Day 5: Draft one mentoring/leadership story from past team collaboration.",
      "Day 6-7: Mock interview focused on system design and the weak areas above.",
    ],
  },
  metadata: {
    schemaVersion: "1.0.0",
    scoringVersion: "mock-0.1.0",
    retrievalUsed: false,
    persisted: false,
  },
};
