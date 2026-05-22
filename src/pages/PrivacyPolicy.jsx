import React, { useEffect } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700 pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600">
            <p className="text-slate-500 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              When you use ScholarHub AI, we collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, academic field, and encrypted authentication tokens.
            </p>

            <h2 className="text-xl mt-8 mb-4">2. Data Privacy & Research Queries</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Your research queries and the articles you save are stored securely to provide you with your research history. We do not sell your research data to third parties. API queries sent to third-party providers (like NCBI, arXiv, or Semantic Scholar) only contain the search terms and do not contain your personal identifying information.
            </p>

            <h2 className="text-xl mt-8 mb-4">3. AI Interaction Data</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              When you use our AI summary or chat features, the context of the articles and your prompt are sent to our LLM providers (e.g., Groq, Together AI). We explicitly instruct our providers not to use your interaction data for training their models. However, we log your usage count internally to enforce rate limits and tier quotas.
            </p>
            
            <h2 className="text-xl mt-8 mb-4">4. Cookies and Local Storage</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We use local storage (such as sessionStorage) to cache your research results temporarily. This improves performance and reduces redundant API calls. These caches are strictly isolated per portal (e.g., GEB vs Engineering) and are cleared when you close your browser or explicitly click "Clear Session Cache".
            </p>

            <h2 className="text-xl mt-8 mb-4">5. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us via the Live Support link in our application.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
