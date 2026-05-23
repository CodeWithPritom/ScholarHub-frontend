<div align="center">
  <img src="/src/assets/images/logo.png" alt="ScholarHub AI Logo" width="150"/>

  <h1>ScholarHub AI</h1>
  <p><em>The Enterprise-Grade, AI-Powered Discovery Hub for Global Researchers.</em></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq" />
    <img src="https://img.shields.io/badge/Llama_3.1-0466C8?style=for-the-badge&logo=meta&logoColor=white" alt="Llama 3.1" />
  </p>
</div>

<br />

## Executive Summary

**ScholarHub AI** is an incredibly complex, enterprise-grade SaaS platform designed to tear down the fragmented walls of modern academic discovery. Built from the ground up for massive scalability, high availability (99.9% uptime), and military-grade security, it acts as a highly optimized proxy and intelligence layer over the world's most prominent bibliographic databases.

By marrying cutting-edge semantic search algorithms with state-of-the-art open-source Large Language Models (LLMs), ScholarHub AI delivers **zero-hallucination, strictly grounded research insights** at lightning-fast inference speeds.

---

## Architecture Visualization

<img width="1672" height="941" alt="architecture" src="https://github.com/user-attachments/assets/d0ae9de7-d7ab-4b03-b772-4003b7e558d2" />

---

## 💻 Desktop Experience

ScholarHub AI features a seamless, highly responsive web interface designed for deep research sessions, real-time analytics, and enterprise-grade data management.

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="https://github.com/user-attachments/assets/85cf226c-7db3-4c64-9248-63b4a685d1a6" alt="Landing Page Hero" />
      <br /><b>Landing Page & Hero</b>
    </td>
    <td align="center" width="50%">
      <img src="https://github.com/user-attachments/assets/5757e309-23e9-4a28-952d-3b903e335a73" alt="Intelligence Engine" />
      <br /><b>Live Data and Engine Informations</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/38c6e519-2d3e-4fa7-8e19-adf6e3192240" alt="Pricing Architecture" />
      <br /><b>Transparent SaaS Pricing</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/966676d6-ba4c-4550-b16f-b7a0e92533e3" alt="Community Discord" />
      <br /><b>Community Integration</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/b4f9fb5f-9607-44ab-84dd-d0e2c279ebed" alt="Search Dashboard" />
      <br /><b>Primary Search Dashboard</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/122e474d-06ae-4390-84b7-566990bed7b0" alt="Advanced Filters" />
      <br /><b>Advanced Date & Priority Filters</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/0354e819-2764-4c5d-8915-6bbd13052a97" alt="Paper Details" />
      <br /><b>In-Depth Paper Details and Llama 3.1 AI Executive Report</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/bed31f65-4398-4210-86a7-4751f9ff47ee" alt="AI Chat Report" />
      <br /><b>Pricing</b>
    </td>
  </tr>
</table>

<br />

## 📱 Mobile-First Architecture

We built ScholarHub AI to be 100% responsive out of the box, delivering a native-app-like experience on all mobile devices with slide-out drawers, swipeable portals, and native bottom sheets.

<table align="center">
  <tr>
    <td align="center" width="25%">
      <img src="https://github.com/user-attachments/assets/3eae13f3-0af1-4368-b36b-f4ba98edeb8c" alt="Mobile View 1" />
      <br /><b>Mobile Landing</b>
    </td>
    <td align="center" width="25%">
      <img src="https://github.com/user-attachments/assets/972068c7-2535-4942-adde-02b1d41dd666" alt="Mobile View 2" />
      <br /><b>Mobile Dashboard</b>
    </td>
    <td align="center" width="25%">
      <img src="https://github.com/user-attachments/assets/10704356-071b-4d3e-878f-220b8f56569d" alt="Mobile View 3" />
      <br /><b>Llama 3.1 AI Executive Report</b>
    </td>
    <td align="center" width="25%">
      <img src="https://github.com/user-attachments/assets/ec39e779-eb2b-43a7-8362-cb0cc3116056" alt="Mobile View 4" />
      <br /><b>Profile and Security</b>
    </td>
  </tr>
