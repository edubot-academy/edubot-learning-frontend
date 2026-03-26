import { DEFAULT_PAGE_SIZE, MAX_VISIBLE_PAGES } from './adminPanel.constants';

/**
 * Calculates visible page numbers for pagination
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} maxVisible - Maximum visible page numbers (default: MAX_VISIBLE_PAGES)
 * @returns {Array} Array of page numbers to display
 */
export const calculateVisiblePages = (currentPage, totalPages, maxVisible = MAX_VISIBLE_PAGES) => {
    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
};

/**
 * Formats numbers for display in Russian locale
 * @param {number} value - Number to format
 * @param {Object} options - Number formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, options = {}) => {
    return Number(value ?? 0).toLocaleString('ru-RU', {
        maximumFractionDigits: 0,
        ...options,
    });
};

/**
 * Formats percentage values
 * @param {number} value - Percentage value (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value) => `${Math.round(Number(value ?? 0))}%`;

/**
 * Formats currency values in Kyrgyz Som
 * @param {number} value - Currency value
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
    return `${formatNumber(value)} сом`;
};

/**
 * Validates if a tab ID is valid
 * @param {string} tabId - Tab ID to validate
 * @param {Array} validTabs - Array of valid tab IDs
 * @returns {boolean} True if tab is valid
 */
export const isValidTab = (tabId, validTabs) => {
    return validTabs.includes(tabId);
};

/**
 * Creates a safe date string for input fields
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Debounce hook implementation helper
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};
