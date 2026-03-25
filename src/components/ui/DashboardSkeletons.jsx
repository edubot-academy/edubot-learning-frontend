import React from 'react';

/**
 * DashboardOverviewSkeleton - Skeleton loader for dashboard overview sections
 * Used across all dashboards for main overview content
 */
const DashboardOverviewSkeleton = () => (
    <div className="space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        {/* Icon skeleton */}
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
                        
                        {/* Value skeleton */}
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        
                        {/* Label skeleton */}
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        
                        {/* Progress skeleton */}
                        <div className="mt-4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-300 dark:bg-slate-600 rounded-full w-2/3 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Recent activity skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            {/* Section header skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-24 animate-pulse"></div>
            </div>

            {/* Activity items skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse">
                        {/* Avatar skeleton */}
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        
                        {/* Content skeleton */}
                        <div className="flex-1">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                        
                        {/* Time skeleton */}
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * DashboardTableSkeleton - Skeleton loader for dashboard tables
 * Used for student lists, course lists, and other tabular data
 */
const DashboardTableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="animate-pulse">
            {/* Table header skeleton */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="flex gap-2">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-32"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
                    </div>
                </div>
                
                {/* Column headers skeleton */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    ))}
                </div>
            </div>

            {/* Table rows skeleton */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <div key={colIndex} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Pagination skeleton */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/**
 * DashboardStatsSkeleton - Skeleton loader for statistics/analytics sections
 * Used for admin stats, course analytics, etc.
 */
const DashboardStatsSkeleton = () => (
    <div className="space-y-6">
        {/* Main stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                    </div>
                    
                    {/* Value skeleton */}
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3"></div>
                    
                    {/* Change indicator skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                    
                    {/* Mini chart skeleton */}
                    <div className="mt-4 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
            ))}
        </div>

        {/* Chart section skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="animate-pulse">
                {/* Chart header skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
                    </div>
                </div>

                {/* Chart area skeleton */}
                <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
        </div>
    </div>
);

/**
 * DashboardListSkeleton - Skeleton loader for list-based content
 * Used for course lists, student lists, etc.
 */
const DashboardListSkeleton = ({ items = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: items }).map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                    {/* Image/avatar skeleton */}
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0"></div>
                    
                    {/* Content skeleton */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                        </div>
                        
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                        
                        {/* Tags/meta skeleton */}
                        <div className="flex items-center gap-2 pt-2">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
                        </div>
                    </div>
                    
                    {/* Actions skeleton */}
                    <div className="flex flex-col gap-2">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/**
 * DashboardCardSkeleton - Skeleton loader for card-based content
 * Used for course cards, student cards, etc.
 */
const DashboardCardSkeleton = ({ cards = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cards }).map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-pulse">
                {/* Card image skeleton */}
                <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
                
                {/* Card content skeleton */}
                <div className="p-6 space-y-4">
                    {/* Title skeleton */}
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    
                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                    </div>
                    
                    {/* Meta info skeleton */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-12"></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/**
 * DashboardFormSkeleton - Skeleton loader for form sections
 * Used for course creation, user management forms, etc.
 */
const DashboardFormSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="space-y-6 animate-pulse">
            {/* Form header skeleton */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-6">
                {/* Text input skeleton */}
                <div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>

                {/* Textarea skeleton */}
                <div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                    <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>

                {/* Select input skeleton */}
                <div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>

                {/* Checkbox/radio skeleton */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>

            {/* Form actions skeleton */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end gap-3">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
                <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded-lg w-24"></div>
            </div>
        </div>
    </div>
);

export {
    DashboardOverviewSkeleton,
    DashboardTableSkeleton,
    DashboardStatsSkeleton,
    DashboardListSkeleton,
    DashboardCardSkeleton,
    DashboardFormSkeleton
};
