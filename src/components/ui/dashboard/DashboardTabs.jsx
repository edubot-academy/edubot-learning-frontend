import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DashboardTabs = ({ items, activeId, onSelect, maxVisible = 4 }) => {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);

  const getTabLabel = (item) => {
    if (item.labelKey) {
      const itemLabel = t(item.labelKey, { defaultValue: '' });
      if (itemLabel) return itemLabel;
    }

    const translatedLabel = t(`dashboardTabs.labels.${item.id}`, { defaultValue: '' });
    return translatedLabel || item.label;
  };

  const renderTabIcon = (item) => {
    if (item.icon && typeof item.icon === 'function') {
      const Icon = item.icon;
      return <Icon className="h-5 w-5" />;
    }

    if (React.isValidElement(item.icon)) {
      return item.icon;
    }

    return <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />;
  };

  const selectByOffset = (currentId, offset) => {
    const currentIndex = items.findIndex((item) => item.id === currentId);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + offset + items.length) % items.length;
    onSelect(items[nextIndex].id);
    setShowMore(false);
  };

  const handleTabKeyDown = (event, itemId) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectByOffset(itemId, 1);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectByOffset(itemId, -1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      onSelect(items[0].id);
      setShowMore(false);
    }

    if (event.key === 'End') {
      event.preventDefault();
      onSelect(items[items.length - 1].id);
      setShowMore(false);
    }
  };

  return (
    <div className="md:hidden">
      <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 pt-2">
        <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-edubot-line/80 bg-white/92 p-2 shadow-edubot-glow backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/92">
          <nav className="flex items-center justify-around gap-1" aria-label={t('dashboardTabs.sections')}>
            {visibleItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  id={`dashboard-tab-${item.id}`}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setShowMore(false);
                  }}
                  onKeyDown={(event) => handleTabKeyDown(event, item.id)}
                  className={`flex min-h-[60px] min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-center transition-all duration-200 touch-manipulation active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-br from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                      : 'text-edubot-muted hover:bg-edubot-surfaceAlt dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                      isActive ? 'scale-105 bg-white/18' : 'bg-transparent'
                    }`}
                  >
                    {renderTabIcon(item)}
                  </span>
                  <span
                    className={`max-w-full truncate text-[11px] font-semibold leading-tight transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-edubot-ink dark:text-slate-200'
                    }`}
                    title={getTabLabel(item)}
                  >
                    {getTabLabel(item)}
                  </span>
                </button>
              );
            })}

            {hiddenItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="flex min-h-[60px] min-w-[64px] flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-edubot-muted transition-all duration-200 touch-manipulation active:scale-95 hover:bg-edubot-surfaceAlt dark:text-slate-300 dark:hover:bg-slate-800"
                aria-expanded={showMore}
                aria-controls="more-options-menu"
                aria-haspopup="menu"
              >
                <span
                  className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 ${
                    showMore ? 'rotate-90 bg-edubot-surfaceAlt dark:bg-slate-800' : ''
                  }`}
                >
                  ⋯
                </span>
                <span className="text-[11px] font-semibold text-edubot-ink dark:text-slate-200">
                  {t('dashboardTabs.more')}
                </span>
              </button>
            )}
          </nav>

          {showMore && hiddenItems.length > 0 && (
            <div
              id="more-options-menu"
              className="absolute inset-x-3 bottom-[5.75rem] z-50 mx-auto max-w-2xl rounded-panel border border-edubot-line/90 bg-[#fffaf5] p-3 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900"
              role="menu"
              aria-label={t('dashboardTabs.moreOptions')}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-edubot-ink dark:text-gray-100">
                  {t('dashboardTabs.moreOptions')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="rounded-xl p-2 text-edubot-muted transition hover:bg-edubot-surfaceAlt hover:text-edubot-ink dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200 touch-manipulation active:scale-95"
                  aria-label={t('common.close')}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[min(20rem,calc(100vh-12rem))] space-y-1.5 overflow-y-auto pr-1">
                {hiddenItems.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.id);
                        setShowMore(false);
                      }}
                      onKeyDown={(event) => handleTabKeyDown(event, item.id)}
                      className={`flex min-h-[46px] w-full items-center rounded-2xl px-3.5 py-2.5 text-left transition-all duration-200 touch-manipulation active:scale-95 ${
                        isActive
                          ? 'bg-gradient-to-r from-edubot-orange to-edubot-soft text-white shadow-edubot-soft'
                          : 'bg-white/80 text-slate-900 hover:bg-white dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                      }`}
                      role="menuitemradio"
                      aria-checked={isActive}
                    >
                      <span className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                        isActive ? 'bg-white/18 text-white' : 'bg-black/5 text-slate-700 dark:bg-white/10 dark:text-slate-100'
                      }`}>
                        {renderTabIcon(item)}
                      </span>
                      <span className={`font-medium leading-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {getTabLabel(item)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DashboardTabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      labelKey: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
      category: PropTypes.oneOf(['primary', 'secondary', 'progress', 'personal', 'content', 'users', 'analytics', 'admin', 'other']),
      workspaceGroup: PropTypes.string,
      priority: PropTypes.number,
    })
  ).isRequired,
  activeId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
};

export default DashboardTabs;
