# 🏛️ ScholarHub AI: System Architecture Deep Dive

**An Enterprise-Grade Technical Reference**
*Target Audience: University Faculty, Senior Engineers, and System Architects.*
*Last Validated: June 11, 2026 — against `utils/api.js`, `supabaseClient.js`, `Auth.jsx`, `routers/ai.py`, `routers/unified.py`, `middleware/rate_limiter.py`, `parsers/arxiv_parser.py`, `parsers/openalex_parser.py`, `components/PaperDetail.jsx`, `utils/deviceSync.js`, `vercel.json`, `main.py`, `config.py`.*

---

## Table of Contents

1. [End-to-End System Architecture](#1-end-to-end-system-architecture)
2. [Security & SaaS Integrity Fortress](#2-security--saas-integrity-fortress)  ← *Core Pillar — Read First*
3. [Multi-Source Data Waterfall](#3-multi-source-data-waterfall--openalex-promotion)
4. [Bulletproof Hybrid Infrastructure & Resilience](#4-bulletproof-hybrid-infrastructure--resilience-fixes)
5. [AI Intelligence Layer](#5-ai-intelligence-layer--inference-truncation--key-rotation)
6. [Networking & Mentorship Hub](#6-networking--mentorship-hub--contact--orcid-extraction)
7. [Character-Driven UX & EMO Mascot System](#7-character-driven-ux--emo-mascot-system)
8. [Journal Quality Intelligence Layer](#8-journal-quality-intelligence-layer)
9. [Database Schema](#9-database-schema--er-diagram)
10. [Future Roadmap](#10-future-roadmap)

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
    Unpaywall["Unpaywall API"]
    PMC_Meta["PMC Metadata API"]
    CORE["CORE API"]

    Groq["Groq LPU — Llama 3.1"]
    OpenRouter["OpenRouter Fallback"]
    TogetherAI["Together AI Fallback"]

    Client -- "JWT Bearer Token + X-Device-ID" --> FastAPI
    Client -- "Captcha Token" --> Turnstile
    Turnstile -- "Validates Bot Check" --> Client

    FastAPI -- "Validates JWT / RLS-Backed Queries" --> SupabaseDB
    FastAPI -- "Role & Auth Management" --> Auth

    FastAPI --> NCBI & Arxiv & OpenAlex & EPMC & Unpaywall & PMC_Meta & CORE
    FastAPI -- "Context-Aware Prompts (Key Rotation)" --> Groq
    Groq -- "429 / 401 Exhausted" --> OpenRouter
    OpenRouter -- "Exhausted" --> TogetherAI
```

### Core Component Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 19 / Vite / Tailwind CSS v4 | UI rendering, optimistic state, session-scoped caching |
| **Backend Gateway** | FastAPI (async Python) | Auth middleware, portal routing, AI orchestration, Unpaywall & PMC integrations |
| **AI Inference** | Groq LPU (Llama 3.1 8B Instruct) | 800+ tokens/sec synthesis, chat, outreach, lit-review, gap-analysis |
| **Database** | Supabase PostgreSQL + **RLS** | User data, usage logs, device fingerprints, bookmarks, audit_history |
| **Auth** | Supabase Auth + Cloudflare Turnstile | JWT issuance, CAPTCHA bot-prevention on all auth flows |

---

## 2. Security & SaaS Integrity Fortress

> **This is the most critical architectural pillar.** Security is not a layer added on top — it is woven into every request lifecycle, from the first browser interaction through to database query execution.

### 2.1 — Full Security Request Lifecycle

```mermaid
flowchart TD
    Browser["User Opens Browser"] --> Turnstile["① Cloudflare Turnstile\nBot Prevention CAPTCHA\non every Login & Signup"]
    Turnstile -->|"CAPTCHA Token"| SupabaseAuth["② Supabase Auth\nJWT Issuance + Email Verification"]
    SupabaseAuth -->|"JWT Bearer Token"| LocalStorage["③ Client State\njwt stored in session\ndevice_id = crypto.randomUUID()\nin localStorage"]

    LocalStorage -->|"Every AI Request:\nAuthorization: Bearer JWT\nX-Device-ID: uuid"| AuthMiddleware["④ FastAPI Auth Middleware\nmiddleware/auth.py\nCryptographically verifies JWT\nvia Supabase ANON KEY"]

    AuthMiddleware -- "JWT Invalid / Missing" --> E401["401 Unauthorized\nRequest rejected"]
    AuthMiddleware -- "JWT Valid" --> DeviceCheck["⑤ Device Fingerprint Check\ncheck_ai_limit()\nX-Device-ID registered\nin user_devices table?"]

    DeviceCheck -- "Not Registered" --> E403["403 Forbidden\nUnregistered Device\nAccess Denied"]
    DeviceCheck -- "Registered" --> QuotaCheck["⑥ Daily Quota Enforcement\nCount usage_logs for today\nFree=3 / Starter=50 / Pro=100"]

    QuotaCheck -- "Limit Exceeded" --> E429["429 Too Many Requests"]
    QuotaCheck -- "Within Quota" --> RLS["⑦ PostgreSQL Row Level Security\nPhysical DB-level policy:\nUSERS CAN ONLY READ/WRITE\nTHEIR OWN ROWS"]

    RLS --> BizLogic["⑧ Execute Business Logic\nAI Inference, Search, Bookmarks"]
    BizLogic --> SubTier["⑨ Subscription Tier Check\nPlan expiry auto-enforcement\n402 → fires global session-expired event"]
```

### 2.2 — The Five Security Pillars (Detailed)

#### ① Cloudflare Turnstile — Entry Gate
- CAPTCHA verification is required on **every** authentication action: Login, Sign Up, and Forgot Password.
- The `captchaToken` is sent directly to Supabase Auth's `signInWithPassword` and `signUp` options.
- The submit button remains **`disabled`** in React until `setCaptchaToken(token)` is populated via `onSuccess` callback.
- Prevents automated credential stuffing, bot signups, and brute-force attacks before a single database query is made.

#### ② Stateless JWT Validation — Identity Verification
- The FastAPI backend **never trusts the client**. Every protected endpoint calls the Supabase Auth server to verify the JWT cryptographic signature.
- Token validity is checked per-request using the `SUPABASE_ANON_KEY` as the verification key.
- There is no session cookie, no server-side session store — the system is fully stateless and horizontally scalable.

```python
# middleware/auth.py — JWT verification pattern
user_res = requests.get(
    f"{SUPABASE_URL}/auth/v1/user",
    headers={"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY}
)
```

#### ③ PostgreSQL Row Level Security (RLS) — Data Isolation Fortress
- RLS policies are enforced at the **PostgreSQL engine level** — not in application code. This means even a compromised backend cannot read another user's data without correct identity credentials.
- **Enforced tables:** `usage_logs`, `user_devices`, `bookmarks`, `coupon_redemptions`.
- Policy pattern: `USING (auth.uid() = user_id)` — a user's JWT is transparently compared against the `user_id` column on every SELECT, INSERT, UPDATE, and DELETE.
- The service role key (`SUPABASE_SERVICE_KEY`) is used **only** for admin operations (usage counting, device upsert) and is never exposed to the client.

#### ④ Device Fingerprinting — Account Integrity Enforcement
- On first login, `crypto.randomUUID()` generates a stable UUID stored in `localStorage` under the key `scholarhub_device_id`.
- This ID is sent as `X-Device-ID` header on every AI endpoint request.
- The backend's `check_ai_limit()` middleware queries `user_devices` to verify registration before allowing any AI operation.
- **Maximum 2 devices** per account. A 3rd device receives a `403 Forbidden` response, blocking feature access without signing out of existing devices.
- `deviceSync.js` runs silently in the background via `App.jsx`'s `onAuthStateChange` listener to register devices that bypass `Auth.jsx` (e.g., email confirmation link flows).

#### ⑤ Global 402 Session Expiry Interception
- `apiFetch()` in `utils/api.js` intercepts every HTTP 402 response globally.
- On detection, it fires a custom DOM event `scholarhub:session-expired` which `App.jsx` listens for.
- `App.jsx` immediately downgrades the global profile state to `'free'` tier without a page reload, preserving all current UI state.
- The `rate_limiter.py` backend automatically patches `profiles.user_tier = 'free'` and clears `plan_expiry_date` on detection of an expired plan.

### 2.3 — SaaS Quota Enforcement Summary

| Tier | Daily AI Summaries | Portals | Devices |
|---|---|---|---|
| **Free** | 3 / day | All 7 portals (Unlocked) | 2 |
| **Starter** | 50 / day | All 7 portals (Unlocked) | 2 |
| **Pro** | 100 / day | All 7 portals (Unlocked) | 2 |

*Note: In addition to daily quotas, a strict **Burst Rate Limit** (Anti-Token Squeezing) is enforced via `usage_logs`. Users are strictly capped at 5 AI requests per minute to prevent script-based API abuse.*

### 2.4 — ISO Timestamp Parsing Resilience (`safe_fromisoformat`)

Supabase PostgreSQL returns timestamps with **arbitrary fractional-second precision** (e.g. `2026-07-11T13:53:24.3504+00:00` — 4-digit fractional). Python's strict `datetime.fromisoformat()` only accepts exactly 0, 3, or 6 fractional digits, causing a `ValueError` crash in the plan expiry auto-downgrade middleware.

**Fix:** A centralized `safe_fromisoformat()` helper in `middleware/rate_limiter.py` normalizes fractional seconds to exactly 6 digits before parsing:

```python
def safe_fromisoformat(date_str: str) -> datetime:
    s = date_str.replace('Z', '+00:00')
    if '.' in s:
        parts = s.split('.')
        before_dot = parts[0]
        after_dot = parts[1]
        # Find timezone offset in fractional part
        tz_index = next((after_dot.find(sym) for sym in ('+', '-') if after_dot.find(sym) != -1), -1)
        if tz_index != -1:
            frac = after_dot[:tz_index]
            tz = after_dot[tz_index:]
        else:
            frac = after_dot
            tz = ''
        frac = (frac + '000000')[:6]  # Pad/truncate to exactly 6 digits
        s = f"{before_dot}.{frac}{tz}"
    return datetime.fromisoformat(s)
```

**Applied in:**
- `middleware/rate_limiter.py` → `get_user_tier()` and `verify_portal_access()` (plan expiry auto-downgrade)
- `routers/unified.py` → `redeem_coupon()` (coupon expiry validation)
- `parsers/arxiv_parser.py` → Inline normalization for publication date strings

---

## 3. Multi-Source Data Waterfall & OpenAlex Promotion

Querying legacy academic APIs is notoriously unstable. To provide uninterrupted service, the backend implements a highly resilient **Zero-Data & Error Fallback Cascade** inside `routers/unified.py`.

> **Breaking Change (June 2026):** Following the **deprecation of Semantic Scholar's public API**, OpenAlex has been explicitly promoted to the **primary source** for Social Sciences, Law, and Chemistry portals. It also serves as the universal fallback engine for all other portals.

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
When the backend silently reroutes to OpenAlex, it sets `switched_to_universal = True` in `SearchResponse`. The React frontend reads this flag and renders a contextual banner: *"Primary database lacked results. Automatically expanded search globally."*

---

## 4. Bulletproof Hybrid Infrastructure & Resilience Fixes

### 4.1 — Global Fetch Interceptor (`utils/api.js`)

The custom `window.fetch` override captures the native fetch **before** patching, ensuring the backup call always uses `originalFetch`. This makes an **infinite retry loop structurally impossible**.

```mermaid
sequenceDiagram
    participant ReactClient as "React Frontend"
    participant Interceptor as "window.fetch Interceptor"
    participant Primary as "Primary Server (Render.com)"
    participant Backup as "Backup Server (Tailscale VPN)"

    ReactClient->>Interceptor: fetch('/api/search')
    Interceptor->>Primary: originalFetch → Forwards Request

    alt Primary Server Online
        Primary-->>Interceptor: 200 OK
        Interceptor-->>ReactClient: Returns Data ✅
    else Primary Returns 502 / 503 / 504
        Primary--XInterceptor: Gateway Error
        Note over Interceptor: Catches 5xx. Rewrites BASE_URL to BACKUP_URL
        Interceptor->>Backup: originalFetch → Seamless Retry
        Backup-->>Interceptor: 200 OK
        Interceptor-->>ReactClient: Returns Data (Zero user disruption) ✅
    end
```

### 4.2 — Vercel SPA Rewrite (`vercel.json`)

Navigating directly to `/research` or refreshing `/paper/123` returns a 404 from Vercel's CDN before React Router can intercept. A catch-all rewrite rule resolves this:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 4.3 — Intelligent Auth Event Filtering (`App.jsx`)

Supabase fires `TOKEN_REFRESHED` on every browser tab focus, which without filtering, re-mounts the entire component tree — wiping `ResearchPage` state and causing disruptive loading spinners.

| Event Type | Events | Action |
|---|---|---|
| **Significant** | `SIGNED_IN`, `SIGNED_OUT`, `INITIAL_SESSION`, `USER_UPDATED`, `PASSWORD_RECOVERY` | Show loading spinner, re-fetch profile |
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

### 4.4 — Backend Asynchronous Hardening & Cache Stampede Protection

To prevent synchronous network requests from blocking the FastAPI async event loop, and to eliminate cache stampedes on third-party academic API calls:
- **Event Loop Offloading (`asyncio.to_thread`)**: Heavy synchronous HTTP operations (such as scraping OpenAlex and PubMed raw XML metadata via `requests.get`) are offloaded to background worker threads using `asyncio.to_thread`. This allows FastAPI to process thousands of concurrent client requests without suffering CPU loop starvation.
- **Cache Stampede Locks (`asyncio.Lock()`)**: Concurrent identical search queries are synchronized via local memory locks. If a cache miss occurs, the first request acquires the lock and initiates the external database query while subsequent concurrent requests block and wait for the lock to release, reading the newly populated cache result without overloading third-party academic APIs.
```

---

## 5. AI Intelligence Layer — Inference, Truncation & Key Rotation

### 5.1 — Smart Truncation Pipeline (`routers/ai.py` & `Auditor.jsx`)

To ensure that the context budget is utilized effectively without causing a total mismatch or missing selected papers, ScholarHub implements an **Adaptive Truncation** context builder:

1. **Titles & Numbers Pre-loading:**
   The context builder always includes the Titles and Numbers (1 to X) of **all** selected papers at the beginning of the context payload. This ensures that the AI is fully aware of every paper's existence in the workspace, even if the abstract is truncated.
2. **Abstract Character Allocation:**
   The remaining character budget (up to 15,000 characters) is then incrementally filled with article abstracts, prioritizing higher-ranked papers (Q1/Q2 journal quartile SJR rankings).

```mermaid
flowchart LR
    Input["User Requests AI Summary\n/ Chat / Lit-Review / Gap-Analysis"] --> ContextBuilder["Adaptive Context Builder\n1. Titles & Numbers of 1..X\n2. Abstracts up to 15k limit\n(Priority: Q1 -> Q2 -> Q3 -> Q4)"]
    ContextBuilder --> Prompt["Build System + User Prompts\nwith user profile & portal context"]
    Prompt --> Groq["Groq LPU 800+ tokens/sec"]
    Groq -- "Success" --> Output["Structured Output\nSynthesis + Gaps / Chat reply"]
    Groq -- "429 / 401" --> Rotate["Rotate to next Groq API Key"]
    Rotate --> Groq
```

### 5.2 — AI Identity Guard & Persona-Aware Alignment
- **AI Identity Guard:** The backend routers enforce a strict prompt constraint: *"You have been provided with a list of X papers. Even if some abstracts are brief, you must acknowledge every paper by its number. Never claim a paper does not exist if it is within the range 1 to X."*
- **Persona-Aware Alignment:** The frontend `executeAudit` passes the user's `profile.academic_field` and `profile.academic_status` context to the `/ai/audit` endpoint. The backend uses this to generate a personalized **Relevance Match Meter** percentage score and a 1-sentence justification for top papers.

### 5.3 — Universal AI Gateway v3.1 Waterfall Resolution Chain (`services/ai_service.py`)

To ensure high availability and absolute control over API credentials, ScholarHub AI utilizes a multi-tier fallback cascade:

```mermaid
flowchart TD
    Call["generate_ai_response called"] --> TryDBPrimary["① Try DB Primary Overrides\n(ai_feature_registry.current_provider)"]
    TryDBPrimary -- "Success" --> Return["Return AI Response ✅"]
    TryDBPrimary -- "Failure / Timeout" --> TryDBBackups["② Try DB Backup Cascade\n(custom_fallback_configs array\nsorted by Priority Index)"]
    
    TryDBBackups -- "Success" --> Return
    TryDBBackups -- "All Backups Fail" --> TryEnvDefaults["③ Try System ENV Defaults\n(Check api_routing_config overrides\nor fallback to config.py keys)"]
    
    TryEnvDefaults -- "Success" --> Return
    TryEnvDefaults -- "All Providers Exhausted" --> Raise["Raise: ResolutionImpossible\n→ 503 returned to client"]
```

#### Key Architecture Principles:
- **Unified Credential Resolution**: The backend first queries database-driven overrides via the `api_routing_config` table before checking local environment settings in `config.py`.
- **Atomic Cache Evictions**: Saves inside the Admin Console automatically issue eviction triggers to the Upstash Redis REST API to delete the cache key `ai_feature_route:{feature_id}` instantly, maintaining sub-100ms sync times.

---

## 6. Networking & Mentorship Hub — Contact & ORCID Extraction

### 6.1 — Parser-Level Extraction Pipeline

Researcher contact data is extracted at **parse-time** from raw API payloads — no additional API requests are needed.

```mermaid
flowchart TD
    APIs["Raw API Payloads\nNCBI / arXiv / OpenAlex / EPMC"] --> Parsers["Source-Specific Parsers\nncbi_parser.py / arxiv_parser.py\nopenalex_parser.py / epmc_parser.py"]

    Parsers --> EmailRx["Email Regex Engine\nr'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'\nScans: raw_affiliation_string\nauthor correspondence fields"]
    Parsers --> OrcidEx["ORCID Extractor\nauthor_obj.get('orcid')\n.replace('https://orcid.org/', '')"]

    EmailRx --> Schema["Pydantic Article Schema\ncorresponding_email: Optional[str] = None"]
    OrcidEx --> Schema

    Schema --> Frontend["React PaperDetail.jsx\nRenders Contact Email button\nORCID → verified profile link"]
```

| Source | Email Field | ORCID Field |
|---|---|---|
| **OpenAlex** | `raw_affiliation_string` (regex) | `author.orcid` (direct field) |
| **NCBI / PubMed** | Affiliation strings (regex) | Not consistently available |
| **arXiv** | Author affiliation text (regex) | Not consistently available |
| **Europe PMC** | Author correspondence field (regex) | Not consistently available |

> All fields are `Optional[str] = None` in `models/schemas.py`. A `null` from any source **never crashes the frontend.**

### 6.2 — AI Outreach Architect (`POST /ai/generate-outreach`)

Personalized outreach emails are generated using **Context-Aware Grounding** — data already in React state is passed directly, eliminating any re-fetch of academic APIs.

```mermaid
flowchart TD
    User["User Opens PaperDetail.jsx"] --> TierCheck{"Tier Check"}
    TierCheck -- "Free" --> UpgradeModal["Show Upgrade Modal\n(Starter / Pro required)"]
    TierCheck -- "Starter / Pro" --> Extract["Extract from React State:\npaper_title, abstract, full_authors[0]"]

    Extract --> Request["POST /ai/generate-outreach\nAuthorization: Bearer JWT\nX-Device-ID: uuid"]

    Request --> DeviceVerify["Verify X-Device-ID\nregistered in user_devices\n→ 403 if unregistered"]
    DeviceVerify --> QuotaCheck["Daily Quota Check\ncheck_ai_limit()"]
    QuotaCheck -- "Exceeded" --> E429["429 Too Many Requests"]
    QuotaCheck -- "OK" --> Log["log_ai_usage()\nInsert to usage_logs"]
    Log --> Truncate["Smart Truncation\nabstract > 3000 chars → cap"]
    Truncate --> AIEngine["generate_ai_response()\nGroq Llama 3.1\ntemp=0.6, max_tokens=300"]
    AIEngine --> Rules["Grounding Rules Enforced:\n1. Use ONLY title + abstract\n2. Extract specific methodology\n3. Keep email < 200 words\n4. Add placeholder [Your Name]"]
    Rules --> Draft["Return Formatted Email Draft"]
    Draft --> UI["Copy to Clipboard / Open mailto:"]

    AIEngine -- "All Providers Exhausted" --> Rollback["rollback_ai_usage(log_id)\nDelete orphaned usage log entry"]
    Rollback --> E500["500 + Friendly Error Message"]
```

---

## 7. Character-Driven UX & EMO Mascot System

### 7.1 — The Evolution of EMO

| Version | Description |
|---|---|
| **v1 — Generic Icon** | `<Smile />` Lucide icon in a plain indigo circular button |
| **v2 — Character Mascot** | Custom `EMO.png` with `drop-shadow-2xl`, `framer-motion` infinite float animation |
| **v3 — Premium Widget** | EMO in a glassmorphic pill container, indigo border glow, dismissible "Need help?" tooltip, dual floating + breathing animation |

**Verified Animation Spec (`SupportBot.jsx`):**
```javascript
// Floating button — breathing effect
animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}

// Chat header — thinking animation during AI response
animate={{ scale: [1, 1.15, 1], rotate: [-5, 5, -5] }}
transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
```

### 7.2 — Auth UI Redesign (`Auth.jsx`)

The authentication flow uses a **responsive dual-layout** strategy validated against real device breakpoints:

```mermaid
flowchart LR
    subgraph Mobile ["📱 Mobile — App-Style Flow"]
        direction TB
        MTop["Vibrant Indigo Hero (40vh)\nEMO Mascot floating\ny: 0 → -10 → 0 (3s loop)"]
        MCard["Overlapping Auth Card\nrounded-t-3rem\nPill Toggle: Login / Sign Up\nTurnstile CAPTCHA\nSubmit Button (disabled until verified)"]
        MFeat["Scrollable Below Fold\n'Why Researchers Choose Us'\n4 Feature Cards:\n800+ t/s · RLS · 2-Device · Multi-API"]
        MTop --> MCard --> MFeat
    end

    subgraph Desktop ["🖥️ Desktop — Neo-Minimal Split-Screen"]
        direction TB
        DLeft["Left Panel — Slate 900 Dark\nMesh Gradient Blobs\nScholarHub AI Logo\nEMO Mascot 320px\n'Trust the Truth' Feature List"]
        DRight["Right Panel — Slate 50 Light\nCentered Auth Card\nrounded-2.5rem shadow-xl\nPill Toggle (spring animated)\nNeo-Minimal Inputs\nTurnstile CAPTCHA\nCTA Button\nSpam Folder reminder on success"]
        DLeft --- DRight
    end
```

> **100% Functional Parity:** Cloudflare Turnstile is rendered in Step 1 for both Login AND Signup. The submit button is `disabled` until `captchaToken` is set. Supabase Auth, device sync, and all error handling remain intact across both layouts.

---

## 8. Journal Quality Intelligence Layer

To provide researchers with immediate credibility indicators, ScholarHub integrates a high-performance journal ranking pipeline.

### 8.1 — Data Source & Storage
- Integrates the comprehensive **Scimago (SJR) Dataset** (32,000+ records).
- Stored efficiently in the Supabase `journal_rankings` table.

### 8.2 — High-Performance Batch Lookup Engine
- **O(1) Network Overhead:** Instead of performing expensive N+1 queries per article, the backend aggregates all unique journal names from the search results.
- **SQL ANY() Equivalent:** It executes **exactly ONE asynchronous batch query** using dynamically constructed `.or_()` conditions to fetch all relevant candidates simultaneously, maximizing scalability and ensuring zero noticeable latency.

### 8.3 — Fuzzy Matching & Normalization
Journals, especially from preprint servers like arXiv, often have unpredictable formatting (e.g., "Phys. Rev. D" vs "Physical Review D"). The backend resolves this via a multi-stage fuzzy matching engine:
- **Normalization:** Aggressive alphanumeric cleaning (`re.sub(r'[^a-z0-9\s]', '')`) of both incoming queries and database titles to eliminate punctuation and casing discrepancies.
- **Keyword Wildcards (`%word%`):** Translates normalized names into `%word1%word2%` wildcards, using Postgres `.ilike()` to fetch all possible abbreviations and permutations.
- **Length-Distance Validation:** If an exact normalized match fails, a fallback regex substring search is used. To prevent a short title like *'Nature'* from hijacking the ranking of *'Nature Physics'*, the engine calculates the string length difference and strictly assigns the quartile to the closest match.

### 8.4 — Frontend Visual Indicators
- The `ArticleGrid.jsx` component conditionally renders elegant Q1–Q4 badges right next to the journal name based on the `journal_quartile` field.
- **Color Coding:** Q1 (Emerald/Green), Q2 (Blue/Indigo), Q3 (Amber/Orange), Q4 (Slate/Gray).
- **Graceful Degradation:** If a ranking isn't found (e.g., niche preprints), the badge safely omits itself without breaking the card layout or hiding the journal name.

---

## 9. Database Schema & ER Diagram

The architecture relies on strict relational integrity and PostgreSQL RLS policies within Supabase.

```mermaid
erDiagram
    users ||--o{ profiles : "1-to-1 extension"
    users ||--o{ user_devices : "max 2 active devices"
    users ||--o{ usage_logs : "tracks daily AI summary limits"
    users ||--o{ coupon_redemptions : "atomic one-time usage"
    users ||--o{ bookmarks : "saves paper references"
    users ||--o{ audit_history : "saves Auditor chat sessions"
    users ||--o{ user_feedback : "submits reports"

    profiles {
        uuid id PK
        string full_name
        string academic_field
        string academic_status
        string user_tier "free / starter / pro"
        timestamp plan_expiry_date "Auto-downgraded on expiry"
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
        string device_id "crypto.randomUUID() — browser fingerprint"
        string device_name "Windows PC / Mac / Mobile Device"
    }

    audit_history {
        uuid id PK
        uuid user_id FK
        string title
        jsonb papers
        jsonb chat_history
        timestamp created_at
        timestamp updated_at
    }

    user_feedback {
        uuid id PK
        uuid user_id FK "nullable"
        string email
        string category "bug/feature/general/billing"
        string message
        string image_url "Base64 encoded screenshot Data URL"
        timestamp created_at
    }

    api_routing_config {
        uuid id PK
        string provider "groq/mistral/nvidia/openrouter"
        string model_id
        string api_key "masked"
        boolean use_db_config
        timestamp updated_at
    }

    ai_feature_registry {
        string feature_id PK
        string current_provider
        string current_model
        text_array fallback_chain
        jsonb_array custom_fallback_configs
        boolean is_overridden
        string override_api_key
        string custom_api_url
        timestamp updated_at
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

## 9.5. Supabase RLS Policy Hardenings

To secure sensitive configuration overrides and user reports, the following physical database-level security rules are enforced:
- **`user_feedback`**: Anyone (`anon` or `authenticated`) can execute INSERT operations. Only the backend `service_role` has permissions to SELECT/read feedback cards.
- **`api_routing_config` & `ai_feature_registry`**: Write & read queries are restricted exclusively to authenticated admin profiles and the system `service_role`.```

---

## 10. Diagram Viewer & Mermaid Graphics Engine

ScholarHub features an interactive visual diagramming system integrated directly into the conversational feed using Mermaid.js.

### 10.1 — Semantic Coloring System
The AI is instructed to apply styled CSS classes to Mermaid nodes:
*   **Outcomes / Results:** Green fill (`#dcfce7`), stroke (`#166534`), and text (`#14532d`).
*   **Methodology / Processes:** Blue fill (`#dbeafe`), stroke (`#1e40af`), and text (`#1e3a8a`).
*   **Observations / Data:** Amber fill (`#fff7ed`), stroke (`#9a3412`), and text (`#7c2d12`).

### 10.2 — specialized Zoom & Pan Controls
The Diagram Viewer modal employs `react-zoom-pan-pinch` for dynamic manipulation of Mermaid SVGs:
*   **Scroll-wheel sensitivity:** Scaled down to a factor of 0.1 for high-resolution precision.
*   **Interaction:** Full support for Drag & Grab panning. SVGs are normalized with `height: 100%` and `width: auto` to prevent clipping or viewport overflows.
*   **Mobile-First Design:** Buttons ([Zoom Controls], [Download PNG], [Close X]) fit cleanly on a single row without wrapping on mobile viewports.

### 10.3 — Blob-Based Clean Canvas Export
To bypass browser canvas taint errors (`SecurityError: Tainted canvases may not be exported`):
1. The Mermaid SVG string is encoded and converted into a binary `Blob`.
2. A clean, non-tainted `Image` object is initialized using the Blob URL.
3. The image is drawn to an offscreen HTML5 `<canvas>` and exported cleanly as a high-resolution PNG file.

---

## 11. Full-Text & Asset Discovery Engine (V5.0)

ScholarHub V5.0 bridges the gap between text metadata and actual research assets.

### 11.1 — Unpaywall Integration
- **Mechanism:** A parallel background call to the Unpaywall API retrieves the open access status and PDF download link for any DOI found during the search process.
- **Frontend Interaction:** If a valid Open Access PDF link (`pdf_url`) is detected, a high-visibility `"📥 Download PDF"` button is rendered on the Paper Detail view.

### 11.2 — PMC Figure & Image Extraction
- **Mechanism:** If PubMed papers contain an associated PubMed Central ID (`PMCID`), the PMC Metadata API is queried to fetch associated figure descriptions and high-resolution graphic URLs.
- **Gallery Section:** Polish-rendered Gallery inside `PaperDetail.jsx` showing figures, graphs, and study data.

---

## 12. Asset Attachment & Popover UI Framework

A ChatGPT/Elicit-style asset attachment framework is integrated into the input prompter across all Auditor workflows:
- **Unified '+' Button:** Slate-100 minimalist button triggers an action menu popover.
- **Action Popover Options:**
  - *Attach File:* Launches a secure PDF file upload toast ("Feature Coming Soon").
  - *Add from Library:* Opens the library injection modal to select and add bookmarked articles.

---

## 13. Future Roadmap

```mermaid
gantt
    title ScholarHub AI Engineering Roadmap (Updated)
    dateFormat  YYYY-MM-DD

    section Phase 1 — Core Infrastructure (COMPLETE)
    Global API Fallback Architecture      :done, des1, 2026-06-01, 2026-06-06
    Smart Token Truncation Engine         :done, des2, 2026-06-04, 2026-06-06
    Universal Zero-Data Fallback          :done, des3, 2026-06-01, 2026-06-06
    AI Outreach & Networking Hub          :done, des4, 2026-06-07, 2026-06-10
    Character-Driven EMO Auth UI          :done, des5, 2026-06-08, 2026-06-10
    QA Security Audit & Bug Fixes         :done, des6, 2026-06-10, 2026-06-11
    ISO Timestamp & Date Parsing Fix      :done, des6b, 2026-06-11, 1d
    Final Pre-Deployment QA (5-Point)     :done, des6c, 2026-06-11, 1d

    section Phase 2 — Database Persistence (COMPLETE)
    audit_history DB Storage              :done, des7, 2026-07-14, 2026-07-15

    section Phase 3 — Graphical & Asset Discovery (COMPLETE)
    Mermaid Diagram Engine & Zoom/Pan     :done, des8, 2026-07-16, 2026-07-17
    Unpaywall OA PDF & PMC Fig Gallery    :done, des9, 2026-07-17, 1d
    Asset Attachment Popover UI           :done, des10, 2026-07-17, 1d

    section Phase 4 — System Hardening (IN PROGRESS)
    Auth-State Loops & Layout Jitter Fixes:active, des11, 2026-07-18, 1d
```

---

*Document Generated by ScholarHub AI Architecture Audit Team.*
*Validated against: `utils/api.js`, `supabaseClient.js`, `Auth.jsx`, `routers/ai.py`, `routers/unified.py`, `middleware/rate_limiter.py`, `parsers/arxiv_parser.py`, `parsers/openalex_parser.py`, `components/PaperDetail.jsx`, `utils/deviceSync.js`, `vercel.json`, `main.py`, `config.py`, `models/schemas.py`.*
*Last full QA audit: July 18, 2026. All integration points verified — **GO status confirmed**.*
