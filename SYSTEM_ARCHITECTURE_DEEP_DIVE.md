# 🏛️ ScholarHub AI: System Architecture Deep Dive

**An Enterprise-Grade Technical Reference**
*Target Audience: University Faculty, Senior Engineers, and System Architects.*
*Last Validated: June 2026 — against `utils/api.js`, `Auth.jsx`, `routers/ai.py`, `middleware/rate_limiter.py`, `parsers/openalex_parser.py`, and `components/PaperDetail.jsx`.*

---

## 1. End-to-End System Architecture

ScholarHub AI is built on a highly decoupled, modern microservices-inspired architecture designed to ensure that heavy AI inferencing and massive data pulls do not bottleneck the client experience.

```mermaid
graph TD
    Client["React/Vite SPA Client"]
    Turnstile["Cloudflare Turnstile CAPTCHA"]
    FastAPI["FastAPI Backend Server"]
    SupabaseDB[("Supabase PostgreSQL + RLS")]
    Auth[("Supabase Auth")]

    NCBI["NCBI PubMed"]
    Arxiv["arXiv API"]
    OpenAlex["OpenAlex API"]
    EPMC["Europe PMC"]

    Groq["Groq LPU — Llama 3.1"]
    OpenRouter["OpenRouter Fallback"]
    TogetherAI["Together AI Fallback"]

    Client -- "JWT Bearer Token + X-Device-ID" --> FastAPI
    Client -- "Captcha Token" --> Turnstile
    Turnstile -- "Validates Bot Check" --> Client

    FastAPI -- "Validates JWT / Queries Data" --> SupabaseDB
    FastAPI -- "Role & Auth Management" --> Auth

    FastAPI --> NCBI & Arxiv & OpenAlex & EPMC
    FastAPI -- "Context-Aware Prompts (Key Rotation)" --> Groq
    Groq -- "429 / 401 Exhausted" --> OpenRouter
    OpenRouter -- "Exhausted" --> TogetherAI
```

### Core Components:
| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 19 / Vite / Tailwind CSS v4 | UI rendering, optimistic state, session-scoped caching |
| **Backend Gateway** | FastAPI (async Python) | Auth middleware, portal routing, AI orchestration |
| **AI Inference** | Groq LPU (Llama 3.1 8B Instruct) | 800+ tokens/sec synthesis, chat, outreach, lit-review |
| **Database** | Supabase PostgreSQL + RLS | User data, usage logs, device fingerprints, bookmarks |
| **Auth** | Supabase Auth + Cloudflare Turnstile | JWT issuance, CAPTCHA bot-prevention on all auth flows |

---

## 2. Multi-Source Data Waterfall & OpenAlex Promotion

Querying legacy academic APIs is notoriously unstable. To provide uninterrupted service, the backend implements a highly resilient **Zero-Data & Error Fallback Cascade** located inside `routers/unified.py`.

> **⚠️ Breaking Change (June 2026):** Following the **deprecation of Semantic Scholar's public API**, OpenAlex has been explicitly promoted to the **primary source** for the Social Sciences, Law, and Chemistry portals. It also serves as the universal fallback engine for all other portals.

```mermaid
flowchart TD
    Start((User Query)) --> Router["FastAPI Router\nunified.py"]

    Router -->|"Bio / Pharma"| NCBI["NCBI PubMed API\n(Primary)"]
    Router -->|"Eng / Physics / Math"| ArXiv["arXiv API\n(Primary)"]
    Router -->|"Social / Law / Chem"| OpenAlexPrimary["OpenAlex API\n(Primary — replaces Semantic Scholar)"]

    NCBI -- "5xx / Timeout" --> EuropePMC["Europe PMC\n(Error Fallback)"]
    NCBI -- "0 Results" --> ZeroData1["Trigger Universal Fallback"]
    EuropePMC -- "Fails / 0 Results" --> ZeroData1

    ArXiv -- "5xx / Timeout / 0 Results" --> ZeroData2["Trigger Universal Fallback"]

    ZeroData1 & ZeroData2 --> OpenAlexUniv["OpenAlex Universal Engine"]

    OpenAlexUniv -- "0 Results" --> EmptyState["Return 200 OK\nEmpty Articles + AI Prompt"]
    OpenAlexUniv -- "Success" --> FlaggedReturn["Return Data\nswitched_to_universal = True"]

    NCBI -- "Success" --> CleanReturn["Return Data"]
    ArXiv -- "Success" --> CleanReturn
    OpenAlexPrimary -- "Success" --> CleanReturn
```

