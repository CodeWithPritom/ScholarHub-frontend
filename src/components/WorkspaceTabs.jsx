import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, Library, Settings, User, Menu, ChevronDown, ShieldAlert, MessageCircle, LogOut, BarChart3 } from 'lucide-react';

const WorkspaceTabs = React.memo(({ user, profile, onLogout, toggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const tabs = [
    { name: 'Research Hub', path: '/research', icon: <LayoutGrid size={18} /> },
    { name: 'My Library', path: '/library', icon: <Library size={18} /> },
    { name: 'Auditor', path: '/auditor', icon: <BarChart3 size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
  ];

  // Helper to get breadcrumb name based on active path
  const getBreadcrumb = () => {
    if (location.pathname.startsWith('/research')) return 'Research Hub';
    if (location.pathname.startsWith('/library')) return 'My Library';
    if (location.pathname.startsWith('/auditor')) return 'Research Auditor';
    if (location.pathname.startsWith('/profile')) return 'User Profile';
    if (location.pathname.startsWith('/settings')) return 'Account Settings';
    return 'Workspace';
  };

  return (
    <div className="w-full bg-[#FAFAF8] border-b border-[#E5E5DF] h-16 shrink-0 flex items-center justify-between px-4 md:px-8 z-50">
      
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4 w-auto sm:w-1/3">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-3 -ml-2 text-slate-700 hover:text-[#171717] hover:bg-[#F3F3EF] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu size={22} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm font-black text-[#171717] tracking-tight">
          <span className="text-slate-700">ScholarHub</span>
          <span className="text-slate-600">/</span>
          <span>{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: Tabular Grid (Icon-Only on Mobile & Tablet, Text on Desktop) */}
      <div className="flex-1 flex justify-center h-full">
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 justify-center h-full px-1">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                title={tab.name}
                 className={`relative flex items-center gap-2 h-full px-2.5 sm:px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors group min-h-[44px] ${
                  isActive ? 'text-[#315CFF]' : 'text-slate-700 hover:text-[#171717]'
                }`}
              >
                <span className={`${isActive ? 'text-[#315CFF]' : 'text-slate-700 group-hover:text-[#171717]'} transition-colors`}>
                  {tab.icon}
                </span>
                <span className="hidden lg:inline">{tab.name}</span>
                
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#315CFF] rounded-t-full" />
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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F3EF] hover:bg-[#E5E5DF] rounded-[8px] border border-[#E5E5DF] transition-colors cursor-pointer">
              <User size={16} className="text-[#171717]" />
              <span className="text-xs font-medium text-[#171717] max-w-[80px] lg:max-w-[120px] truncate hidden sm:block">
                {user.email?.split('@')[0]}
              </span>
              <ChevronDown size={14} className="text-slate-700 ml-1" />
            </div>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 top-full mt-1.5 w-60 bg-[#FAFAF8] border border-[#E5E5DF] shadow-sm rounded-[12px] p-2 transition-all duration-200 transform origin-top ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
              <div className="px-4 py-3 border-b border-[#E5E5DF] mb-2">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest truncate">{user.email}</p>
              </div>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#171717] hover:text-[#315CFF] hover:bg-[#F3F3EF] rounded-[8px] transition-colors">
                <User size={18} className="text-slate-700" /> Account
              </Link>
              {(profile?.role === 'admin' || user?.email === 'arupbhowmikpritom@gmail.com') && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-[8px] transition-colors">
                  <ShieldAlert size={18} /> Admin Panel
                </Link>
              )}
              <a href="https://wa.me/8801853343176" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#171717] hover:text-[#315CFF] hover:bg-[#F3F3EF] rounded-[8px] transition-colors">
                <MessageCircle size={18} className="text-slate-700" /> Support
              </a>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-[8px] transition-colors text-left mt-1 border-t border-[#E5E5DF] pt-3">
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/auth')} className="px-4 py-1.5 bg-[#315CFF] text-white text-xs font-semibold rounded-[8px] hover:bg-[#2547d0] transition-colors">
            Log In
          </button>
        )}
      </div>

    </div>
  );
});

export default WorkspaceTabs;
