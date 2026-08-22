/**
 * ScholarHub AI — Official Press & Media Data Architecture
 * Verified facts, press releases, media coverage registry, and brand assets.
 */

import logoImg from '../assets/images/logo.png';
import creatorImg from '../assets/images/creator.jpg';
import architectureImg from '../assets/images/architecture.png';

export const MEDIA_CONTACTS = {
  primaryEmail: 'admin@scholarhub-ai.com',
  pressEmail: 'press@scholarhub-ai.com',
  directEmail: 'arupbhowmikpritom@gmail.com',
  officialWebsite: 'https://scholarhub-ai.com',
  location: 'Dhaka, Bangladesh',
  phone: '+880 1853-343176',
  responseWindow: 'Typically responds within 24–48 hours for accredited media inquiries.'
};

export const COMPANY_FACTS = {
  companyName: 'ScholarHub AI',
  founder: 'Arup Bhowmik Pritom',
  role: 'Founder & System Architect',
  headquarters: 'Dhaka, Bangladesh',
  category: 'Academic Research Technology / EdTech SaaS',
  website: 'https://scholarhub-ai.com',
  primaryRepositories: [
    'NCBI PubMed (Biomedical sciences via E-Utilities XML)',
    'arXiv (Computer science, physics, mathematics via Atom API)',
    'OpenAlex (Citation graph metadata & open-access indices)',
    'Semantic Scholar (Citation graph enrichment & DOI matching)',
    'SCImago Journal Rank (SJR Q1–Q4 local pre-indexed classification dataset)'
  ],
  coreTechnologies: [
    'FastAPI (Python 3.10) asynchronous backend service',
    'React 19 with Vite & Tailwind CSS architecture',
    'Upstash Serverless Redis (distributed caching & sliding-window rate limiting)',
    'Supabase PostgreSQL with Row Level Security (RLS) & atomic PL/pgSQL RPC procedures',
    'Multi-endpoint LLM inference mesh (Groq LPU & OpenRouter)',
    'Cytoscape.js & Apache ECharts (interactive concept graphs & visual analytics)'
  ],
  pricingTiers: 'Freemium tier model (Free tier with 500 Zaps/week; Starter tier with 1,500 Zaps/week; Pro tier with 3,000 Zaps/week).',
  deploymentStatus: 'Live Production Platform on Vercel Edge & Cloud Containers'
};

