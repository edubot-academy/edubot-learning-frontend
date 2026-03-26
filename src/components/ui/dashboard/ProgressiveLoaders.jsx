/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { DashboardOverviewSkeleton, DashboardTableSkeleton } from './DashboardSkeletons';

/**
 * ProgressiveDashboard - Implements progressive loading for dashboard sections
 * Staggers content loading for better perceived performance
 */
const ProgressiveDashboard = ({ 
    sections = [], 
    loadingSections = [], 
    staggerDelay = 200,
    skeletonComponent = null 
}) => {
    const [visibleSections, setVisibleSections] = useState(
        sections.map((_, index) => !loadingSections[index])
    );

    useEffect(() => {
        const timers = [];
        
        loadingSections.forEach((isLoading, index) => {
            if (!isLoading) {
                // Show section immediately if not loading
                setVisibleSections(prev => {
                    const newVisible = [...prev];
                    newVisible[index] = true;
                    return newVisible;
                });
            } else {
                // Stagger the skeleton appearance
                const timer = setTimeout(() => {
                    // Skeleton is already visible, but we'll add animation class
                    const element = document.getElementById(`progressive-section-${index}`);
                    if (element) {
                        element.classList.add('animate-pulse');
                    }
                }, index * staggerDelay);
                
                timers.push(timer);
            }
        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [loadingSections, staggerDelay]);

    return (
        <div className="space-y-6">
            {sections.map((section, index) => (
                <div
                    key={index}
                    id={`progressive-section-${index}`}
                    className={`transition-all duration-700 ease-in-out ${
                        visibleSections[index] 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-30 scale-95 translate-y-2'
                    }`}
                >
                    {loadingSections[index] ? (
                        skeletonComponent || <DashboardOverviewSkeleton />
                    ) : (
                        section
                    )}
                </div>
            ))}
        </div>
    );
};

/**
 * StaggeredLoader - Shows loading indicators with staggered animation
 */
const StaggeredLoader = ({ 
    items = [], 
    loading = false, 
    renderItem = null,
    skeletonItem = null 
}) => {
    const [visibleItems, setVisibleItems] = useState([]);

    useEffect(() => {
        if (!loading) {
            // Show all items immediately when not loading
            setVisibleItems(items.map((_, index) => index));
            return;
        }

        // Stagger item appearance during loading
        const timers = items.map((_, index) => 
            setTimeout(() => {
                setVisibleItems(prev => [...prev, index]);
            }, index * 100)
        );

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [loading, items]);

    if (!loading) {
        return items.map((item, index) => renderItem(item, index));
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`transition-all duration-500 ease-out ${
                        visibleItems.includes(index)
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 translate-x-4'
                    }`}
                >
                    {skeletonItem || <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>}
                </div>
            ))}
        </div>
    );
};

/**
 * ProgressiveContentLoader - Progressive loading for mixed content types
 */
const ProgressiveContentLoader = ({ 
    content = [], 
    loadingStates = [], 
    skeletonMap = {} 
}) => {
    return (
        <div className="space-y-6">
            {content.map((item, index) => {
                const isLoading = loadingStates[index];
                const contentType = item.type || 'default';
                const SkeletonComponent = skeletonMap[contentType] || skeletonMap.default;

                return (
                    <div
                        key={index}
                        className={`transition-all duration-600 ease-in-out ${
                            isLoading
                                ? 'opacity-50 scale-98'
                                : 'opacity-100 scale-100'
                        }`}
                    >
                        {isLoading ? (
                            SkeletonComponent ? <SkeletonComponent /> : <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ) : (
                            item.component
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/**
 * LazyLoadSection - Lazy loads dashboard sections when they come into view
 */
const LazyLoadSection = ({ 
    children, 
    fallback = null, 
    rootMargin = '100px',
    threshold = 0.1 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const elementRef = React.useRef();

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasLoaded) {
                    setIsVisible(true);
                    setHasLoaded(true);
                }
            },
            {
                rootMargin,
                threshold
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [rootMargin, threshold, hasLoaded]);

    return (
        <div ref={elementRef} className="min-h-[200px]">
            {isVisible ? (
                <div className="animate-fade-in">
                    {children}
                </div>
            ) : (
                fallback || <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            )}
        </div>
    );
};

/**
 * ProgressiveTableLoader - Progressive loading for table data
 */
const ProgressiveTableLoader = ({ 
    data = [], 
    loading = false, 
    columns = [], 
    renderRow = null,
    rowsPerPage = 10 
}) => {
    const [visibleRows, setVisibleRows] = useState([]);
    const [loadedRows, setLoadedRows] = useState(0);

    useEffect(() => {
        if (!loading) {
            // Load all rows progressively when data is ready
            const timer = setInterval(() => {
                setLoadedRows(prev => {
                    const next = Math.min(prev + 5, data.length);
                    if (next >= data.length) {
                        clearInterval(timer);
                    }
                    return next;
                });
            }, 100);

            return () => clearInterval(timer);
        }
    }, [loading, data, rowsPerPage]);

    useEffect(() => {
        setVisibleRows(data.slice(0, loadedRows));
    }, [data, loadedRows]);

    if (loading) {
        return <DashboardTableSkeleton rows={rowsPerPage} columns={columns.length} />;
    }

    return (
        <div className="space-y-2">
            {visibleRows.map((row, index) => (
                <div
                    key={row.id || index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {renderRow ? renderRow(row, index) : (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            {JSON.stringify(row)}
                        </div>
                    )}
                </div>
            ))}
            
            {loadedRows < data.length && (
                <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-4 h-4"></div>
                        Жүктөлүүдө...
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ProgressiveImageLoader - Progressive loading for images in dashboards
 */
const ProgressiveImageLoader = ({ 
    src, 
    alt = '', 
    fallback = null,
    className = '',
    onLoad = null 
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const img = new Image();
        
        img.onload = () => {
            setImageSrc(src);
            setLoading(false);
            onLoad?.();
        };
        
        img.onerror = () => {
            setError(true);
            setLoading(false);
        };
        
        img.src = src;
    }, [src, onLoad]);

    if (loading) {
        return (
            <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-slate-400">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return fallback || (
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center ${className}`}>
                <div className="text-gray-400 text-center p-4">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Сүрөт жүктөлүп жатат</p>
                </div>
            </div>
        );
    }

    return (
        <img 
            src={imageSrc} 
            alt={alt} 
            className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${className}`}
        />
    );
};

/**
 * DashboardProgressIndicator - Shows overall loading progress for dashboard
 */
const DashboardProgressIndicator = ({ 
    sections = [], 
    completedSections = [], 
    showPercentage = true 
}) => {
    const progress = sections.length > 0 ? (completedSections.length / sections.length) * 100 : 0;
    
    return (
        <div className="space-y-2">
            {showPercentage && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Жүктөлүү прогресси</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            )}
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                >
                    <div className="h-full bg-white/20 animate-pulse"></div>
                </div>
            </div>
            
            {sections.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                completedSections.includes(section)
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export {
    ProgressiveDashboard,
    StaggeredLoader,
    ProgressiveContentLoader,
    LazyLoadSection,
    ProgressiveTableLoader,
    ProgressiveImageLoader,
    DashboardProgressIndicator
};
