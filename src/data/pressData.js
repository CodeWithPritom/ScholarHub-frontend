/**
 * ScholarHub AI — Official Press & Media Data Architecture
 * Verified facts, press releases, media coverage registry, and brand assets.
 */

import logoImg from '../assets/images/logo.png';
import creatorImg from '../assets/images/creator.jpg';
import architectureImg from '../assets/images/architecture.png';

export const MEDIA_CONTACTS = {
  pressEmail: 'press@scholarhub-ai.com',
  directEmail: 'arupbhowmikpritom@gmail.com',
  officialWebsite: 'https://scholarhub-ai.com',
  location: 'Dhaka, Bangladesh',
  phone: '+880 1853-343176',
  responseWindow: 'Typically responds within 24–48 hours for accredited press inquiries.'
};

export const COMPANY_FACTS = {
  companyName: 'ScholarHub AI',
  founder: 'Arup Bhowmik Pritom',
  role: 'Founder & Lead System Architect',
  headquarters: 'Dhaka, Bangladesh',
  category: 'Academic Research Technology / EdTech SaaS',
  website: 'https://scholarhub-ai.com',
  primaryRepositories: [
    'NCBI PubMed (Biomedical Sciences via E-Utilities XML)',
    'arXiv (Computer Science, Physics, Mathematics via Atom API)',
    'OpenAlex (Universal Citation Graphs & Open Access Indices)',
    'Semantic Scholar (Citation Graph Enrichment & DOI Matcher)',
    'SCImago Journal Rank (SJR Q1–Q4 Local Pre-Indexed SQLite Dataset)'
  ],
  coreTechnologies: [
    'FastAPI (Python 3.10) Asynchronous Backend Gateway',
    'React 19 with Vite & Tailwind CSS Architecture',
    'Upstash Serverless Redis (Distributed Cache & Sliding Window Rate Limiting)',
    'Supabase PostgreSQL with Row Level Security (RLS) & Atomic PL/pgSQL RPC Functions',
    'Groq LPU & OpenRouter Multi-Pool LLM Reasoning Mesh',
    'Cytoscape.js & Apache ECharts (Topological Concept Graphing & Visual Analytics)'
  ],
  pricingTiers: 'Freemium model with Free tier (500 Zaps/month), Starter tier (1,500 Zaps), and Pro tier (3,000 Zaps).',
  deploymentStatus: 'Live Production System on Vercel Edge & Cloud Containers'
};

export const BRAND_ASSETS = [
  {
    id: 'logo-primary',
    name: 'ScholarHub AI Primary Logo (PNG)',
    description: 'High-resolution official icon and typography mark on transparent background.',
    type: 'PNG Image',
    dimensions: '1024 x 1024 px',
    url: logoImg,
    downloadFileName: 'scholarhub-ai-logo.png'
  },
  {
    id: 'architecture-diagram',
    name: 'System & Neural Architecture Diagram',
    description: 'Technical workflow diagram displaying federated data ingestion, LLM synthesis, and cache hierarchy.',
    type: 'PNG Diagram',
    dimensions: '1920 x 1080 px',
    url: architectureImg,
    downloadFileName: 'scholarhub-ai-architecture.png'
  },
  {
    id: 'founder-photo',
    name: 'Founder Portrait — Arup Bhowmik Pritom',
    description: 'Official press photograph of Founder & Lead System Architect Arup Bhowmik Pritom.',
    type: 'JPG Photograph',
    dimensions: '800 x 800 px',
    url: creatorImg,
    downloadFileName: 'arup-bhowmik-pritom-founder.jpg'
  }
];