export const BRAND_ASSETS = [
  {
    id: 'logo-primary',
    name: 'ScholarHub AI Primary Logo (PNG)',
    description: 'Official wordmark and emblem on transparent background.',
    type: 'PNG Image',
    dimensions: '1024 x 1024 px',
    url: logoImg,
    downloadFileName: 'scholarhub-ai-logo.png'
  },
  {
    id: 'architecture-diagram',
    name: 'System Architecture Workflow',
    description: 'Technical diagram illustrating federated data ingestion, LLM reasoning stages, and caching tiers.',
    type: 'PNG Diagram',
    dimensions: '1920 x 1080 px',
    url: architectureImg,
    downloadFileName: 'scholarhub-ai-architecture.png'
  },
  {
    id: 'founder-photo',
    name: 'Founder Portrait — Arup Bhowmik Pritom',
    description: 'Press photograph of Founder & System Architect Arup Bhowmik Pritom.',
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
    title: 'ScholarHub AI Launches Multi-Repository Academic Discovery Platform with Source-Grounded AI Synthesis',
    subtitle: 'Developed in Bangladesh, the platform connects PubMed, arXiv, and OpenAlex to deliver source-grounded literature reviews, journal quartile indicators, and interactive concept graphs.',
    date: 'August 22, 2026',
    isoDate: '2026-08-22T00:00:00Z',
    category: 'Platform Launch',
    readTime: '4 min read',
    author: 'ScholarHub AI Communications',
    heroImage: architectureImg,
    summary: 'ScholarHub AI has released its academic research and synthesis platform, designed to reduce ungrounded AI citations and streamline multi-repository literature discovery for researchers and university students.',
    content: `
### Executive Summary
**DHAKA, BANGLADESH** — Software engineer and system architect Arup Bhowmik Pritom has announced the public release of **ScholarHub AI** ([scholarhub-ai.com](https://scholarhub-ai.com)), a specialized academic literature discovery and synthesis platform designed to streamline how university researchers, postgraduate students, and faculty members locate and analyze scientific literature.

### Context and Challenges in Scientific Literature Discovery
Researchers and students commonly encounter logistical challenges during literature reviews:
1. **Data Fragmentation:** Relevant studies are distributed across independent repositories—including PubMed for life sciences, arXiv for physics and computing, and OpenAlex for citation graphs.
2. **AI Citation Inaccuracies:** General-purpose AI chat assistants can generate plausible-sounding but fictitious paper titles, incorrect author attributions, or invalid Digital Object Identifiers (DOIs), making unverified outputs unsuitable for formal academic citation.
3. **Manual Synthesis Overhead:** Cross-referencing methodologies, extracting sample sizes, and identifying unexplored research gaps across multiple papers often requires extensive manual review.

### The Source-Grounded ScholarHub AI Approach
ScholarHub AI addresses these workflows by combining federated multi-source search with a **source-grounded Retrieval-Augmented Generation (RAG)** pipeline.

When a query is submitted, ScholarHub AI initiates parallel asynchronous requests across PubMed, arXiv, and OpenAlex. The retrieved results are deduplicated, enriched with verified citation counts, and matched against **SCImago Journal Rank (SJR) quartile indicators (Q1–Q4)** from a local pre-indexed dataset.

### Core Capabilities and Technical Implementation
- **Federated Parallel Search:** Retrieves metadata and abstracts from PubMed, arXiv, and OpenAlex concurrently, leveraging an asynchronous FastAPI backend and Upstash Redis caching for low-latency response times.
- **Source-Grounded Research Auditor:** AI reasoning models (Standard, Advanced, and Deep modes) evaluate structured abstract payloads and metadata, designing synthesis outputs around verified paper identifiers.
- **Visual Concept Topologies:** Renders interactive concept relationship trees and citation networks using Cytoscape.js and Apache ECharts.
- **Multi-Format Reference Export:** Generates formatted bibliographies in standard styles including APA 7th, IEEE, Harvard, MLA, and BibTeX, alongside structured PDF and spreadsheet downloads.
- **Session Security and Sharing:** Incorporates device session governance and shareable research audit URLs with 30-day access controls for peer collaboration.

### Founder Perspective
"In scientific literature analysis, the core priority is verifying that findings and citations are anchored to real peer-reviewed sources," stated **Arup Bhowmik Pritom, Founder and System Architect of ScholarHub AI**. "ScholarHub AI was engineered from Bangladesh to provide students and researchers with a practical workspace where AI synthesis is directly grounded in retrieved paper abstracts, verified DOIs, and transparent journal quartile metrics."

### Availability
ScholarHub AI is publicly accessible online at [https://scholarhub-ai.com](https://scholarhub-ai.com). Users can begin searching literature immediately, organize personal research libraries, and select compute quota tiers suited to their individual research needs.

### About ScholarHub AI
ScholarHub AI ([https://scholarhub-ai.com](https://scholarhub-ai.com)) is an academic literature discovery and synthesis platform developed to assist students, scholars, and research teams. By connecting open-access repositories with source-grounded AI analysis, ScholarHub AI supports evidence-based literature exploration across STEM and multidisciplinary fields.

### Media & Inquiries Contact
- **Contact:** Arup Bhowmik Pritom
- **Role:** Founder & System Architect
- **Official Email:** admin@scholarhub-ai.com / press@scholarhub-ai.com
- **Direct Email:** arupbhowmikpritom@gmail.com
- **Website:** [https://scholarhub-ai.com](https://scholarhub-ai.com)
- **Location:** Dhaka, Bangladesh
- **Phone / WhatsApp:** +880 1853-343176
    `
  }
];

// Verified Third-Party Media Coverage Registry
// To maintain strict journalistic integrity, only verified publications are displayed.
export const MEDIA_COVERAGE = [];
