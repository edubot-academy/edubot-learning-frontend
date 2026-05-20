import { useState, useEffect, useRef } from 'react';
import i18n from '../i18n';
import { parseApiError } from '@shared/api/error';

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds
const TERMINAL_STATUSES = ['ready', 'failed', 'missing'];
const getStatusFetchError = (error) =>
  parseApiError(error, i18n.t('adminCourses.transcode.errors.statusFetchFailed')).message;
const getPlaybackError = () => i18n.t('adminCourses.transcode.errors.playbackFailed');

/**
 * Hook to poll for transcoding status updates.
 * Automatically stops polling when status reaches terminal state (ready/failed/missing).
 * 
 * @param {number} lessonId - Lesson ID to check
 * @param {string} initialStatus - Initial playback status
 * @param {function} fetchStatusFn - Async function to fetch status (lessonId) => {playbackStatus, playbackError, transcodingJobId}
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 * 
 * @returns {{
 *   status: string,
 *   error: string | null,
 *   isPolling: boolean,
 *   manualRefresh: function
 * }}
 */
export const useTranscodingStatus = (lessonId, initialStatus, fetchStatusFn, enabled = true) => {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef(null);

  // Determine if we should be polling
  const shouldPoll = enabled && lessonId && !TERMINAL_STATUSES.includes(status);

  useEffect(() => {
    if (!shouldPoll) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    let isMounted = true;

    // Fetch function defined inside effect to avoid infinite dependency loops
    const fetchStatus = async () => {
      if (!isMounted) return;
      
      try {
        const result = await fetchStatusFn(lessonId);
        if (isMounted) {
          setStatus(result.playbackStatus);
          if (result.playbackStatus === 'failed' && result.playbackError) {
            setError(getPlaybackError());
          } else {
            setError(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch transcoding status:', err);
          setError(getStatusFetchError(err));
        }
      }
    };

    // Immediate first poll
    fetchStatus();

    // Set up polling interval
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [shouldPoll, lessonId, fetchStatusFn]);

  const manualRefresh = async () => {
    try {
      const result = await fetchStatusFn(lessonId);
      setStatus(result.playbackStatus);
      if (result.playbackStatus === 'failed' && result.playbackError) {
        setError(getPlaybackError());
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setError(getStatusFetchError(err));
    }
  };

  return {
    status,
    error,
    isPolling,
    manualRefresh,
  };
};

export default useTranscodingStatus;
