import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminShellComponent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative flex h-screen font-sans selection:bg-blue-200 dark:selection:bg-blue-900 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300 isolate z-0">
      {/* Light Mode Background */}
      <div className="fixed inset-0 z-[-2] h-full w-full dark:hidden [&>div]:absolute [&>div]:bottom-0 [&>div]:right-0 [&>div]:z-[-2] [&>div]:h-full [&>div]:w-full [&>div]:bg-gradient-to-b [&>div]:from-blue-200 [&>div]:to-white">
        <div />
      </div>

      {/* Dark Mode Background */}
      <div className="fixed top-0 z-[-2] h-screen w-screen hidden dark:block bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.4),rgba(255,255,255,0))]" />

      {/* Overlay on mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        <Header toggleMobileMenu={() => setIsMobileOpen(true)} />

        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
