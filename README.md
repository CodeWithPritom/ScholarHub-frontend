# 🧬 Universal Research Pro

> **The AI-Powered Discovery Hub for Global Researchers.**

Universal Research Pro is a high-end, multi-disciplinary SaaS platform built to unify global scientific literature. By consolidating queries across major academic engines—NCBI (Bio-Science), arXiv (Engineering/Physics), and Semantic Scholar (General Universal)—and feeding them into local AI models, the platform streamlines the discovery process for academics, labs, and enterprise research teams.

---

## 🚀 Key Features

*   **Multi-Source Search Portal**: Seamless routing of scientific terms to distinct academic repositories (NCBI PubMed, arXiv Atom XML, and Semantic Scholar Graph API) from a single query field.
*   **AI-Powered Summarization & RAG Chat**: Leverages Groq (Llama models) to generate multi-paper executive summaries and run grounding-bounded Q&A chats against the retrieved article abstracts.
*   **Tiered SaaS Membership & Limits**: 
    *   **Free**: Access to NCBI, 5-second search cooldown, 3-second debounce, 3 daily AI summaries.
    *   **Starter**: Unlocks arXiv (Engineering), 1-second debounce, 30 daily AI summaries.
    *   **Pro**: Unlocks Semantic Scholar (Universal), instant search, 300 daily AI summaries.
*   **Admin CMS & Billing Controls**: Manual user search, plan activation, date-based expiry manipulation, and automated coupon generation modules.
*   **Real-time Intelligence Stats**: Powered by Supabase Presence to track live active researchers on the landing page alongside profiles count.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, React Router DOM.
*   **Backend**: FastAPI (Python), Uvicorn, Requests.
*   **Database & Auth**: Supabase (PostgreSQL, Realtime Presence, JWT Token Verification).
*   **AI Synthesis**: Groq API Cloud (Llama 3.1 Synthesis Engine).

---

## 📸 Screenshots

*(Placeholders - Replace with actual portal images)*

### Landing Page & Live Stats
```
┌───────────────────────────────────────────────────────────┐
│ [Dna] Universal Research Pro                              │
│                                                           │
│           UNIVERSAL RESEARCH PRO                          │
│     The AI-Powered Discovery Hub for Global Researchers.  │
│                                                           │
│                 [ Launch Research Hub ]                   │
│                                                           │
│ 🟢 Live: 12      👥 Total: 1,420+      📚 Papers: 230M+    │
└───────────────────────────────────────────────────────────┘
```

### Research Dashboard
```
┌───────────────────────────────────────────────────────────┐
│ Bio-Science  [Engineering (Starter)]  [Universal (Pro)]   │
│ ┌───────────────────────────────────────────┐ [ FETCH ]   │
│ │ Search Cancer Genomics...                 │             │
│ └───────────────────────────────────────────┘             │
│                                                           │
│ 📄 Dynamic Article Cards with Citation Badges             │
└───────────────────────────────────────────────────────────┘
```

---

## 💻 Installation Guide

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   Supabase Account & Project Setup

### Backend Setup
1. Clone the repository and navigate to the backend:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   NCBI_API_KEY=your_ncbi_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.1-8b-instant
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_service_role_key
   ADMIN_USER_IDS=comma_separated_admin_uuid_list
   PORT=8000
   ```
5. Run the FastAPI dev server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 👤 Founder

Developed and Architected by **Arup Bhowmik Pritom**.
Feel free to reach out via WhatsApp at `+8801853343176` for partnerships or enterprise licenses.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
