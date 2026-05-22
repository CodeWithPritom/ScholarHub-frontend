import React, { useEffect } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const TermsOfService = () => {
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
              <FileText size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600">
            <p className="text-slate-500 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              By accessing and using ScholarHub AI, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl mt-8 mb-4">2. AI Usage & Limitations</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              ScholarHub AI provides AI-generated summaries and literature reviews based on third-party research databases. While we strive for accuracy, the LLM-generated content may contain hallucinations or misinterpretations. Our service is intended as a research assistant, not a replacement for reading primary sources. We are not liable for any professional, medical, or academic decisions made based on AI outputs.
            </p>

            <h2 className="text-xl mt-8 mb-4">3. Subscription Rules & Access</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              - <strong>Free Tier:</strong> Access is limited to one specialized portal assigned during onboarding. Strict API rate limits apply.<br/>
              - <strong>Starter Tier:</strong> Provides higher limits for a single portal, but cross-portal access remains restricted.<br/>
              - <strong>Pro Tier:</strong> Grants universal access to all portals and unlocks Literature Review generation.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Account sharing is strictly prohibited. We reserve the right to suspend accounts that exhibit unusual traffic patterns indicating automated scraping or account sharing.
            </p>

            <h2 className="text-xl mt-8 mb-4">4. Refund Policy</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Due to the high costs of API and AI inference, all subscription payments are final and non-refundable. If you experience technical issues preventing you from accessing your paid tier, please contact our support team immediately.
            </p>
            
            <h2 className="text-xl mt-8 mb-4">5. Third-Party Data</h2>
            <p className="text-slate-600 leading-relaxed">
              We aggregate data from NCBI, arXiv, Semantic Scholar, CrossRef, Europe PMC, and OpenAlex. You agree to comply with the respective usage policies of these original data providers when exporting or citing their content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