### The `switched_to_universal` Flag:
When the backend silently reroutes to OpenAlex, it sets `switched_to_universal = True` in the `SearchResponse` schema. The React frontend reads this flag and renders a contextual banner: *"Primary database lacked results. Automatically expanded search globally."*

---

## 3. Bulletproof Hybrid Infrastructure & Resilience Fixes

To guarantee 99.9% uptime despite utilizing free/hobby cloud tiers, we engineered robust fallback mechanisms across the full stack.

### 3.1 — Global Fetch Interceptor (`utils/api.js`)

The custom `window.fetch` override captures the native fetch **before** patching, ensuring the backup call always uses `originalFetch`. This architectural decision makes an **infinite retry loop structurally impossible**.

```mermaid
sequenceDiagram
    participant ReactClient as "React Frontend"
    participant Interceptor as "window.fetch Interceptor\n(utils/api.js)"
    participant Primary as "Primary Server\n(Render.com)"
    participant Backup as "Backup Server\n(Tailscale VPN)"

    ReactClient->>Interceptor: fetch('/api/search')
    Interceptor->>Primary: originalFetch → Forwards Request

    alt Primary Server Online
        Primary-->>Interceptor: 200 OK
        Interceptor-->>ReactClient: Returns Data ✅
    else Primary Returns 502 / 503 / 504
        Primary--XInterceptor: Gateway Error
        Note over Interceptor: Catches 5xx. Rewrites BASE_URL → BACKUP_URL
        Interceptor->>Backup: originalFetch → Seamless Retry
        Backup-->>Interceptor: 200 OK
        Interceptor-->>ReactClient: Returns Data (Zero user disruption) ✅
    end
```

**Anti-Loop Guarantee:** The backup call uses the pre-captured `originalFetch` reference — it does **not** re-enter the overridden `window.fetch`, making recursive loops architecturally impossible.

### 3.2 — Vercel SPA Rewrite (`vercel.json`)

Standard SPAs serve `index.html` only at the root. Navigating directly to `/research` or pressing refresh on `/paper/123` returns a **404 from Vercel's CDN** before React Router can intercept.

**Fix:** A catch-all rewrite rule in `vercel.json` offloads all server-side navigations back to `index.html`, leaving React Router to handle client-side routing.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 3.3 — Intelligent Auth Event Filtering (`App.jsx`)

Supabase fires `TOKEN_REFRESHED` on every browser tab focus via its internal `visibilitychange` listener. Without filtering, this unmounts and re-mounts the entire component tree — wiping `ResearchPage` state, closing AI panels, and causing disruptive loading spinners.

**Fix:** `onAuthStateChange` now classifies events into two categories:

| Event Type | Events | Action |
|---|---|---|
| **Significant** | `SIGNED_IN`, `SIGNED_OUT`, `INITIAL_SESSION`, `USER_UPDATED`, `PASSWORD_RECOVERY` | Show loading spinner, refetch profile |
| **Silent** | `TOKEN_REFRESHED` | Silently update `user` object only — no re-render |

```javascript
// App.jsx — onAuthStateChange handler
const isSignificantEvent = (
  _event === 'SIGNED_IN' || _event === 'SIGNED_OUT' ||
  _event === 'INITIAL_SESSION' || _event === 'USER_UPDATED' ||
  _event === 'PASSWORD_RECOVERY'
);
if (isSignificantEvent) {
  setIsInitializing(true);
  fetchAndSetProfile(session?.user ?? null);
} else {
  // TOKEN_REFRESHED — silent update only
  if (isMounted && session?.user) setUser(session.user);
}
```

---

## 4. AI Intelligence Layer — Inference, Truncation & Key Rotation

### 4.1 — Smart Truncation Pipeline (`routers/ai.py`)

Processing long academic texts risks triggering HTTP 413 (Payload Too Large) or provider rate limits. The backend applies a deterministic truncation cap before prompt construction.

