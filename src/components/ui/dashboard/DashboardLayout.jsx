/* eslint-disable react/prop-types */
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
  const activeId = navItems.find((item) => item.isActive)?.id || navItems[0]?.id;

  const handleSidebarSelect = (id) => {
    const target = navItems.find((item) => item.id === id);
    target?.onSelect?.(id);
  };

  return (
    <div className={`min-h-screen pt-24 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <SkipNavigation />

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {mobileTabs}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block mx-auto max-w-7xl px-6 pb-12">
        <div className="flex gap-6">
          {/* Sidebar */}
          {sidebarOpen && (
            <DashboardSidebar
              items={navItems}
              activeId={activeId}
              onSelect={handleSidebarSelect}
              isOpen={sidebarOpen}
              onToggle={setSidebarOpen}
              className="hidden md:flex md:flex-shrink-0"
            />
          )}

          {/* Main Content */}
          <main
            className="flex-1 space-y-6"
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

      {/* Mobile Content */}
      <div className="mx-auto max-w-6xl px-4 pb-12 md:hidden">
        <div className="space-y-4">
          {headerContent}
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
