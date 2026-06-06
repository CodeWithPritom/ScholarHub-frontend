# 🏛️ ScholarHub AI: System Architecture Deep Dive

**An Enterprise-Grade Technical Reference**
*Target Audience: University Faculty, Senior Engineers, and System Architects.*

---

## 1. End-to-End System Architecture

ScholarHub AI is built on a highly decoupled, modern microservices-inspired architecture designed to ensure that heavy AI inferencing and massive data pulls do not bottleneck the client experience.

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
    Groq[Groq Llama 3.1 LPU]
    OpenRouter[OpenRouter Fallback]

    Client -- JWT Bearer Token --> FastAPI
    Client -- Captcha Token --> Turnstile
    Turnstile -- Validates --> Client
    
    FastAPI -- Validates JWT & Queries Data --> SupabaseDB
    FastAPI -- Role & Auth Management --> Auth
    
    FastAPI -- Semantic Queries --> SubGraph1
    FastAPI -- Context-Aware Prompts --> SubGraph2
```

### Core Components:
- **Frontend Layer:** A highly reactive React SPA that handles all UI rendering, optimistic state management, and strict local caching to prevent redundant API calls.
- **Backend Service Layer:** A fully asynchronous Python (FastAPI) environment routing complex logic to third-party academic sources while acting as a secure gateway to the database.
- **AI Inference Layer:** Driven primarily by Groq's LPU architecture, achieving blazing fast inference (up to 800 tokens/sec) using Meta's Llama 3.1 8B Instruct model.

---

## 2. Multi-Source Data Waterfall

Querying legacy academic APIs is notoriously unstable. To provide uninterrupted service, the backend implements a highly resilient **Zero-Data & Error Fallback Cascade** located inside `routers/unified.py`.

```mermaid
flowchart TD
    Start((User Query)) --> Router[FastAPI Router unified.py]
    
    Router -->|Bio/Pharma| NCBI[NCBI PubMed API]
    Router -->|Eng/Physics/Math| ArXiv[arXiv API]
    Router -->|Social/Law/Chem| OpenAlex[OpenAlex API]
    
    NCBI -- 500 / Timeout --> EuropePMC[Europe PMC Fallback]
    NCBI -- 0 Results --> ZeroData1[Trigger Universal Fallback]
    EuropePMC -- Fails / 0 Results --> ZeroData1
    
    ArXiv -- 500 / Timeout / 0 Results --> ZeroData2[Trigger Universal Fallback]
    
    ZeroData1 --> OpenAlexUniv[OpenAlex Universal Engine]
    ZeroData2 --> OpenAlexUniv
    
    OpenAlexUniv -- 0 Results --> EmptyState[Return 200 OK: Empty Articles + AI Prompt]
    OpenAlexUniv -- Success --> Final[Return Data + switched_to_universal=True]
    NCBI -- Success --> Final2[Return Data]
    ArXiv -- Success --> Final2
```

### The `switched_to_universal` Flag Logic:
When the system silently reroutes a query from a failing or empty primary source (like NCBI) to the OpenAlex Universal engine, it sets `switched_to_universal = True`. This explicitly tells the frontend UI to display a polite banner informing the user: *"Primary database lacked results. Automatically expanded search globally."*

---

## 3. The 'Bulletproof' Hybrid Infrastructure

To guarantee 99.9% uptime despite utilizing free/hobby cloud tiers, we engineered a **Global Fetch Interceptor** directly into the React client (`utils/api.js`).

```mermaid
sequenceDiagram
    participant ReactClient as React Frontend
    participant Interceptor as window.fetch Interceptor
    participant Primary as Primary Cloud Server (Render)
    participant Backup as Backup VPN Server (Tailscale)

    ReactClient->>Interceptor: fetch('/api/search')
    Interceptor->>Primary: Forwards Request
    
    alt Primary Server Online
        Primary-->>Interceptor: 200 OK (Data)
        Interceptor-->>ReactClient: Returns Data
    else Primary Server Crashes (502/503/504 or Timeout)
        Primary--XInterceptor: 502 Bad Gateway
        Note over Interceptor: Catches 5xx Error.<br/>Rewrites Base URL on the fly.
        Interceptor->>Backup: Seamlessly Forwards to Backup
        Backup-->>Interceptor: 200 OK (Data)
        Interceptor-->>ReactClient: Returns Data (Invisible to User)
    end
```

- **Seamless Rerouting:** The user experiences zero downtime. If the primary Render container undergoes a cold start crash or 502 Bad Gateway, the interceptor catches the failure and immediately routes to the local Tailscale Funnel node.
- **Third-Party Safety:** Strict string-matching ensures that external API calls (e.g., Supabase Auth or Turnstile) are never incorrectly rewritten.

---

## 4. AI Intelligence Layer & Smart Truncation

Processing highly complex academic texts via LLMs easily risks triggering HTTP 413 (Payload Too Large) or Token Rate Limit errors. To mitigate this, we implemented **Smart Truncation Logic** in the backend AI services (`routers/ai.py`).

```mermaid
flowchart LR
    Frontend["User Requests Summary"] --> Backend["FastAPI AI Router"]
    Backend --> Extractor["Extract Abstract Text from Top 15 Papers"]
    Extractor --> CharLimit{"Total Length > 15,000 chars?"}
    CharLimit -- Yes --> Truncate["Truncate to 15,000 chars<br>(Content truncated)"]
    CharLimit -- No --> BuildPrompt["Build System & User Prompts"]
    Truncate --> BuildPrompt
    BuildPrompt --> Groq["Groq LPU Engine at 800 tokens/sec"]
    Groq -- Success --> Response["Format AI Sections: Synthesis & Gaps"]
    Groq -- Rate Limit / Error --> Intercept["Frontend Interceptor Catches Error"]
    Intercept --> UIMessage["Display Friendly Optimization Message"]
