import React, { useState } from 'react';
import Sidebar from './Sidebar';
import WorkspaceTabs from './WorkspaceTabs';

const WorkspaceLayout = ({ user, profile, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        collapsed={desktopCollapsed}
        setCollapsed={setDesktopCollapsed}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <WorkspaceTabs 
          user={user} 
          profile={profile} 
          onLogout={onLogout} 
          toggleMobileMenu={() => setMobileMenuOpen(true)}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto w-full h-full p-6 md:p-10 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
