import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, Library, Settings, User, Menu, ChevronDown, ShieldAlert, MessageCircle, LogOut } from 'lucide-react';

const WorkspaceTabs = ({ user, profile, onLogout, toggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabs = [
    { name: 'Research Hub', path: '/research', icon: <LayoutGrid size={18} /> },
    { name: 'My Library', path: '/library', icon: <Library size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
  ];

  // Helper to get breadcrumb name based on active path
  const getBreadcrumb = () => {
    if (location.pathname.startsWith('/research')) return 'Research Hub';
    if (location.pathname.startsWith('/library')) return 'My Library';
    if (location.pathname.startsWith('/profile')) return 'User Profile';
    if (location.pathname.startsWith('/settings')) return 'Account Settings';
    return 'Workspace';
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-4 md:px-8 z-50">
      
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-4 w-1/3">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm font-black text-slate-900 tracking-tight">
          <span className="text-slate-400">ScholarHub</span>
          <span className="text-slate-300">/</span>
          <span>{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: Tabular Grid */}
      <div className="flex-1 flex justify-center h-full">
        <div className="flex items-center gap-2 lg:gap-6 overflow-x-auto scrollbar-none px-2 h-full">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`relative flex items-center gap-2 h-full px-3 text-sm font-bold whitespace-nowrap transition-colors group ${
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
                  {tab.icon}
                </span>
                <span className="hidden lg:inline">{tab.name}</span>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: User Profile Dropdown */}
      <div className="w-1/3 flex justify-end shrink-0">
        {user ? (
          <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer">
              <User size={16} className="text-slate-600" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest max-w-[80px] lg:max-w-[120px] truncate hidden sm:block">
                {user.email?.split('@')[0]}
              </span>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </div>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 transition-all duration-200 transform origin-top ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="px-4 py-3 border-b border-slate-100 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
              </div>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <User size={18} className="text-slate-400" /> My Account
              </Link>
              {(profile?.role === 'admin' || user?.email === 'arupbhowmikpritom@gmail.com') && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
                  <ShieldAlert size={18} /> Admin Panel
                </Link>
              )}
              <a href="https://wa.me/8801853343176" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <MessageCircle size={18} className="text-slate-400" /> Contact Admin
              </a>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors text-left mt-1 border-t border-slate-50 pt-3">
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/auth')} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            Log In
          </button>
        )}
      </div>

    </div>
  );
};

export default WorkspaceTabs;
