import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AttendanceCell from './AttendanceCell';

const VirtualizedAttendanceTable = ({
  students = [],
  sessions = [],
  attendanceData = {},
  onStatusChange,
  rowHeight = 80,
  headerHeight = 60,
  containerHeight = 600,
  className = '',
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef(null);

  const gridWidth = useMemo(() => {
    return 200 + sessions.length * 80 + 100;
  }, [sessions.length]);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / rowHeight) + 5,
      students.length
    );

    return { startIndex, endIndex };
  }, [scrollTop, rowHeight, containerHeight, students.length]);

  const visibleStudents = useMemo(() => {
    return students.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [students, visibleRange]);

  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }

    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  const totalHeight = students.length * rowHeight;

  const handleKeyDown = useCallback(
    (event, studentId, sessionId) => {
      const { key } = event;

      switch (key) {
        case 'ArrowUp': {
          event.preventDefault();
          const currentIndex = students.findIndex((s) => s.id === studentId);
          if (currentIndex > 0) {
            const prevStudent = students[currentIndex - 1];
            const prevElement = document.querySelector(
              `[data-student-id="${prevStudent.id}"][data-session-id="${sessionId}"]`
            );
            prevElement?.focus();
          }
          break;
        }

        case 'ArrowDown': {
          event.preventDefault();
          const currentIndex = students.findIndex((s) => s.id === studentId);
          if (currentIndex < students.length - 1) {
            const nextStudent = students[currentIndex + 1];
            const nextElement = document.querySelector(
              `[data-student-id="${nextStudent.id}"][data-session-id="${sessionId}"]`
            );
            nextElement?.focus();
          }
          break;
        }

        case 'PageUp': {
          event.preventDefault();
          const newScrollTop = Math.max(0, scrollTop - containerHeight);
          containerRef.current?.scrollTo({ top: newScrollTop });
          break;
        }

        case 'PageDown': {
          event.preventDefault();
          const newScrollTop = Math.min(
            totalHeight - containerHeight,
            scrollTop + containerHeight
          );
          containerRef.current?.scrollTo({ top: newScrollTop });
          break;
        }

        case 'Home': {
          event.preventDefault();
          containerRef.current?.scrollTo({ top: 0 });
          break;
        }

        case 'End': {
          event.preventDefault();
          containerRef.current?.scrollTo({ top: totalHeight });
          break;
        }

        default:
          break;
      }
    },
    [students, scrollTop, containerHeight, totalHeight]
  );

  const getCellProps = useCallback(
    (studentId, sessionId) => {
      const student = students.find((s) => s.id === studentId);
      const session = sessions.find((s) => s.id === sessionId);
      const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';

      return {
        studentId,
        studentName: student?.fullName || 'Unknown',
        sessionId,
        sessionTitle: session?.title,
        sessionDate: session?.startsAt,
        currentStatus,
        isSelected: false,
        isUpdating: false,
        isDisabled: false,
        size: 'compact',
        onStatusChange,
      };
    },
    [students, sessions, attendanceData, onStatusChange]
  );

  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`virtualized-attendance-table min-w-0 max-w-full ${className}`}>
      <div className="min-w-0 max-w-full overflow-x-auto">
        <div
          className="sticky top-0 z-20 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          style={{ height: headerHeight, minWidth: gridWidth }}
        >
          <div
            className="grid gap-2 px-4 py-3"
            style={{ gridTemplateColumns: `200px repeat(${sessions.length}, 80px) 100px` }}
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Студент
            </div>

            {sessions.map((session) => (
              <div
                key={session.id}
                className="text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                <div className="truncate">
                  {session.title || `Сессия ${session.sessionIndex}`}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {session.startsAt
                    ? new Date(session.startsAt).toLocaleDateString('ky-KG', {
                      month: 'short',
                      day: 'numeric',
                    })
                    : '-'}
                </div>
              </div>
            ))}

            <div className="text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Жыйынтык
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="overflow-y-auto"
          style={{ height: containerHeight, minWidth: gridWidth }}
          onScroll={handleScroll}
        >
          <div style={{ height: visibleRange.startIndex * rowHeight }} />

          <div className="space-y-0">
            {visibleStudents.map((student) => {
              const studentStats = sessions.reduce((stats, session) => {
                const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                stats[status] = (stats[status] || 0) + 1;
                return stats;
              }, {});

              const attendedCount = (studentStats.present || 0) + (studentStats.late || 0);
              const scheduledCount =
                (studentStats.present || 0) +
                (studentStats.late || 0) +
                (studentStats.absent || 0) +
                (studentStats.excused || 0);

              const attendanceRate =
                scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

              return (
                <div
                  key={student.id}
                  className="grid items-center gap-2 border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  style={{
                    gridTemplateColumns: `200px repeat(${sessions.length}, 80px) 100px`,
                    height: rowHeight,
                    opacity: isScrolling ? 0.7 : 1,
                  }}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {(student.fullName || 'Unknown')
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900 dark:text-white">
                        {student.fullName}
                      </div>
                      {student.email && (
                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {sessions.map((session) => {
                    const cellProps = getCellProps(student.id, session.id);

                    return (
                      <AttendanceCell
                        key={`${student.id}-${session.id}`}
                        {...cellProps}
                        onKeyDown={(e) => handleKeyDown(e, student.id, session.id)}
                      />
                    );
                  })}

                  <div className="flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(attendanceRate)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {attendedCount}/{scheduledCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ height: (students.length - visibleRange.endIndex) * rowHeight }} />
        </div>
      </div>

      {isScrolling && totalHeight > containerHeight && (
        <div className="absolute bottom-4 right-4 rounded bg-gray-900 px-2 py-1 text-xs text-white">
          {Math.round((scrollTop / (totalHeight - containerHeight)) * 100)}%
        </div>
      )}
    </div>
  );
};

VirtualizedAttendanceTable.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fullName: PropTypes.string.isRequired,
      email: PropTypes.string,
    })
  ),
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      startsAt: PropTypes.string,
      sessionIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  attendanceData: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.oneOf(['present', 'late', 'absent', 'not_scheduled', 'excused'])
    )
  ),
  onStatusChange: PropTypes.func,
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  className: PropTypes.string,
};

VirtualizedAttendanceTable.defaultProps = {
  students: [],
  sessions: [],
  attendanceData: {},
  onStatusChange: null,
  rowHeight: 80,
  headerHeight: 60,
  containerHeight: 600,
  className: '',
};

export default VirtualizedAttendanceTable;
