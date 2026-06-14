import React from 'react'
import { Link } from 'react-router-dom'
import { Dna } from 'lucide-react'
import { FaFacebook, FaLinkedin, FaGithub, FaYoutube } from 'react-icons/fa'
import logo from './assets/images/logo.png'

const Footer = ({ user, onAuthRequired }) => {
  return (
    <footer className="bg-slate-900 pt-16 md:pt-20 pb-8 md:pb-10 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
          
          {/* Column 1: About */}
          <div className="space-y-4 md:space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="ScholarHub AI" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  ScholarHub <span className="text-blue-500 uppercase">AI</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">
                  Research Hub
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Engineered to bridge the gap between vast biomedical databases and the modern researcher's need for intuitive, rapid information synthesis. Whether you call us ScholarHub, HubScholar, or the ultimate Research Hub, we've got you covered.
            </p>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Founder: <span className="text-blue-400">Arup Bhowmik Pritom</span>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://www.facebook.com/people/ScholarHub-AI-Advanced-Research-Discovery-Hub/61590477040942/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:scale-110 transition-all">
                <FaFacebook size={20} />
              </a>
              <a href="https://www.linkedin.com/in/arup-bhowmik-pritom/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:scale-110 transition-all">
                <FaLinkedin size={20} />
              </a>
              <a href="https://github.com/CodeWithPritom" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:scale-110 transition-all">
                <FaGithub size={20} />
              </a>
              <a href="https://www.youtube.com/@CodeWithPritom-360" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white hover:scale-110 transition-all">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4 md:mb-6">Quick Links</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><Link to="/" className="text-sm font-semibold hover:text-blue-400 transition-colors">Home Landing</Link></li>
              <li><Link to="/about" className="text-sm font-semibold hover:text-blue-400 transition-colors">About ScholarHub</Link></li>
              <li><Link to="/research" className="text-sm font-semibold hover:text-blue-400 transition-colors">Research Dashboard</Link></li>
              <li><Link to="/archive" className="text-sm font-semibold hover:text-blue-400 transition-colors">Session Archive</Link></li>
              <li><Link to="/resources" className="text-sm font-semibold hover:text-blue-400 transition-colors">Resources</Link></li>
              <li><Link to="/pricing" className="text-sm font-semibold hover:text-blue-400 transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4 md:mb-6">Contact Us</h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a 
                  href="mailto:arupbhowmikpritom@gmail.com" 
                  className="text-sm font-semibold hover:text-blue-400 transition-colors"
                >
                  arupbhowmikpritom@gmail.com
                </a>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black text-emerald-400 uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  All Systems Operational
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-4 md:mb-6">Legal</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><Link to="/privacy" className="text-sm font-semibold hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm font-semibold hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 text-center md:text-left">
          <p className="text-xs font-bold text-slate-500">
            © {new Date().getFullYear()} ScholarHub AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