```mermaid
flowchart LR
    Input["User Requests\nAI Summary / Chat / Lit-Review"] --> Router["FastAPI AI Router\n/ai/*"]
    Router --> Extract["Extract Abstracts\nfrom Top 5–15 Papers\n(tier-dependent)"]
    Extract --> Check{"Total chars\n> 15,000?"}
    Check -- "Yes" --> Truncate["Truncate to 15,000 chars\n+ append truncation notice"]
    Check -- "No" --> Prompt
    Truncate --> Prompt["Build System + User Prompts\nwith portal-specific context"]
    Prompt --> Groq["Groq LPU\n800+ tokens/sec"]
    Groq -- "Success" --> Output["Return Structured Output\n(Synthesis + Gaps / Chat reply)"]
    Groq -- "429 Rate Limit\nor 401 Auth Error" --> Rotate["Rotate to next\nGroq API Key"]
    Rotate --> Groq
```

### 4.2 — Three-Tier AI Key Rotation (`services/ai_service.py`)

The `generate_ai_response()` function implements a resilient, provider-agnostic key rotation strategy. All keys are **randomly shuffled per request** to distribute load evenly.

```mermaid
flowchart TD
    Call["generate_ai_response called"] --> ShuffleGroq["Shuffle HEAVY_GROQ_KEYS\n(randomized load distribution)"]
    ShuffleGroq --> TryGroq["Try Groq Key N"]
    TryGroq -- "Success" --> Return["Return AI Response ✅"]
    TryGroq -- "Exception (any)" --> NextGroq{"More Groq\nKeys?"}
    NextGroq -- "Yes" --> TryGroq
    NextGroq -- "No" --> ShuffleOR["Shuffle HEAVY_OPENROUTER_KEYS"]
    ShuffleOR --> TryOR["Try OpenRouter Key N"]
    TryOR -- "Success" --> Return
    TryOR -- "Exception" --> NextOR{"More OR\nKeys?"}
    NextOR -- "Yes" --> TryOR
    NextOR -- "No" --> TryTogether["Try Together AI\n(TOGETHER_API_KEY)"]
    TryTogether -- "Success" --> Return
    TryTogether -- "Fails" --> Raise["Raise: All AI providers exhausted\n→ 503 returned to client"]
```

---

## 5. Networking & Mentorship Hub — Contact & ORCID Extraction

The platform enables direct academic networking by parsing researcher contact data from raw API payloads at parse-time — no additional API requests required.

### 5.1 — Extraction Architecture

Data flows through a **parser-level extraction pipeline** embedded in each academic source's parser:

```mermaid
flowchart TD
    APIs["Raw API Payloads\n(NCBI / arXiv / OpenAlex / EPMC)"] --> Parsers["Source-Specific Parsers\nncbi_parser.py / arxiv_parser.py\nopenalex_parser.py / epmc_parser.py"]

    Parsers --> EmailRx["Email Regex Engine\nr'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'"]
    Parsers --> OrcidEx["ORCID Extractor\nauthor_obj.get('orcid')\n.replace('https://orcid.org/', '')"]

    EmailRx --> Schema["Article Schema\ncorresponding_email: Optional[str]"]
    OrcidEx --> Schema

    Schema --> Frontend["React PaperDetail.jsx\nRenders Contact Email\nand ORCID profile link"]
```

**Verified Extraction Sources:**
| Source | Email Field | ORCID Field |
|---|---|---|
| **OpenAlex** | `raw_affiliation_string` (regex) | `author.orcid` (direct) |
| **NCBI / PubMed** | Affiliation strings (regex) | Not consistently available |
| **arXiv** | Author affiliation text (regex) | Not consistently available |
| **Europe PMC** | Author correspondence field (regex) | Not consistently available |

All fields are declared `Optional[str] = None` in `models/schemas.py` — a `null` value from any source **never crashes the frontend**.

### 5.2 — AI Outreach Architect (`/ai/generate-outreach`)

The platform generates highly personalized outreach emails using **Context-Aware Grounding** — data already held in React component state is passed directly to the AI. No re-fetch of academic APIs is ever required, maximizing speed and minimizing costs.