</table>

<br />
## Core System Architecture & Data Flow

ScholarHub AI is built on a highly decoupled, modern tech stack designed to ensure that heavy AI inferencing and massive data pulls do not bottleneck the client experience.

```mermaid
graph TD
    Client[React/Vite SPA Client]
    Turnstile[Cloudflare Turnstile]
    FastAPI[FastAPI Backend Server]
    SupabaseDB[(Supabase PostgreSQL)]
    Auth[(Supabase Auth)]
    
    SubGraph1[Academic Data Providers]
    NCBI[NCBI PubMed]
    Arxiv[arXiv API]
    OpenAlex[OpenAlex API]
    
    SubGraph2[AI Inference Engines]
    Groq[Groq LPU Engine]
    OpenRouter[OpenRouter Fallback]
    Together[Together AI Fallback]

    Client -- JWT Bearer Token --> FastAPI
    Client -- Captcha Token --> Turnstile
    Turnstile -- Validates --> Client
    
    FastAPI -- Validates JWT & Queries Data --> SupabaseDB
    FastAPI -- Role & Auth Management --> Auth
    
    FastAPI -- Semantic Queries --> SubGraph1
    FastAPI -- Context-Aware Prompts --> SubGraph2
```

### Deep Dive into the Stack
1. **Frontend (React + Vite + Framer Motion):** A highly reactive Single Page Application leveraging optimistic UI updates, local storage caching, and complex state management to ensure a buttery-smooth UX even during heavy AI polling.
2. **Backend (Python + FastAPI + Uvicorn):** A fully asynchronous Python backend capable of handling thousands of concurrent connections. It utilizes advanced background tasks, connection pooling, and extremely strict CORS/Origin middleware configurations to reject unauthorized traffic.

---

## Database Schema & Relational Connections

The platform utilizes **Supabase (PostgreSQL)**. This isn't just a simple data store; it relies heavily on complex relational integrity, foreign key cascading, and real-time triggers.

```mermaid
erDiagram
    users ||--o{ profiles : "1-to-1 extension"
    users ||--o{ user_devices : "tracks max 2 devices"
    users ||--o{ usage_logs : "tracks daily AI limits"
    users ||--o{ coupon_redemptions : "tracks one-time usage"
    users ||--o{ bookmarks : "saves papers"
    
    profiles {
        uuid id PK
        string full_name
        string academic_field
        string academic_status
        string current_plan
        timestamp plan_expiry_date
    }
    
    usage_logs {
        uuid id PK
        uuid user_id FK
        date usage_date
        int summary_count
    }
    
    coupons ||--o{ coupon_redemptions : "validates"
    coupons {
        string code PK
        int discount_percent
        int max_uses
        int current_uses
        string applicable_tier
    }
```

---

## Enterprise-Grade Security & Authentication

Security is woven into the very fabric of ScholarHub AI. We employ a multi-layered defense mechanism:

1. **Cloudflare Turnstile CAPTCHA:**
   - Integrated deep into the React `Auth.jsx` flow (Signup, Login, and Forgot Password).
   - Prevents credential stuffing, DDoS attacks, and automated bot registrations.
2. **Stateless JWT Validation (FastAPI Middleware):**
   - The backend does not trust the client. Every single API request requires a valid JWT Bearer token extracted from the `Authorization` header.
   - The token is cryptographically verified against Supabase's public JWT secret.
3. **Strict Row Level Security (RLS) in PostgreSQL:**
   - Every table in the database has RLS policies enabled.
   - Example: `CREATE POLICY "Users can only view their own usage" ON usage_logs FOR SELECT USING (auth.uid() = user_id);`
   - Even if the backend was compromised, the database engine physically rejects queries targeting other users' data.
4. **Device Fingerprinting & Limit Management:**
   - Active tracking via the `user_devices` table.
   - Strict enforcement of maximum simultaneous active devices (e.g., 2 devices per user) to prevent account sharing and SaaS revenue leakage.
