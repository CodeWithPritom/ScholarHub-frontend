import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dna, Menu, X, Library, User, ChevronDown, Settings, ShieldAlert, LogOut, MessageCircle, Megaphone, GraduationCap, Archive, FileText, Cpu, Eye, Database, BookOpen, Shield } from 'lucide-react'
import logo from '../assets/images/logo.png'

const Navbar = ({ user, profile, liveUsersCount, onLogout, transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
    setActiveDropdown(null)
  }, [location.pathname])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-dropdown-trigger') && !e.target.closest('.nav-dropdown-menu')) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [])

  const navLinks = [
    { name: 'Pricing', path: '/pricing' },
    { name: 'Resources', path: '/resources' },
    { name: 'About', path: '/about' },
    { name: 'Support', path: '#' }
  ]

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled || !transparent || mobileMenuOpen
            ? 'bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E5E5DF] py-3.5' 
            : 'bg-transparent py-4 md:py-5'
        }`}
      >
        <div className="w-full 2xl:px-12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* 1. Logo area */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 z-[60]">
              <img src={logo} alt="ScholarHub AI" className="h-8 w-auto object-contain" />
              <div className="hidden min-[360px]:block">
                <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none text-[#171717]">
                  ScholarHub <span className="text-[#315CFF]">AI</span>
                </h1>
              </div>
            </Link>

            {/* Middle: Minimalist Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {liveUsersCount !== undefined && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50/60 rounded-full border border-emerald-100" title="Real-time Active Users">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                    Live: {liveUsersCount}
                  </span>
                </div>
              )}

              <nav className="flex items-center gap-8">
                {/* 1. Pricing Link */}
                <Link 
                  to="/pricing" 
                  className={`text-base font-bold transition-colors ${
                    location.pathname === '/pricing' 
                      ? 'text-[#315CFF] font-extrabold' 
                      : 'text-[#171717]/80 hover:text-[#315CFF]'
                  }`}
                >
                  Pricing
                </Link>

                {/* 2. Resources Dropdown */}
                <div className="relative inline-block">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                    className="nav-dropdown-trigger flex items-center gap-1 text-base font-bold text-[#171717]/80 hover:text-[#315CFF] transition-colors cursor-pointer"
                  >
                    <span>Resources</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'resources' && (
                    <div className="nav-dropdown-menu absolute left-1/2 -translate-x-1/2 top-full mt-3.5 w-80 bg-[#FAFAF8]/95 backdrop-blur-md border border-[#E5E5DF] rounded-xl p-3 shadow-lg z-[110] flex flex-col gap-1 text-left">
                      <Link to="/news" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Megaphone size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Scientific News Digest</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Daily, AI-summarized literature news</div>
                        </div>
                      </Link>
                      <Link to="/opportunities" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <GraduationCap size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Opportunities Matcher</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">PhD fellowships & grants crawling matches</div>
                        </div>
                      </Link>
                      <Link to="/archive" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Archive size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Session Archive</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Search and retrieve past research logs</div>
                        </div>
                      </Link>
                      <Link to="/resources" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <FileText size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Reference Guides</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">External tools guidelines database</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. About Dropdown */}
                <div className="relative inline-block">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                    className="nav-dropdown-trigger flex items-center gap-1 text-base font-bold text-[#171717]/80 hover:text-[#315CFF] transition-colors cursor-pointer"
                  >
                    <span>About</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeDropdown === 'about' && (
                    <div className="nav-dropdown-menu absolute left-1/2 -translate-x-1/2 top-full mt-3.5 w-80 bg-[#FAFAF8]/95 backdrop-blur-md border border-[#E5E5DF] rounded-xl p-3 shadow-lg z-[110] flex flex-col gap-1 max-h-[380px] overflow-y-auto text-left">
                      <Link to="/features/agent" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Cpu size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Research Agent</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">CoT Zero-hallucination assistant</div>
                        </div>
                      </Link>
                      <Link to="/features/vision-rag" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Eye size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Vision-RAG Parser</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Exhume figures & charts from PDFs</div>
                        </div>
                      </Link>
                      <Link to="/features/discovery" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Database size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Unified Search</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Simultaneous NCBI/arXiv search dispatch</div>
                        </div>
                      </Link>
                      <Link to="/features/academy" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <BookOpen size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Research Academy</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Training curricula guided by AI Mentor</div>
                        </div>
                      </Link>
                      <Link to="/features/auditor" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Shield size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">Research Auditor</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Verify statistical assertions & compile logs</div>
                        </div>
                      </Link>
                      <Link to="/about" className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-200/50 transition-colors">
                        <Library size={18} className="text-[#315CFF] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#171717]">About Us</div>
                          <div className="text-[10px] text-slate-500 leading-normal font-normal">Milestones and infrastructure values</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Support Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new Event('toggle-support-bot'));
                  }}
                  className="text-base font-bold text-[#171717]/80 hover:text-[#315CFF] transition-colors cursor-pointer"
                >
                  Support
                </button>
              </nav>
            </div>

            {/* Right: Profile & Auth Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="relative group cursor-pointer" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F3EF] hover:bg-[#E5E5DF] rounded-[8px] border border-[#E5E5DF] transition-colors">
                        <User size={14} className="text-[#171717]" />
                        <span className="text-sm font-bold text-[#171717] max-w-[100px] lg:max-w-[120px] truncate">
                          {user.email?.split('@')[0]}
                        </span>
                        <ChevronDown size={14} className="text-[#171717]/60 ml-1" />
                      </div>
                      
                      {/* Desktop Dropdown */}
                      <div className={`absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#E5E5DF] shadow-sm rounded-[8px] p-1.5 transition-all duration-200 transform origin-top ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'}`}>
                        <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#F3F3EF] rounded-[6px] transition-colors">
                          <User size={14} /> Account
                        </Link>
                        <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#F3F3EF] rounded-[6px] transition-colors">
                          <Settings size={14} /> Settings
                        </Link>
                        {(profile?.role === 'admin' || user?.email === 'arupbhowmikpritom@gmail.com') && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-[6px] transition-colors">
                            <ShieldAlert size={14} /> Admin Panel
                          </Link>
                        )}
                        <a href="https://wa.me/8801853343176?text=Hello%20ScholarHub%20Admin,%20I%20need%20account%20assistance." target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#F3F3EF] rounded-[6px] transition-colors">
                          <MessageCircle size={14} /> Support
                        </a>
                        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-[6px] transition-colors text-left">
                          <LogOut size={14} /> Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => navigate('/auth')} className="px-5 py-2 bg-[#315CFF] hover:bg-[#2547d0] text-white rounded-[8px] text-sm font-bold transition-colors">
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile View: Live Badge + Hamburger */}
              <div className="flex md:hidden items-center gap-2 sm:gap-3 z-[60]">
                {liveUsersCount !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100" title="Real-time Active Users">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                      {liveUsersCount}
                    </span>
                  </div>
                )}
                
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-2 rounded-[12px] transition-colors ${mobileMenuOpen || isScrolled || !transparent ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-sds-text'}`}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <div className={`fixed inset-0 z-40 bg-sds-bg/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}>
        <div 
          className={`absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-sm transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="pt-24 pb-8 px-6 flex flex-col h-full overflow-y-auto">
            {/* Mobile Navigation Links */}
             <div className="space-y-4 mb-8">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Navigation</h3>
              
              <Link 
                to="/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-[12px] text-base font-bold transition-colors ${
                  location.pathname === '/pricing' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pricing
              </Link>
              
              {/* Resources Category */}
              <div className="px-4 space-y-2.5 pt-2 border-t border-slate-150">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Resources</span>
                <Link to="/news" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Megaphone size={16} className="text-[#315CFF]" />
                  <span>Scientific News Digest</span>
                </Link>
                <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <GraduationCap size={16} className="text-[#315CFF]" />
                  <span>Opportunities Matcher</span>
                </Link>
                <Link to="/archive" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Archive size={16} className="text-[#315CFF]" />
                  <span>Session Archive</span>
                </Link>
                <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <FileText size={16} className="text-[#315CFF]" />
                  <span>Reference Guides</span>
                </Link>
              </div>

              {/* About Category */}
              <div className="px-4 space-y-2.5 pt-4 border-t border-slate-150">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">About Platform</span>
                <Link to="/features/agent" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Cpu size={16} className="text-[#315CFF]" />
                  <span>Research Agent</span>
                </Link>
                <Link to="/features/vision-rag" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Eye size={16} className="text-[#315CFF]" />
                  <span>Vision-RAG Parser</span>
                </Link>
                <Link to="/features/discovery" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Database size={16} className="text-[#315CFF]" />
                  <span>Unified Search</span>
                </Link>
                <Link to="/features/academy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <BookOpen size={16} className="text-[#315CFF]" />
                  <span>Research Academy</span>
                </Link>
                <Link to="/features/auditor" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Shield size={16} className="text-[#315CFF]" />
                  <span>Research Auditor</span>
                </Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#315CFF] transition-colors py-1">
                  <Library size={16} className="text-[#315CFF]" />
                  <span>About Us</span>
                </Link>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new Event('toggle-support-bot'));
                }}
                className="block w-full text-left px-4 py-2.5 rounded-[12px] text-base font-bold text-slate-700 hover:bg-slate-50 mt-2 border-t border-slate-150 pt-3"
              >
                Support Bot
              </button>
            </div>

            {/* Mobile Auth Area */}
            <div className="mt-auto border-t border-slate-100 pt-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Account</h3>
              {user ? (
                <div className="space-y-2">
                  <Link to="/library" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Library size={18} className="text-slate-500" /> My Library
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <User size={18} className="text-slate-500" /> My Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Settings size={18} className="text-slate-500" /> Settings
                  </Link>
                  {(profile?.role === 'admin' || user?.email === 'arupbhowmikpritom@gmail.com') && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold text-amber-600 bg-amber-50">
                      <ShieldAlert size={18} /> Admin Panel
                    </Link>
                  )}
                  <a href="https://wa.me/8801853343176?text=Hello%20ScholarHub%20Admin,%20I%20need%20account%20assistance." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <MessageCircle size={18} className="text-slate-500" /> Contact Admin
                  </a>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold text-red-600 hover:bg-red-50 text-left mt-2">
                    <LogOut size={18} /> Log Out
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/auth')} className="w-full py-3 bg-blue-600 text-sds-text rounded-[12px] text-sm font-black uppercase tracking-widest shadow-sm shadow-blue-500/30">
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
