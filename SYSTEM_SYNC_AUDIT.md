# SYSTEM SYNC AUDIT: ScholarHub AI

## Executive Summary
This audit addresses critical data desynchronization between the frontend UI, the FastAPI backend, and the Supabase PostgreSQL database. The focus areas include User Tier alignment (the PRO-FREE bug), Portal Mapping, Middleware Handshakes, and Usage Logging.

---

## 1. Tier & Access Synchronization (The PRO-FREE Bug)
**Priority: HIGH | Status: RESOLVED**

### ⚠️ Broken Sync Point:
The backend logged "Tier is free" while the frontend showed "PRO" due to a silent dictionary evaluation bug in `middleware/rate_limiter.py`. When `profiles.user_tier` was completely `null` in the database, `.get("user_tier", "free")` returned `None`, not `"free"`. Chaining `.lower()` threw an `AttributeError`, bypassing the `profiles` table check entirely and falling back to a stale or empty `subscriptions` table.

Additionally, `App.jsx` fetched the `user_tier` directly without forcing lowercase formatting on the client side, relying heavily on downstream components.

### ✅ Corrective Action (Python):
Fixed the Null-Pointer Exception by separating extraction from lowercase transformation, strictly enforcing `profiles` as the Single Source of Truth.
```python
# backend/middleware/rate_limiter.py
raw_tier = prof_data[0].get("user_tier")
tier = (raw_tier if raw_tier else "free").lower()
```

---

## 2. Portal Mapping Integrity
**Priority: MEDIUM | Status: ACTION REQUIRED**

### ⚠️ Broken Sync Point:
The 7-portal system (`bio`, `eng`, `physics`, `math`, `social`, `chem`, `law`) is correctly mapped in the Auth onboarding and the backend `verify_portal_access` router. However, the UI theming in `SearchBar.jsx` lacks visual mappings for the new `chem` and `law` portals. They silently fail over to the default `bio` (blue) color scheme.

### ✅ Corrective Action (React):
Update the `getThemeClasses` dictionary to explicitly support the missing portals.
```javascript
// frontend/src/components/SearchBar.jsx
const getThemeClasses = (p) => {
  switch (p) {
    case 'bio': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800' }
    case 'eng': return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-800' }
    case 'physics': return { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-800' }
    case 'math': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-800' }
    case 'social': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800' }
    case 'chem': return { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-800' } // NEW
    case 'law': return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' } // NEW
    default: return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800' }
  }
};
```

---

## 3. Middleware & Auth Handshake
**Priority: HIGH | Status: RESOLVED**

### ⚠️ Broken Sync Point:
The backend unified router (`/api/search`) was rejecting valid PRO requests with a `401 Unauthorized` / `402 Payment Required` because `ResearchPage.jsx` was not actively injecting the Supabase JWT token inside the `fetch()` headers for searches.

### ✅ Corrective Action (React):
Explicitly extracted the session token and injected it as a Bearer string.
```javascript
// frontend/src/ResearchPage.jsx
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

const fetchHeaders = { 'Content-Type': 'application/json' };
if (token) fetchHeaders['Authorization'] = `Bearer ${token}`;

const response = await fetch(fetchUrl, { headers: fetchHeaders, signal: searchAbortControllerRef.current.signal });
```

---

## 4. Usage Logging Logic
**Priority: LOW | Status: ACTION REQUIRED**

### ⚠️ Broken Sync Point:
The `usage_logs` insertions on the backend are working flawlessly via the `SUPABASE_SERVICE_KEY` bypass (`log_ai_usage`). However, the `Profile.jsx` usage counter appears desynced because it only fetches data *once* on component mount, ignoring background AI queries performed while the profile page is inactive.

### ✅ Corrective Action (React):
Implement a Supabase Realtime channel subscription inside `Profile.jsx` to dynamically listen for new rows in `usage_logs`.
```javascript
// frontend/src/pages/Profile.jsx
useEffect(() => {
  const channel = supabase.channel('realtime_usage')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'usage_logs', filter: `user_id=eq.${user.id}` }, 
      (payload) => {
        if(payload.new.action === 'ai_summary') {
           setAiUsageCount(prev => prev + 1);
        }
      })
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [user]);
```

---

## 5. API Endpoint Alignment
**Priority: LOW | Status: VERIFIED HEALTHY**

### ⚠️ Analysis:
All fetch URLs in React correctly mirror the FastAPI infrastructure:
- `unified.py` → `/api/search` (Matched)
- `ai.py` → `/ai/summarize-research` (Matched - No Prefix)
- `ncbi.py` → `/suggest` (Matched - No Prefix)
- `admin.py` → `/api/admin/users/tier` (Matched)

No missing paths or trailing slash mismatches were found. The routing architecture is 100% aligned.

---

## 6. Pydantic & PyJWT Dependency Alignment [NEW]
**Priority: HIGH | Status: RESOLVED**

### ⚠️ Broken Sync Point:
During Render Linux server deployments, the installation threw `ResolutionImpossible` conflicts:
1. **Ollama Conflict**: `ollama==0.6.1` required `pydantic>=2.9.0` while `requirements.txt` strictly pinned `pydantic==2.7.1` and `pydantic_core==2.18.2`.
2. **Supabase Auth Conflict**: `supabase-auth==2.30.0` required `pyjwt>=2.10.1` while `requirements.txt` strictly pinned `PyJWT==2.8.0`.

### ✅ Corrective Action (Requirements):
Loosened version constraints in `backend/requirements.txt` to permit clean pip resolution:
- Upgraded `pydantic` to `pydantic>=2.9.0` and removed the strict `pydantic_core` pin to let it install matching binaries dynamically.
- Upgraded `PyJWT` to `PyJWT>=2.10.1` to align with Supabase Auth requirements.

---

## 7. Selection Text Accessibility
**Priority: LOW | Status: RESOLVED**

### ⚠️ Broken Sync Point:
In multiple panels (e.g. `WorkspaceLayout.jsx`, `Pricing.jsx`, `Auditor.jsx`), the text selection styling had custom utility color overrides such as `selection:text-blue-200` and `selection:bg-slate-955/10`. When users highlighted text, it blended completely into the container background, making selected text invisible.

### ✅ Corrective Action (React / CSS):
Removed the broken custom text selection classes. Replaced with high-contrast semi-transparent selections (`selection:bg-blue-500/20`) globally, letting text colors default to high-contrast browser standards.

---

## 8. Auditor Autoscroll Snapping
**Priority: MEDIUM | Status: RESOLVED**

### ⚠️ Broken Sync Point:
When the Auditor's AI output streamed content, the viewport frequently jittered or locked scrolling. This was caused by the smooth scrolling behavior queueing hundreds of slow slide animations in the browser stack faster than frames could render.

### ✅ Corrective Action (React):
Separated scroll methods:
- **Instant snapping**: Configured `scrollIntoView({ behavior: 'auto' })` for active token streaming updates.
- **Smooth scrolling**: Reserved `scrollIntoView({ behavior: 'smooth' })` solely for initial message submissions.
- **User Scroll Detect**: Added a 250px bottom offset check; if user manually scrolls up to read, the auto-scroll is temporarily deactivated.