```

By safely capping the total string payload to 15,000 characters (approximately 3,500 - 4,000 tokens), the system strictly obeys the 6,000 TPM limit set by our LLM provider, guaranteeing stability even for high-volume PRO users.

---

## 5. EMo: The Intelligent Support Assistant

ScholarHub AI features **EMo**, a dedicated, highly context-aware AI support bot designed to assist users with platform navigation, subscription tiers, and troubleshooting.

```mermaid
flowchart TD
    Widget["EMo Floating Widget (React)"] -->|"User Question"| SupportRouter["Dedicated Support Router<br>(/api/support/chat)"]
    SupportRouter --> ContextInjector["Inject Platform-Specific Context<br>(How to use, Tiers, Troubleshooting)"]
    ContextInjector --> Groq["Groq LPU Engine<br>(Llama 3.1)"]
    Groq --> Response["Format Polite Support Answer"]
    Response --> Widget
```

### Architectural Distinction: EMo vs. Research AI
While both AI assistants are powered by the same underlying Llama 3.1 infrastructure, their grounding methodologies are strictly separated:
- **The Research AI** (`/ai/summarize-research`) is dynamically grounded **only** in the academic papers retrieved during the user's current search session. It acts as an objective, academic scientist and refuses to answer questions outside of the provided literature.
- **EMo Support Bot** (`/api/support/chat`) is statically grounded in **platform documentation**. It is injected with a persistent system prompt detailing ScholarHub's portal logic, SaaS pricing models, error codes (like 413 or 502), and UI features. EMo acts as a friendly, empathetic customer success agent guiding the user through the application.

---

## 6. Security & SaaS Integrity Fortress

Security is woven into the foundation of the platform to protect API endpoints and subscription revenue.

```mermaid
flowchart TD
    User -->|Login/Signup| Turnstile[Cloudflare Turnstile]
    Turnstile -->|Captcha Token| SupabaseAuth[Supabase Auth]
    SupabaseAuth -->|JWT Bearer Token| Client[Client Local Storage]
    Client -->|API Request + JWT| Middleware[FastAPI Auth Middleware]
    Middleware -->|Cryptographically Verifies JWT| DB[PostgreSQL with RLS]
    DB --> Fingerprint{Check Device Fingerprint}
    Fingerprint -- > 2 Active Devices --> Block[403 Forbidden: Max Devices Reached]
    Fingerprint -- <= 2 Active Devices --> Allow[Execute Business Logic]
```

### Key Security Layers:
1. **Stateless JWT Validation:** The backend never inherently trusts the client. Every protected endpoint rigorously checks the JWT signature against the Supabase core identity.
2. **Row Level Security (RLS):** Policies physically block unauthorized data operations at the PostgreSQL engine level, ensuring users can only read/write their own `usage_logs` and `user_devices`.
3. **Device Fingerprinting:** A custom tracking system generates robust browser fingerprints to enforce a maximum active device limit (e.g., 2 devices per PRO account), completely neutralizing account-sharing abuse.

---

## 7. Database Schema Entity-Relationship (ER) Diagram

The architecture relies heavily on strict relational integrity and foreign key cascading within Supabase.

```mermaid
erDiagram
    users ||--o{ profiles : "1-to-1 extension"
    users ||--o{ user_devices : "tracks max 2 active devices"
    users ||--o{ usage_logs : "tracks daily AI summary limits"
    users ||--o{ coupon_redemptions : "tracks atomic one-time usage"
    users ||--o{ bookmarks : "saves paper references"
    
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

## 8. Future Roadmap

Our infrastructure is highly modular, enabling rapid integration of complex future technologies.

```mermaid
gantt
    title ScholarHub AI Engineering Roadmap
    dateFormat  YYYY-MM-DD
    
    section Phase 1 (Core Infrastructure)
    Global API Fallback Architecture      :done,    des1, 2026-06-01,2026-06-06
    Smart Token Truncation Engine         :done,    des2, 2026-06-04,2026-06-06
    Universal Zero-Data Fallback          :done,    des3, 2026-06-01,2026-06-06
    
    section Phase 2 (Upcoming Enhancements)
    Vector DB & PDF RAG Integration       :active,  des4, 2026-06-15, 14d
    Redis Centralized Caching Engine      :         des5, after des4, 10d
    
    section Phase 3 (Enterprise Features)
    Real-Time Collaborative Workspace     :         des6, 2026-07-10, 20d
    Institutional SSO / SAML Integration  :         des7, 2026-07-25, 15d
```

---
*Document Generated by ScholarHub AI Architecture Audit Team. Validated against `routers/`, `utils/api.js`, and `middleware/` operational logic.*
