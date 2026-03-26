import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DashboardTabs = ({ items, activeId, onSelect, maxVisible = 4 }) => {
  const [showMore, setShowMore] = useState(false);

  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);

  const getTabIcon = (categoryId) => {
    const icons = {
      primary: '🏠',
      secondary: '📚',
      progress: '📊',
      personal: '👤',
      content: '📝',
      users: '👥',
      analytics: '📈',
      admin: '⚙️',
      other: '📋',
    };
    return icons[categoryId] || '📋';
  };

  const getTabLabel = (item) => {
    // Shorten labels for mobile
    const mobileLabels = {
      overview: 'Башкы',
      courses: 'Курс',
      students: 'Окуучулар',
      analytics: 'Аналитика',
      ai: 'AI',
      attendance: 'Катышуулар',
      homework: 'Үй тапшырм',
      profile: 'Профиль',
      schedule: 'График',
      tasks: 'Тапшырмалар',
      progress: 'Прогресс',
      notifications: 'Билдирүүлөр',
      chat: 'Чат',
      leaderboard: 'Рейтинг',
      sessions: 'Сессиялар',
      offerings: 'Агымдар',
      stats: 'Стат',
      users: 'Колд.',
      companies: 'Компания',
      contacts: 'Байланыш',
      'ai-prompts': 'AI',
      integration: 'Интегр.',
    };
    return mobileLabels[item.id] || item.label;
  };

  const renderTabIcon = (item) => {
    if (item.icon && typeof item.icon === 'function') {
      const Icon = item.icon;
      return <Icon className="w-5 h-5" />;
    }

    if (React.isValidElement(item.icon)) {
      return item.icon;
    }

    return getTabIcon(item.category);
  };

  return (
    <div className="md:hidden">
      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[60]">
        <div className="flex justify-around items-center py-2">
          {visibleItems.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  setShowMore(false);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg touch-manipulation active:scale-95 min-h-[56px] min-w-[60px] transition-all duration-200 ${isActive
                  ? 'bg-edubot-orange text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`text-lg mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                  {renderTabIcon(item)}
                </span>
                <span className={`text-xs font-medium text-center transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                  {getTabLabel(item)}
                </span>
              </button>
            );
          })}

          {/* More Options Button */}
          {hiddenItems.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex flex-col items-center justify-center p-2 rounded-lg touch-manipulation active:scale-95 min-h-[56px] min-w-[60px] transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="tab"
              aria-expanded={showMore}
              aria-controls="more-options-menu"
            >
              <span className={`text-lg mb-1 transition-transform duration-200 ${showMore ? 'rotate-45' : ''
                }`}>
                ⋯
              </span>
              <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                Дагы
              </span>
            </button>
          )}
        </div>

        {/* More Options Menu */}
        {showMore && hiddenItems.length > 0 && (
          <div
            id="more-options-menu"
            className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[60vh] overflow-y-auto"
            role="menu"
            aria-label="Көбүрөөк опциялар"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Көбүрөөк опциялар
                </h3>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 touch-manipulation active:scale-95"
                  aria-label="Жабуу"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {hiddenItems.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelect(item.id);
                        setShowMore(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg touch-manipulation active:scale-95 min-h-[48px] transition-all duration-200 ${isActive
                        ? 'bg-edubot-orange text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      role="menuitem"
                    >
                      <span className="mr-3 text-lg">
                        {renderTabIcon(item)}
                      </span>
                      <span className="font-medium">
                        {getTabLabel(item)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DashboardTabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
      category: PropTypes.oneOf(['primary', 'secondary', 'progress', 'personal', 'content', 'users', 'analytics', 'admin', 'other']),
      priority: PropTypes.number,
    })
  ).isRequired,
  activeId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
};

export default DashboardTabs;