```mermaid
flowchart TD
    User["User Opens PaperDetail.jsx"] --> Auth{"Tier Check\n(PaperDetail.jsx)"}
    Auth -- "Free Tier" --> UpgradeModal["Show Upgrade Modal\n(Starter / Pro required)"]
    Auth -- "Starter / Pro" --> Extract["Extract from React State:\npaper_title, abstract,\nfull_authors[0]"]

    Extract --> Request["POST /ai/generate-outreach\nHeaders: Bearer JWT + X-Device-ID\nBody: title, abstract, author_name"]

    Request --> RateCheck["check_ai_limit()\nVerify device + daily quota"]
    RateCheck -- "Quota OK" --> Log["log_ai_usage()\nInsert to usage_logs"]
    Log --> Truncate["Smart Truncation\nabstract > 3000 chars → cap"]
    Truncate --> AIEngine["generate_ai_response()\nGroq Llama 3.1\ntemp=0.6, max_tokens=300"]
    AIEngine --> Rules["Enforce Grounding Rules:\n1. Use ONLY provided title + abstract\n2. Extract one specific methodology\n3. Keep email < 200 words\n4. Include [Your Name] placeholders"]
    Rules --> Draft["Return Formatted Email Draft"]
    Draft --> UI["Render in PaperDetail Modal\nCopy to Clipboard or open mailto:"]

    RateCheck -- "Quota Exceeded" --> E429["429 Too Many Requests"]
    AIEngine -- "All Providers Exhausted" --> Rollback["rollback_ai_usage(log_id)\nDelete orphaned usage log"]
    Rollback --> E500["500 Error — Friendly message to user"]
```

---

## 6. Character-Driven UX & EMO Mascot System

ScholarHub AI deliberately diverges from sterile academic database aesthetics by implementing a fully character-driven, human-centered interface powered by the **EMO mascot**.

### 6.1 — The Evolution of EMO

| Stage | Description |
|---|---|
| **v1 — Generic Icon** | `<Smile />` Lucide icon in a plain indigo button |
| **v2 — Character Mascot** | Custom `EMO.png` with CSS drop-shadow, `framer-motion` breathing animation |
| **v3 — Premium Widget** | EMO rendered in a glassmorphic pill container with an indigo border glow, dismissible tooltip, and dual floating+breathing animation |

**Animation Specification (SupportBot.jsx — `framer-motion`):**
```javascript
// Breathing effect on floating button
animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}

// Thinking animation during AI response generation
animate={{ scale: [1, 1.15, 1], rotate: [-5, 5, -5] }}
transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
```

### 6.2 — Auth UI Redesign (`Auth.jsx`)

The authentication flow has been completely overhauled using a **responsive dual-layout** strategy:

```mermaid
flowchart LR
    subgraph Mobile ["📱 Mobile — App-Style Flow"]
        direction TB
        MTop["Vibrant Indigo Hero\n(40vh)\nEMO Mascot floating\nframer-motion animate y: 0 → -10 → 0"]
        MCard["Overlapping Auth Card\nrounded-t-3rem\nPill Toggle: Login / Sign Up\nTurnstile + Submit Button"]
        MFeat["Scrollable Below Fold\n'Why Researchers Choose Us'\n4 Feature Blocks:\n800+ t/s, RLS, 2-Device, Multi-API"]
        MTop --> MCard --> MFeat
    end

    subgraph Desktop ["🖥️ Desktop — Neo-Minimal Split-Screen"]
        direction TB
        DLeft["Left Panel — Slate 900 Dark\nMesh Gradient Blobs\nScholarHub AI Branding\nEMO Mascot (320px)\nTrust the Truth — Feature List"]
        DRight["Right Panel — Slate 50 Light\nCentered Auth Card\nrounded-2.5rem + shadow\nPill Toggle + Neo-Minimal Inputs\nTurnstile CAPTCHA + CTA Button\nSpam Folder reminder on success"]
        DLeft --- DRight
    end
```

**Security logic is preserved 100%** across both layouts: Cloudflare Turnstile is rendered in Step 1 for both Login and Signup flows, keeping the submit button `disabled` until `captchaToken` is populated.

---

## 7. Security & SaaS Integrity Fortress

Security is woven into the foundation of the platform to protect API endpoints and subscription revenue.

