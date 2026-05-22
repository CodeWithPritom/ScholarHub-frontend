import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ExternalLink, Dna, FileText, Search, Database, HelpCircle, ArrowLeft, ArrowUpRight } from 'lucide-react'
import Footer from '../Footer'
import { motion } from 'framer-motion'

const Resources = () => {
  const navigate = useNavigate()

  const externalTools = [
    {
      name: "NCBI PubMed",
      description: "Access more than 35 million citations for biomedical literature from MEDLINE, life science journals, and online books.",
      url: "https://pubmed.ncbi.nlm.nih.gov/",
      badge: "GEB / Pharmacy"
    },
    {
      name: "arXiv Global",
      description: "A free distribution service and an open-access archive for 2 million scholarly articles in physics, mathematics, computer science, and engineering.",
      url: "https://arxiv.org/",
      badge: "Engineering & Tech"
    },
    {
      name: "Semantic Scholar",
      description: "A free, AI-powered research tool for scientific literature, extracting key terms, citations, and study methodologies.",
      url: "https://www.semanticscholar.org/",
      badge: "Universal Search"
    },
    {
      name: "WHO Research Database",
      description: "World Health Organization's primary database tracking worldwide global health literature, clinical trials, and epidemiological data.",
      url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/global-research-on-novel-coronavirus-2019-ncov",
      badge: "Global Health"
    },
    {
      name: "Zotero Reference Manager",
      description: "A free, easy-to-use reference assistant tool to help you collect, organize, annotate, cite, and share your research papers.",
      url: "https://www.zotero.org/",
      badge: "Bibliography Tool"
    }
  ]

  const docs = [
    {
      title: "1. Core Portal Selection",
      content: "Switch between portals inside the Research Dashboard. Use GEB / Pharmacy for NCBI PubMed, Engineering for physics & tech papers on arXiv, and Universal (All Fields) for Semantic Scholar's broad database."
    },
    {
      title: "2. Executing Smart Queries",
      content: "Enter keywords, molecular structures, genes, or author names. The platform proxies queries directly to their corresponding APIs and structures the results into our unified clean metadata view."
    },
    {
      title: "3. Generating AI Summaries",
      content: "Select research papers via checkboxes, then trigger the 'Summarize' drawer. Our Groq-powered AI reads the abstract data to produce key trends, outcomes, and future possibilities instantly."
    },
    {
      title: "4. Subscription & Usage Limits",
      content: "Free users get 3 summaries/day. Starter allows 30 summaries and unlocks the Engineering portal. Pro is our premium plan allowing 300 daily summaries and unrestricted Universal Search."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      
      {/* Navbar Minimal */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Dna size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">ScholarHub<span className="text-blue-600">AI</span></span>
          </div>
          <button 
            onClick={() => navigate('/research')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 space-y-16">
        
        {/* Header Section */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
            <Database className="text-blue-600" size={32} />
            Research Resources
          </h1>
          <p className="text-slate-500 font-medium">Access primary external bibliographic engines and learn how to use the platform effectively.</p>
        </div>

        {/* Section 1: External Research Tools Grid */}
        <section className="space-y-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ExternalLink size={16} className="text-blue-500" />
            External Research Tools
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externalTools.map((tool, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/30 flex flex-col justify-between hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{tool.name}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{tool.description}</p>
                </div>
                <a 
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg"
                >
                  Visit Database <ArrowUpRight size={14} />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 2: Platform Documentation */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            <div>
              <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileText size={16} />
                Platform Documentation
              </h2>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                How to leverage ScholarHub AI
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 pt-4">
              {docs.map((doc, idx) => (
                <div key={idx} className="space-y-3 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-white text-base">{doc.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{doc.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

export default Resources
