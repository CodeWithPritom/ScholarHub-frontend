import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Shield, Library, Dna, User, Sparkles } from 'lucide-react';

export const MobileBottomNav = ({ user }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Don't render on auth or shared preview pages where full screen is preferred
  if (currentPath === '/auth' || currentPath.startsWith('/share/')) {
    return null;
  }

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/',
      isActive: currentPath === '/' || currentPath.startsWith('/research')
    },
    {
      id: 'auditor',
      label: 'Auditor',
      icon: Shield,
      path: '/auditor',
      isActive: currentPath.startsWith('/auditor')
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library,
      path: '/library',
      isActive: currentPath.startsWith('/library')
    },
    {
      id: 'dna',
      label: 'Research DNA',
      icon: Dna,
      path: '/dna',
      isActive: currentPath.startsWith('/dna')
    },
    {
      id: 'profile',
      label: user ? 'Profile' : 'Log In',
      icon: User,
      path: user ? '/profile' : '/auth',
      isActive: currentPath.startsWith('/profile') || currentPath.startsWith('/settings')
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAFAF8]/95 backdrop-blur-md border-t border-[#E5E5DF] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px] min-h-[46px] select-none ${
                active 
                  ? 'text-[#315CFF] font-bold' 
                  : 'text-[#171717]/60 hover:text-[#171717] font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className={active ? 'scale-105 text-[#315CFF]' : ''} />
                {active && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#315CFF] rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight leading-none ${active ? 'font-black text-[#315CFF]' : 'font-semibold'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
