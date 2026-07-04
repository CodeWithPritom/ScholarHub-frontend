import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Book, Archive, CreditCard, 
  HelpCircle, ChevronLeft, ChevronRight, X, Sparkles
} from 'lucide-react';
import logo from '../assets/images/logo.png';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen, collapsed, setCollapsed }) => {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Tutorial', path: '/#tutorial', icon: <Book size={20} /> },
    { name: 'Archive', path: '/archive', icon: <Archive size={20} /> },
    { name: 'Pricing', path: '/pricing', icon: <CreditCard size={20} /> },
  ];

  const handleSupport = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event('toggle-support-bot'));
  };

  return (
    <>
      {/* Mobile Backdrop (Dark & Blur) */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Wrapper (Positions the sidebar and holds the outside toggle) */}
      <div 
        className={`fixed lg:relative top-0 left-0 bottom-0 z-[100] transition-all duration-300 h-screen shrink-0 w-72 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Main Sidebar Container (overflow-x-hidden applied here) */}
        <aside className="w-full h-full bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl lg:shadow-none overflow-x-hidden relative">
          
          {/* Header / Logo */}
          <div className={`h-16 flex items-center ${collapsed ? 'lg:justify-center' : 'justify-between px-5'} border-b border-slate-800 shrink-0`}>
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Sparkles size={18} className="text-white" />
              </div>
              
              {/* Conditionally hide text on desktop collapse to prevent internal overflow */}
              <span className={`text-lg font-black tracking-tight text-white whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                ScholarHub
              </span>
            </Link>

            {/* Mobile Close Button ('X') */}
            <button 
              className={`lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ${collapsed ? 'lg:hidden' : 'block'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className={`flex-1 overflow-y-auto py-6 ${collapsed ? 'lg:px-2' : 'px-4'} space-y-2 scrollbar-none`}>
            {links.map((link) => {
              const isAnchor = link.path.includes('#');
              const isActive = location.pathname === link.path && !isAnchor;
              
              const linkClasses = `flex items-center ${collapsed ? 'lg:justify-center' : 'gap-4 px-3'} py-3 rounded-xl text-base font-bold transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`;

              const linkContent = (
                <>
                  <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                    {link.icon}
                  </div>
                  <span className={`truncate whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                    {link.name}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="hidden lg:block absolute left-16 bg-slate-800 text-white text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700">
                      {link.name}
                    </div>
                  )}
                </>
              );

              if (isAnchor) {
                return (
                  <a key={link.name} href={link.path} onClick={() => setMobileMenuOpen(false)} className={linkClasses}>
                    {linkContent}
                  </a>
                );
              }
              return (
                <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className={linkClasses}>
                  {linkContent}
                </Link>
              );
            })}
            
            {/* Support Button */}
            <button onClick={handleSupport} className={`w-full relative flex items-center ${collapsed ? 'lg:justify-center' : 'gap-4 px-3'} py-3 rounded-xl text-base font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group mt-4`}>
              <div className="shrink-0 text-slate-400 group-hover:text-emerald-400">
                <HelpCircle size={20} />
              </div>
              <span className={`truncate whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>
                Support
              </span>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="hidden lg:block absolute left-16 bg-slate-800 text-white text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-slate-700">
                  Support
                </div>
              )}
            </button>
          </div>

        </aside>

        {/* Floating Desktop Collapse Toggle (Rendered OUTSIDE overflow-x-hidden container) */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Menu" : "Collapse Menu"}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-[200] w-8 h-8 bg-white border border-indigo-200 text-indigo-600 rounded-full items-center justify-center shadow-lg hover:rotate-180 transition-all duration-500"
        >
          {collapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>
      </div>
    </>
  );
};

export default Sidebar;
