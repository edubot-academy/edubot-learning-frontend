import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AnalyticsDataTable = ({
  title,
  subtitle,
  columns,
  data = [],
  loading = false,
  error = false,
  emptyMessage = 'No data available',
  searchable = false,
  pagination = false,
  pageSize = 10,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchable) return data;
    
    return data.filter(row =>
      row.some(cell =>
        String(cell).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable]);

  const paginatedData = React.useMemo(() => {
    if (!pagination) return filteredData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pagination, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  if (loading) {
    return (
      <div className={`rounded-3xl border border-edubot-line/80 dark:border-slate-700 bg-white/90 dark:bg-slate-950 overflow-hidden shadow-edubot-card ${className}`}>
        <div className="p-6 border-b border-edubot-line/70 dark:border-slate-700">
          <div className="animate-pulse">
            <div className="h-6 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-1/3 mb-2"></div>
            <div className="h-4 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-1/2"></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-edubot-surfaceAlt/60 dark:bg-slate-900">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-4 rounded bg-edubot-surfaceAlt dark:bg-slate-800 w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edubot-line/70 dark:divide-slate-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-3xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Error loading data
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            {subtitle || 'Unable to load table data. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-edubot-line/80 dark:border-slate-700 bg-white/90 dark:bg-slate-950 shadow-edubot-card transition-all duration-300 hover:-translate-y-1 hover:shadow-edubot-hover ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-edubot-orange/8 opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:to-edubot-soft/10" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-edubot-orange/10 blur-3xl transition-all duration-300 group-hover:scale-125 dark:bg-edubot-soft/10" />
      {(title || subtitle || searchable) && (
        <div className="relative p-6 border-b border-edubot-line/70 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-edubot-ink dark:text-gray-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-edubot-muted dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="dashboard-field w-full sm:w-64 pl-10"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-edubot-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead className="bg-edubot-surfaceAlt/60 dark:bg-slate-900">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-edubot-muted dark:text-slate-400 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edubot-line/70 dark:divide-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="text-edubot-muted dark:text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-4 text-edubot-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition-colors hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-edubot-ink dark:text-gray-100"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="relative px-6 py-4 border-t border-edubot-line/70 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-edubot-muted dark:text-slate-300">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="dashboard-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-lg ${
                      isActive
                        ? 'bg-edubot-orange text-white border-edubot-orange'
                        : 'border-edubot-line dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-edubot-ink dark:text-slate-300 hover:bg-edubot-surfaceAlt/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="dashboard-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AnalyticsDataTable.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.array),
  loading: PropTypes.bool,
  error: PropTypes.bool,
  emptyMessage: PropTypes.string,
  searchable: PropTypes.bool,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  className: PropTypes.string,
};

export default AnalyticsDataTable;
