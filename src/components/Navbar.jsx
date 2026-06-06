import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dna, Menu, X, Library, User, ChevronDown, Settings, ShieldAlert, LogOut, MessageCircle } from 'lucide-react'
import logo from '../assets/images/logo.png'

const Navbar = ({ user, profile, liveUsersCount, onLogout, transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const navLinks = [
    ...(user ? [{ name: 'Dashboard', path: '/' }] : []),
    { name: 'Resources', path: '/resources' },
    { name: 'About', path: '/about' },
    { name: 'Tutorial', path: '/#tutorial' },
    ...(user ? [{ name: 'Archive', path: '/archive' }] : []),
    { name: 'Pricing', path: '/pricing' },
    { name: 'Support', path: '#' }
  ]

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled || !transparent || mobileMenuOpen
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 py-3' 
            : 'bg-transparent py-4 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* 1. Logo area (Responsive scaling) */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 z-[60]">
              <img src={logo} alt="ScholarHub AI" className="h-10 w-auto object-contain" />
              <div className="hidden min-[360px]:block">
                <h1 className={`text-base sm:text-xl font-black tracking-tight leading-none ${transparent && !isScrolled ? 'text-white' : 'text-slate-900'}`}>
                  ScholarHub <span className="text-blue-600 uppercase">AI</span>
                </h1>
                <p className={`text-[8px] sm:text-[10px] uppercase tracking-widest font-bold mt-0.5 sm:mt-1 ${transparent && !isScrolled ? 'text-slate-300' : 'text-slate-400'}`}>
                  Advanced Research Hub
                </p>
              </div>
            </Link>

            {/* Middle: Live Badge & Desktop Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {liveUsersCount !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm" title="Real-time Active Users">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest whitespace-nowrap">
                    Live: {liveUsersCount}
                  </span>
                </div>
              )}

              <nav className="flex items-center gap-4 lg:gap-6">
                {navLinks.map(link => {
                  const isAnchor = link.path.includes('#');
                  if (link.name === 'Support') {
                    return (
                      <button
                        key={link.name}
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new Event('toggle-support-bot'));
                        }}
                        className={`text-sm font-semibold transition-colors ${
                          transparent && !isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600'
                        }`}
                      >
                        {link.name}
                      </button>
                    )
                  } else if (link.external) {
                    return (
                      <a
                        key={link.name}
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm font-semibold transition-colors ${
                          transparent && !isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600'
                        }`}
                      >
                        {link.name}
                      </a>
                    )
                  } else if (isAnchor) {
                    return (
                      <a
                        key={link.name}
                        href={link.path}
                        className={`text-sm font-semibold transition-colors ${
                          transparent && !isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600'
                        }`}
                      >
                        {link.name}
                      </a>
                    )
                  } else {
                    return (
                      <Link 
                        key={link.name} 
                        to={link.path} 
                        className={`text-sm font-semibold transition-colors ${
                          location.pathname === link.path 
                            ? 'text-blue-600' 
                            : (transparent && !isScrolled ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600')
                        }`}
                      >
                        {link.name}
                      </Link>
                    )
                  }
                })}
              </nav>
            </div>

            {/* Right: Desktop Profile & Mobile Toggle */}
            <div className="flex items-center gap-3">
              {/* Desktop Profile / Login */}
              <div className="hidden md:block">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link 
                      to="/library"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all shadow-sm"
                    >
                      <Library size={14} />
                      <span className="hidden lg:inline">My Library</span>
                    </Link>
                    
                    <div className="relative group cursor-pointer" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors">
                        <User size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest max-w-[100px] lg:max-w-[120px] truncate">
                          {user.email?.split('@')[0]}
                        </span>
                        <ChevronDown size={14} className="text-blue-600 ml-1" />
                      </div>
                      
                      {/* Desktop Dropdown */}
                      <div className={`absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 transition-all duration-200 transform origin-top ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <User size={16} /> My Account
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <Settings size={16} /> Settings
                        </Link>
                        {(profile?.role === 'admin' || user?.email === 'arupbhowmikpritom@gmail.com') && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
                            <ShieldAlert size={16} /> Admin Panel
                          </Link>
                        )}
                        <a href="https://wa.me/8801853343176?text=Hello%20ScholarHub%20Admin,%20I%20need%20account%20assistance." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <MessageCircle size={16} /> Contact Admin
                        </a>
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-left">
                          <LogOut size={16} /> Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => navigate('/auth')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/30">
                    Log In
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
                  className={`p-2 rounded-xl transition-colors ${mobileMenuOpen || isScrolled || !transparent ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <div className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}>
        <div 
          className={`absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="pt-24 pb-8 px-6 flex flex-col h-full overflow-y-auto">
            {/* Mobile Navigation Links */}
            <div className="space-y-2 mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Navigation</h3>
              {navLinks.map(link => {
                const isAnchor = link.path.includes('#');
                if (link.name === 'Support') {
                  return (
                    <button
                      key={link.name}
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        window.dispatchEvent(new Event('toggle-support-bot'));
                      }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-colors text-slate-700 hover:bg-slate-50"
                    >
                      {link.name}
                    </button>
                  )
                } else if (link.external) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 rounded-xl text-base font-bold transition-colors text-slate-700 hover:bg-slate-50"
                    >
                      {link.name}
                    </a>
                  )
                } else if (isAnchor) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-base font-bold transition-colors text-slate-700 hover:bg-slate-50"
                    >
                      {link.name}
                    </a>
                  )
                } else {
                  return (
                    <Link 
                      key={link.name} 
                      to={link.path} 
                      className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                        location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                }
              })}
            </div>

            {/* Mobile Auth Area */}
            <div className="mt-auto border-t border-slate-100 pt-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Account</h3>
              {user ? (
                <div className="space-y-2">
                  <Link to="/library" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Library size={18} className="text-slate-400" /> My Library
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <User size={18} className="text-slate-400" /> My Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Settings size={18} className="text-slate-400" /> Settings
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-600 bg-amber-50">
                      <ShieldAlert size={18} /> Admin Panel
                    </Link>
                  )}
                  <a href="https://wa.me/8801853343176?text=Hello%20ScholarHub%20Admin,%20I%20need%20account%20assistance." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <MessageCircle size={18} className="text-slate-400" /> Contact Admin
                  </a>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left mt-2">
                    <LogOut size={18} /> Log Out
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/auth')} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/30">
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