export const PRESS_RELEASES = [
  {
    id: 'launch-announcement',
    slug: 'scholarhub-ai-launches-ai-powered-research-platform',
    title: 'ScholarHub AI Launches to Unify Global Scientific Repositories with Grounded, Hallucination-Resistant AI Synthesis',
    subtitle: 'Engineered in Bangladesh, the platform connects PubMed, arXiv, and OpenAlex to deliver verified literature reviews, journal quartile metrics, and interactive knowledge graphs.',
    date: 'August 22, 2026',
    isoDate: '2026-08-22T00:00:00Z',
    category: 'Product Launch',
    readTime: '5 min read',
    author: 'ScholarHub AI Communications',
    heroImage: architectureImg,
    summary: 'ScholarHub AI has officially launched its academic research operating system, designed to eliminate citation fabrication and database fragmentation for university students, researchers, and scientific laboratories worldwide.',
    content: `
### Executive Summary
**DHAKA, BANGLADESH** — Independent software engineer and system architect Arup Bhowmik Pritom has announced the public release of **ScholarHub AI** ([scholarhub-ai.com](https://scholarhub-ai.com)), an integrated academic research and literature synthesis platform designed to modernize how university students, researchers, and faculty members discover, analyze, and synthesize scientific literature.

### The Problem in Scientific Discovery
University scholars and postgraduate researchers face severe inefficiencies when reviewing scientific literature:
1. **Repository Fragmentation:** Relevant research is divided across disparate databases—such as PubMed for biomedical research, arXiv for computer science and physics, and OpenAlex for global citation graphs.
2. **AI Citation Hallucination:** Mainstream generic artificial intelligence chat assistants frequently invent fictitious paper titles, fabricate non-existent author lists, and generate broken Digital Object Identifiers (DOIs), rendering their outputs unacceptable for formal scientific publication.
3. **Manual Synthesis Bottleneck:** Synthesizing research methodologies, evaluating sample sizes, and identifying unexplored research gaps across dozens of papers typically demands weeks of manual labor.

### The Grounded ScholarHub AI Solution
ScholarHub AI eliminates these bottlenecks by coupling federated literature aggregation with a deterministic **Grounded Retrieval-Augmented Generation (RAG)** pipeline.

Instead of querying single databases in isolation, ScholarHub AI initiates concurrent asynchronous search queries across PubMed, arXiv, and OpenAlex. The retrieved records are automatically deduplicated by normalized title Levenshtein distance and DOI matching, enriched with citation statistics, and classified with **SCImago Journal Rank (SJR) quartile ratings (Q1–Q4)** directly from a pre-indexed dataset.

### Core Capabilities & Architectural Highlights
- **Federated Parallel Retrieval:** Queries PubMed, arXiv, and OpenAlex simultaneously with sub-second cache lookups via an asynchronous FastAPI backend and Upstash Redis layer.
- **Deterministic Research Auditor:** AI reasoning models (Standard, Advanced, and Deep modes) operate strictly on retrieved peer-reviewed abstract payloads, guaranteeing that every literature review assertion is anchored to verified DOIs and real authors.
- **Interactive Knowledge Topologies:** Converts complex scientific concepts and citation trees into interactive visual graph maps using Cytoscape.js and Apache ECharts.
- **Universal Reference Formatting:** Exports synthesis summaries and bibliographies instantly into APA 7th, IEEE, Harvard, MLA, BibTeX, PDF manuscripts, and Excel spreadsheets.
- **Multi-Device & Collaborative Workspaces:** Features hardware-fingerprinted session security and shareable 30-day research audit links for collaborative peer review.

### Founder Perspective
"When conducting scientific research, the core challenge is not a lack of information, but the inability to rapidly synthesize verified findings without falling victim to AI hallucinations," stated **Arup Bhowmik Pritom, Founder and Lead Architect of ScholarHub AI**. "We built ScholarHub AI from Bangladesh to provide students and researchers worldwide with a transparent, verifiable tool where every summary is backed by real peer-reviewed papers, verified DOIs, and transparent journal impact rankings."

### Availability
ScholarHub AI is publicly accessible worldwide at [https://scholarhub-ai.com](https://scholarhub-ai.com). Users can begin searching literature immediately, create personal research workspaces, and access compute quotas tailored for individual and institutional research needs.

### About ScholarHub AI
ScholarHub AI ([https://scholarhub-ai.com](https://scholarhub-ai.com)) is an academic research and literature synthesis platform engineered to make scientific discovery faster and more dependable. Headquartered in Dhaka, Bangladesh, the platform serves researchers, scholars, and academic institutions worldwide.

### Media Contact
- **Contact:** Arup Bhowmik Pritom
- **Title:** Founder & Lead System Architect
- **Email:** press@scholarhub-ai.com / arupbhowmikpritom@gmail.com
- **Website:** [https://scholarhub-ai.com](https://scholarhub-ai.com)
- **Location:** Dhaka, Bangladesh
- **Phone / WhatsApp:** +880 1853-343176
    `
  }
];

// Verified Third-Party Media Coverage Registry
// To maintain strict journalistic integrity, only verified publications are displayed.
export const MEDIA_COVERAGE = [];
