import React from 'react'
import { motion } from 'framer-motion'
import { Dna, ArrowLeft, Terminal, Server, Database, Globe, Layers, ShieldCheck, Zap, Monitor, Smartphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import creatorImg from '../assets/images/creator.jpg'
import architectureImg from '../assets/images/architecture.png'
import Footer from '../Footer'

const About = () => {
  const navigate = useNavigate()

  const techStack = [
    { category: "Frontend Engine", tech: "React, Vite, Tailwind CSS, Framer Motion", icon: <Layers size={24} className="text-blue-500" /> },
    { category: "Backend Architecture", tech: "Python, FastAPI, Uvicorn", icon: <Terminal size={24} className="text-emerald-500" /> },
    { category: "Database & Security", tech: "Supabase (PostgreSQL), Turnstile", icon: <ShieldCheck size={24} className="text-amber-500" /> },
    { category: "AI & Data Pipelines", tech: "Groq (Llama 3.1 8B), NCBI, arXiv, OpenAlex", icon: <Zap size={24} className="text-purple-500" /> }
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
            onClick={() => navigate('/')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 lg:py-24 space-y-24">
        
        {/* Section 1: The Vision */}
        <section>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div>
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3">The Vision</h3>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Democratizing Academic Research with ScholarHub AI
                </h1>
              </div>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-lg">
                <p>
                  ScholarHub AI was founded by <strong className="text-slate-900">Arup Bhowmik Pritom</strong>, the creator of the popular 'Catalyst Smart Classroom' platform, with a vision to break down the walls of academic knowledge.
                </p>
                <p>
                  For decades, brilliant students and researchers globally have been gated by expensive paywalls, scattered databases, and restrictive API rate limits. ScholarHub AI was built to bypass these bottlenecks, providing a unified, AI-powered hub that aggregates world-class APIs into a single, intuitive platform.
                </p>
                <p>
                  By leveraging state-of-the-art open-source LLMs like Llama 3.1, we ensure that zero-hallucination, strictly grounded insights are accessible to everyone—empowering the next generation of scientific discovery.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay z-10"></div>
                <img src={creatorImg} alt="Arup Bhowmik Pritom - Founder and Architect of ScholarHub AI" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 2: The Architecture */}
        <section>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Under The Hood</h3>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">The Architecture</h2>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 mb-16 bg-white p-2">
            <img src={architectureImg} alt="ScholarHub AI System Architecture" className="w-full h-auto rounded-[1.5rem]" />
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-blue-300 transition-colors flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">{item.category}</h4>
                <p className="text-slate-500 font-medium text-sm">{item.tech}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3: Platform Architecture & Accessibility */}
        <section>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3">Omnichannel Sync</h3>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Platform Architecture & Accessibility</h2>
          </motion.div>
          <div className="bg-white rounded-[2rem] p-10 lg:p-16 border border-slate-200 shadow-xl shadow-slate-200/20 max-w-4xl mx-auto">
            <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-lg">
              <p>
                To deliver a truly ubiquitous research experience, ScholarHub AI is engineered to be instantly available across all major operating systems while maintaining absolute synchronization.
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="flex items-center gap-2 text-xl font-black text-slate-900 mb-3"><Monitor size={20} className="text-blue-600" /> Desktop Experience</h4>
                  <p className="text-sm">We leveraged <strong>Electron.js</strong> to package our highly reactive web interface into a performant, focused desktop application optimized for Windows. This allows researchers to utilize full-screen focus modes free from browser tab clutter.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="flex items-center gap-2 text-xl font-black text-slate-900 mb-3"><Smartphone size={20} className="text-emerald-600" /> Mobile Experience</h4>
                  <p className="text-sm">Our mobile architecture utilizes advanced <strong>PWA & WebView</strong> wrapping technologies. This ensures that the native Android app directly mirrors the core cloud infrastructure, guaranteeing that your library, search history, and AI credits stay perfectly synchronized across all devices in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  )
}

export default About