5. **Hardened CORS & Rate Limiting:**
   - `main.py` utilizes extremely strict Cross-Origin Resource Sharing (CORS) rules mapped exclusively to `https://scholarhub-ai.me`.
   - Backend IP-based and User-ID-based rate limiting prevents aggressive scraping of our proprietary API routes.

---

## The Multi-Source Engine & Error Cascade

Querying legacy academic APIs is notoriously unstable. ScholarHub AI implements a highly resilient **"Zero-Data & Error Fallback Cascade"**.

```mermaid
sequenceDiagram
    participant User
    participant Backend as FastAPI Backend
    participant Primary as Primary API (e.g. NCBI/arXiv)
    participant Fallback as OpenAlex (Universal)
    
    User->>Backend: Search Query (e.g. "CRISPR")
    Backend->>Primary: Request Data
    alt Primary Success
        Primary-->>Backend: Returns 50 Papers
    else Primary Fails (Rate Limit / Timeout / Empty)
        Backend->>Fallback: Seamless Retry
        Fallback-->>Backend: Returns 50 Papers
    end
    Backend-->>User: Formatted Unified Results
```

### The 8 Specialized Portals
The system actively routes queries to optimized endpoints based on the selected portal:
- **GEB (Genetic Eng. & Biotech)** → NCBI PubMed
- **Pharmacy** → NCBI PubMed / OpenAlex
- **Engineering / CS** → arXiv / Semantic Scholar
- **Physics** → arXiv
- **Mathematics** → arXiv
- **Social Sciences / Law / Chemistry** → OpenAlex Universal Engine

---

## The AI Brain: Llama 3.1 8b Integration

The core value proposition of ScholarHub is its ability to contextually synthesize hundreds of pages of academic text in seconds.

### Why Llama-3.1-8b-instruct?
We explicitly architected the AI integration around **Meta's Llama 3.1 (8B)** model hosted on **Groq's LPU (Language Processing Unit)** architecture.
- **Inference Speed:** Approaching 800+ tokens per second.
- **Zero Hallucination RAG:** We strictly prompt the model to *only* use the injected context (Abstracts, Methodologies). If the answer isn't in the provided text, the AI gracefully declines to answer.

### The AI Fallback Cascade (High Availability)
AI APIs are prone to sudden rate-limits or downtime. We engineered a 3-tier redundancy flow:
1. **Primary Engine:** `Groq` (Llama 3.1 8b) - Blazing fast.
2. **Secondary Failover:** `OpenRouter` - Aggregates multiple API streams.
3. **Tertiary Failover:** `Together AI` - Dedicated serverless inferencing.
*This cascade happens in milliseconds on the backend, completely invisible to the user.*

---

## SaaS Quota Architecture & E-Commerce

ScholarHub AI features a production-ready SaaS billing and quota engine.

### Real-Time Quota Tracking
Every time a user generates an AI summary, the backend executes an atomic transaction on the `usage_logs` table.
- **Free Tier:** 3 summaries/day
- **Starter Tier:** 30 summaries/day
- **Pro Tier:** 300 summaries/day
If the `summary_count >= max_allowed`, the backend hard-rejects the AI request with a `403 Forbidden` response.

### Intelligent Coupon Engine
The admin panel allows the creation of highly specific marketing coupons:
- Coupons are strictly locked to `applicable_tier` ('starter', 'pro', or 'both').
- **Race-Condition Protection:** The checkout endpoint (`/api/subscriptions/auto-upgrade`) utilizes atomic `increment` operations on `current_uses` and inserts a `coupon_redemptions` record to permanently prevent double-burning or multi-tab exploits.

---



## Core Architect

**Arup Bhowmik Pritom**  
*Founder & Principal Architect*  
A passionate 4th-semester Computer Science undergraduate engineering the future of AI accessibility, scalable cloud architecture, and global educational democratization.

<div align="center">
  <p><em>Engineered with ❤️ for researchers worldwide.</em></p>
</div>