```mermaid
flowchart TD
    User --> Turnstile["Cloudflare Turnstile\nBot Prevention on all Auth flows"]
    Turnstile -->|"CAPTCHA Token"| SupabaseAuth["Supabase Auth\nJWT Issuance"]
    SupabaseAuth -->|"JWT Bearer Token"| Client["Client localStorage\nscholarhub_device_id"]
    Client -->|"API Request + JWT + X-Device-ID"| Middleware["FastAPI Auth Middleware\nmiddleware/auth.py"]
    Middleware -->|"Cryptographically verifies JWT"| DeviceCheck["check_ai_limit()\nX-Device-ID in user_devices?"]
    DeviceCheck -- "Device NOT registered" --> E403["403 Forbidden\nUnregistered Device"]
    DeviceCheck -- "Device OK" --> QuotaCheck["Daily Quota Check\nusage_logs count for today"]
    QuotaCheck -- "Quota Exceeded" --> E429["429 Too Many Requests"]
    QuotaCheck -- "Quota OK" --> DB["PostgreSQL with Row Level Security\nUser can only read/write own rows"]
    DB --> BizLogic["Execute Business Logic"]
```

### Key Security Layers:

1. **Stateless JWT Validation** — Every protected endpoint verifies the JWT signature against Supabase Auth. No implicit trust.
2. **Row Level Security (RLS)** — PostgreSQL policies physically prevent cross-user data access at the engine level. Users can only access their own `usage_logs`, `user_devices`, and `bookmarks`.
3. **Device Fingerprinting** — `crypto.randomUUID()` generates a stable browser fingerprint stored in `localStorage`. The backend validates this on every AI request. Max 2 devices per account.
4. **Silent Device Sync (`deviceSync.js`)** — Runs idempotently in the background on `SIGNED_IN` and `INITIAL_SESSION` events to register devices that bypass `Auth.jsx` (e.g., email confirmation links).
5. **Global 402 Interception** — `apiFetch()` in `utils/api.js` catches HTTP 402 globally, fires a `scholarhub:session-expired` custom event, and immediately downgrades the client's profile tier to `free` without a page reload.

### Database Schema Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o{ profiles : "1-to-1 extension"
    users ||--o{ user_devices : "max 2 active devices"
    users ||--o{ usage_logs : "tracks daily AI summary limits"
    users ||--o{ coupon_redemptions : "atomic one-time usage"
    users ||--o{ bookmarks : "saves paper references"

    profiles {
        uuid id PK
        string full_name
        string academic_field
        string unlocked_portal
        string user_tier "free / starter / pro"
        timestamp plan_expiry_date "Auto-downgrade on expiry"
    }

    usage_logs {
        uuid id PK
        uuid user_id FK
        string action "ai_summary"
        date usage_date
        note limits "Free=3 | Starter=50 | Pro=100 per day"
    }

    user_devices {
        uuid id PK
        uuid user_id FK
        string device_id "crypto.randomUUID()"
        string device_name "Windows PC / Mac / Mobile"
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

    section Phase 1 — Core Infrastructure (COMPLETE)
    Global API Fallback Architecture      :done, des1, 2026-06-01, 2026-06-06
    Smart Token Truncation Engine         :done, des2, 2026-06-04, 2026-06-06
    Universal Zero-Data Fallback          :done, des3, 2026-06-01, 2026-06-06
    AI Outreach & Networking Hub          :done, des4, 2026-06-07, 2026-06-10
    Character-Driven EMO Auth UI          :done, des5, 2026-06-08, 2026-06-10
    QA Security Audit & Bug Fixes         :done, des6, 2026-06-10, 2026-06-11

    section Phase 2 — Upcoming Enhancements
    Vector DB & PDF RAG Integration       :active, des7, 2026-06-15, 14d
    Redis Centralized Caching Engine      :        des8, after des7, 10d

    section Phase 3 — Enterprise Features
    Real-Time Collaborative Workspace     :        des9,  2026-07-10, 20d
    Institutional SSO / SAML Integration  :        des10, 2026-07-25, 15d
```

---

*Document Generated by ScholarHub AI Architecture Audit Team.*
*Validated against: `utils/api.js`, `Auth.jsx`, `routers/ai.py`, `middleware/rate_limiter.py`, `parsers/openalex_parser.py`, `components/PaperDetail.jsx`, `utils/deviceSync.js`.*
*Last full QA audit: June 10, 2026. No known defects at time of publication.*
