import React from 'react';

const SkeletonCard = () => (
    <div className="group relative">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg"></div>
        
        {/* Content */}
        <div className="relative p-6 z-10">
            {/* Skeleton elements */}
            <div className="animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                </div>
                
                {/* Content skeleton */}
                <div className="space-y-3">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                </div>
                
                {/* Footer skeleton */}
                <div className="flex items-center justify-between mt-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-16"></div>
                </div>
                
                {/* Progress skeleton */}
                <div className="mt-4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 dark:bg-slate-600 rounded-full w-1/3 animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
);

const SkeletonStat = () => (
    <div className="group relative">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg"></div>
        
        {/* Content */}
        <div className="relative p-6 z-10">
            <div className="animate-pulse">
                {/* Icon skeleton */}
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3"></div>
                
                {/* Text skeleton */}
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                
                {/* Progress skeleton */}
                <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 dark:bg-slate-600 rounded-full w-3/4 animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
);

const SkeletonTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <table className="w-full table-auto text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="p-4 text-left">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                    </th>
                    <th className="p-4 text-left">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                    </th>
                    <th className="p-4 text-left">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                    </th>
                    <th className="p-4 text-left">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                        <td className="p-4">
                            <div className="animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 animate-pulse"></div>
                        </td>
                        <td className="p-4">
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                        </td>
                        <td className="p-4">
                            <div className="flex gap-2">
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export { SkeletonCard, SkeletonStat, SkeletonTable };
