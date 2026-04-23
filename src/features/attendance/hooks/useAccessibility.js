import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCESSIBILITY, ATTENDANCE_STATUS_CONFIG, getNextStatus } from '../constants/attendanceConfig';

/**
 * Accessibility Hook for Attendance Components
 * Provides keyboard navigation, screen reader support, and focus management
 */
export const useAccessibility = ({
  students = [],
  sessions = [],
  attendanceData = {},
  onStatusChange,
  onSelectionChange,
  onSave,
}) => {
  const [focusedCell, setFocusedCell] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const announcementTimeoutRef = useRef(null);

  // Screen reader announcements
  const announce = useCallback((message) => {
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    setAnnouncement(message);

    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncement('');
    }, 3000);
  }, []);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback((event, studentId, sessionId) => {
    const { key, ctrlKey, metaKey } = event;

    // Prevent default for our handled keys
    const handledKeys = [' ', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Delete', 'Backspace'];
    if (handledKeys.includes(key)) {
      event.preventDefault();
    }

    switch (key) {
      case ' ':
      case 'Enter': {
        // Space or Enter to cycle status
        const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';
        const nextStatus = getNextStatus(currentStatus);
        const nextConfig = ATTENDANCE_STATUS_CONFIG[nextStatus];

        onStatusChange?.(studentId, sessionId, nextStatus);

        announce(
          ACCESSIBILITY.announcements.statusChanged
            .replace('{status}', nextConfig.label)
        );
        break;
      }

      case 'ArrowUp': {
        // Navigate to previous student
        const currentStudentIndex = students.findIndex(s => s.id === studentId);
        if (currentStudentIndex > 0) {
          const prevStudent = students[currentStudentIndex - 1];
          setFocusedCell(`${prevStudent.id}-${sessionId}`);
        }
        break;
      }

      case 'ArrowDown': {
        // Navigate to next student
        const currentStudentIndex = students.findIndex(s => s.id === studentId);
        if (currentStudentIndex < students.length - 1) {
          const nextStudent = students[currentStudentIndex + 1];
          setFocusedCell(`${nextStudent.id}-${sessionId}`);
        }
        break;
      }

      case 'ArrowLeft': {
        // Navigate to previous session
        const currentSessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (currentSessionIndex > 0) {
          const prevSession = sessions[currentSessionIndex - 1];
          setFocusedCell(`${studentId}-${prevSession.id}`);
        }
        break;
      }

      case 'ArrowRight': {
        // Navigate to next session
        const currentSessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (currentSessionIndex < sessions.length - 1) {
          const nextSession = sessions[currentSessionIndex + 1];
          setFocusedCell(`${studentId}-${nextSession.id}`);
        }
        break;
      }

      case 'Escape': {
        // Clear selection/focus
        setFocusedCell(null);
        announce(ACCESSIBILITY.announcements.selectionCleared);
        break;
      }

      case 'Delete':
      case 'Backspace': {
        // Mark as absent (quick action)
        onStatusChange?.(studentId, sessionId, 'absent');
        announce(
          ACCESSIBILITY.announcements.statusChanged
            .replace('{status}', ATTENDANCE_STATUS_CONFIG.absent.label)
        );
        break;
      }

      case 's':
      case 'S': {
        if (ctrlKey || metaKey) {
          // Ctrl/Cmd + S to save
          event.preventDefault();
          onSave?.();
          announce(ACCESSIBILITY.announcements.changesSaved);
        }
        break;
      }

      case 'a':
      case 'A': {
        if ((ctrlKey || metaKey) && onSelectionChange) {
          // Ctrl/Cmd + A to select all
          event.preventDefault();
          const allCells = new Set();
          students.forEach(student => {
            sessions.forEach(session => {
              allCells.add(`${student.id}-${session.id}`);
            });
          });
          onSelectionChange?.(allCells);
          announce('Бардык клеткалар тандалды');
        }
        break;
      }

      default:
        break;
    }
  }, [students, sessions, attendanceData, onStatusChange, onSelectionChange, onSave, announce]);

  // Focus management
  const setCellFocus = useCallback((studentId, sessionId) => {
    setFocusedCell(`${studentId}-${sessionId}`);

    // Find and focus the actual DOM element
    const element = document.querySelector(`[data-student-id="${studentId}"][data-session-id="${sessionId}"]`);
    if (element) {
      element.focus();
    }
  }, []);

  // Selection helpers
  const selectCell = useCallback((studentId, sessionId, isMultiSelect = false) => {
    const cellKey = `${studentId}-${sessionId}`;

    if (isMultiSelect) {
      // This would be handled by the parent component with shift+click logic
      onSelectionChange?.(new Set([cellKey]));
    } else {
      onSelectionChange?.(new Set([cellKey]));
    }

    setCellFocus(studentId, sessionId);
  }, [onSelectionChange, setCellFocus]);

  // Get ARIA attributes for cells
  const getCellAriaProps = useCallback((studentId, sessionId, currentStatus) => {
    const student = students.find(s => s.id === studentId);
    const session = sessions.find(s => s.id === sessionId);
    const isFocused = focusedCell === `${studentId}-${sessionId}`;

    return {
      role: 'button',
      tabIndex: isFocused ? 0 : -1,
      'aria-label': ACCESSIBILITY.labels.attendanceCell
        .replace('{studentName}', student?.fullName || 'Unknown')
        .replace('{sessionTitle}', session?.title || `Session ${sessionId}`),
      'aria-pressed': currentStatus !== 'not_scheduled',
      'aria-describedby': `status-${studentId}-${sessionId}`,
      'data-student-id': studentId,
      'data-session-id': sessionId,
      'data-status': currentStatus,
    };
  }, [students, sessions, focusedCell]);

  // Get ARIA attributes for status buttons
  const getStatusButtonAriaProps = useCallback((studentId, status) => {
    const student = students.find(s => s.id === studentId);
    const statusConfig = ATTENDANCE_STATUS_CONFIG[status];

    return {
      'aria-label': ACCESSIBILITY.labels.statusButton
        .replace('{studentName}', student?.fullName || 'Unknown')
        .replace('{status}', statusConfig.label),
      'aria-pressed': false,
      role: 'button',
    };
  }, [students]);

  // Get ARIA attributes for bulk actions
  const getBulkActionAriaProps = useCallback((status) => {
    const statusConfig = ATTENDANCE_STATUS_CONFIG[status];

    return {
      'aria-label': ACCESSIBILITY.labels.bulkAction.replace('{status}', statusConfig.label),
      role: 'button',
    };
  }, []);

  // Keyboard shortcut help
  const getKeyboardShortcuts = useCallback(() => {
    return [
      { key: ACCESSIBILITY.shortcuts.cycleStatus, description: 'Статусу өзгөртүү' },
      { key: ACCESSIBILITY.shortcuts.selectMultiple, description: 'Көп тандао' },
      { key: ACCESSIBILITY.shortcuts.clearSelection, description: 'Тандоону тазалоо' },
      { key: ACCESSIBILITY.shortcuts.saveChanges, description: 'Өзгөртүүлөрдү сактоо' },
      { key: 'Arrow Keys', description: 'Навигация' },
      { key: 'Delete/Backspace', description: 'Келген жок деп белгиле' },
      { key: 'Ctrl/Cmd + A', description: 'Баарын тандао' },
    ];
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    focusedCell,
    announcement,

    // Methods
    announce,
    handleKeyDown,
    setCellFocus,
    selectCell,

    // ARIA props helpers
    getCellAriaProps,
    getStatusButtonAriaProps,
    getBulkActionAriaProps,

    // Utilities
    getKeyboardShortcuts,
  };
};

export const useFocusTrap = (containerRef) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef]);
};


/**
 * Custom hook for managing live regions
 */
export const useLiveRegion = () => {
  const [announcements, setAnnouncements] = useState([]);
  const liveRegionRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    const id = Date.now();
    setAnnouncements(prev => [...prev, { id, message, priority }]);

    // Auto-remove announcement after it's read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  return {
    announce,
    announcements,
    liveRegionRef,
  };
};

/**
 * Hook for managing focus restoration
 */
export const useFocusRestoration = () => {
  const previousFocusRef = useRef(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
  };
};

export default useAccessibility;
