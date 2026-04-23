/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import SkipNavigation from '../SkipNavigation';
import DashboardSidebar from '@features/dashboard/components/DashboardSidebar';

const DashboardLayout = ({
  children,
  role = 'instructor',
  sidebarOpen,
  setSidebarOpen,
  navItems,
  mobileTabs,
  headerContent,
  className = '',
}) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const activeId = navItems.find((item) => item.isActive)?.id || navItems[0]?.id;

  const handleSidebarSelect = (id) => {
    const target = navItems.find((item) => item.id === id);
    target?.onSelect?.(id);
  };

  return (
    <div className={`relative min-h-screen overflow-x-clip bg-edubot-surface dark:bg-slate-950 ${className}`}>
      <SkipNavigation />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-edubot-surface opacity-80 dark:opacity-30" />
      <div className="pointer-events-none absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-edubot-orange/12 blur-3xl dark:bg-edubot-orange/10" />
      <div className="pointer-events-none absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-edubot-teal/12 blur-3xl dark:bg-edubot-teal/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_55%)]" />

      <div className="relative pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-56 max-w-7xl rounded-b-[3rem] bg-edubot-hero opacity-[0.08] blur-3xl md:block dark:opacity-[0.12]" />
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto hidden h-40 max-w-5xl rounded-full bg-gradient-to-r from-edubot-orange/10 via-edubot-soft/10 to-edubot-teal/10 blur-3xl md:block" />

        <div className="md:hidden">
          {mobileTabs}
        </div>

        {!isMobile ? (
          <div className="hidden md:block mx-auto max-w-7xl px-6 pb-14">
            <div className="flex items-start gap-6 lg:gap-8">
              <DashboardSidebar
                items={navItems}
                activeId={activeId}
                onSelect={handleSidebarSelect}
                isOpen={sidebarOpen}
                onToggle={setSidebarOpen}
                className="sticky top-28 hidden md:flex md:flex-shrink-0"
              />

              <main
                className="min-w-0 flex-1 space-y-6 lg:space-y-7"
                id="main-content"
                tabIndex={-1}
                role="main"
                aria-label={`${role} dashboard content`}
              >
                {headerContent}
                {children}
              </main>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 pb-28 md:hidden">
            <div className="space-y-4">
              {headerContent}
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
