import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import WorkspaceTabs from './WorkspaceTabs';
import FeedbackModal from './FeedbackModal';

const WorkspaceLayout = React.memo(({ user, profile, onLogout, lockScroll = false, hideNav = false, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', desktopCollapsed);
  }, [desktopCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-sds-bg font-sans selection:bg-blue-500/20">
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        collapsed={desktopCollapsed}
        setCollapsed={setDesktopCollapsed}
        user={user}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-sds-bg text-sds-text">
        {!hideNav && (
          <WorkspaceTabs 
            user={user} 
            profile={profile} 
            onLogout={onLogout} 
            toggleMobileMenu={() => setMobileMenuOpen(true)}
          />
        )}
        
        {/* Main Content Area */}
        <main className={`flex-1 ${lockScroll ? 'overflow-hidden' : 'overflow-y-auto'} w-full`}>
          <div className={`max-w-full mx-auto w-full h-full relative ${lockScroll ? "" : "px-4 md:px-8 py-6 md:py-10"}`}>
            {children}
          </div>
        </main>
      </div>

      <FeedbackModal />
    </div>
  );
});

export default WorkspaceLayout;
