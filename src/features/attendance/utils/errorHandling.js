import { toast } from 'react-hot-toast';

/**
 * Standardized error handling utilities for attendance features
 * Provides consistent error message formatting and user feedback
 */

/**
 * Get user-friendly error message based on API response
 * @param {Error} error - The error object from API call
 * @returns {string} User-friendly error message
 */
export const getAttendanceErrorMessage = (error) => {
  const status = error?.response?.status;
  
  // HTTP status code specific messages
  if (status === 401) {
    return 'Сессия мөөнөтү бүттү. Кайра кириңиз.';
  }
  
  if (status === 403) {
    return 'Бул аракетке уруксатыңыз жок.';
  }
  
  if (status === 404) {
    return 'Тандалган группа же сессия табылган жок.';
  }
  
  if (status === 422) {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || 'Текшерүү катасы болду.';
  }
  
  if (status === 429) {
    return 'Аракеттер саны ашты. Кээ бир убакыттан кийин кайта аракет кылыңыз.';
  }
  
  if (status >= 500) {
    return 'Сервер катасы болду. Кайта аракет кылыңыз.';
  }

  // Fallback to response message or default
  const fallback = error?.response?.data?.message || error?.message || 'Белгисиз ката кетти.';
  return Array.isArray(fallback) ? fallback.join(', ') : fallback;
};

/**
 * Handle API errors with consistent user feedback
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Fallback message if no specific error
 * @param {Object} options - Additional options
 */
export const handleAttendanceError = (
  error, 
  fallbackMessage = 'Ката кетти', 
  options = {}
) => {
  const {
    logToConsole = true,
    showToast = true,
    toastType = 'error',
    customMessage = null,
  } = options;

  // Log to console for debugging
  if (logToConsole) {
    console.error('Attendance API Error:', error);
  }

  // Show user-friendly toast notification
  if (showToast) {
    const message = customMessage || getAttendanceErrorMessage(error) || fallbackMessage;
    
    if (toastType === 'error') {
      toast.error(message);
    } else if (toastType === 'warning') {
      toast(message, { icon: '⚠️' });
    } else {
      toast(message);
    }
  }

  // Return the error message for further handling
  return customMessage || getAttendanceErrorMessage(error) || fallbackMessage;
};

/**
 * Handle successful operations with consistent feedback
 * @param {string} message - Success message
 * @param {Object} options - Additional options
 */
export const handleAttendanceSuccess = (message, options = {}) => {
  const {
    showToast = true,
    logToConsole = false,
    toastType = 'success',
  } = options;

  if (logToConsole) {
    console.log('Attendance Success:', message);
  }

  if (showToast) {
    if (toastType === 'success') {
      toast.success(message);
    } else {
      toast(message);
    }
  }
};

/**
 * Validate API response data structure
 * @param {any} response - API response data
 * @param {string} expectedType - Expected data type ('array', 'object', 'items')
 * @returns {Array} Normalized array data
 */
export const validateAndNormalizeResponse = (response, expectedType = 'array') => {
  if (!response) return [];

  // Handle different response structures
  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === 'object') {
    // Common response patterns
    const possibleArrays = ['items', 'data', 'rows', 'courses', 'groups', 'sessions', 'students'];
    
    for (const key of possibleArrays) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
  }

  // Return empty array if no valid data found
  console.warn('Unexpected response structure:', response);
  return [];
};

/**
 * Retry mechanism for failed API calls
 * @param {Function} apiCall - API function to call
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} API call result
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Debounce utility for search and filter operations
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Format student name consistently
 * @param {Object} student - Student object
 * @returns {string} Formatted student name
 */
export const formatStudentName = (student) => {
  return student?.fullName || student?.name || 'Белгисиз студент';
};

/**
 * Format session title consistently
 * @param {Object} session - Session object
 * @returns {string} Formatted session title
 */
export const formatSessionTitle = (session) => {
  return session?.title || `Сессия ${session?.sessionIndex || session?.id || ''}`;
};

/**
 * Format date consistently
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
  const {
    locale = 'ky-KG',
    includeTime = false,
    format = 'short',
  } = options;

  if (!date) return '-';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Күнү белгисиз';

  const formatOptions = {
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  if (format === 'long') {
    formatOptions.year = 'numeric';
  }

  return parsedDate.toLocaleDateString(locale, formatOptions);
};

/**
 * Calculate attendance rate with validation
 * @param {Object} stats - Attendance statistics
 * @returns {number} Attendance rate percentage
 */
export const calculateAttendanceRate = (stats) => {
  if (!stats || typeof stats !== 'object') return 0;

  const attended = (stats.present || 0) + (stats.late || 0);
  const scheduled = (stats.present || 0) + (stats.late || 0) + (stats.absent || 0) + (stats.excused || 0);

  return scheduled > 0 ? Math.round((attended / scheduled) * 100) : 0;
};

export default {
  getAttendanceErrorMessage,
  handleAttendanceError,
  handleAttendanceSuccess,
  validateAndNormalizeResponse,
  retryApiCall,
  debounce,
  formatStudentName,
  formatSessionTitle,
  formatDate,
  calculateAttendanceRate,
};
