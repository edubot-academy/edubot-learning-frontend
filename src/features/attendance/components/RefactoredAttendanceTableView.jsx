import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  PERFORMANCE_THRESHOLDS,
} from '../constants/attendanceConfig';
import { fetchGroupRoster } from '../../courseGroups/roster';
import { fetchCourseSessions } from '../../groupSessions/api';
import { fetchSessionAttendance, markSessionAttendanceBulk } from '../api';
import AttendanceFilters from './AttendanceFilters';
import AttendanceBulkActions from './AttendanceBulkActions';
import EnhancedAttendanceSummary from './EnhancedAttendanceSummary';
import AttendanceCell from './AttendanceCell';
import AttendanceCardView from './AttendanceCardView';
import VirtualizedAttendanceTable from './VirtualizedAttendanceTable';
import {
  AttendanceTableSkeleton,
  AttendanceCardSkeleton,
  AttendanceLoadingOverlay,
  AttendanceEmptyState,
  AttendanceErrorState,
} from './AttendanceLoadingStates';
import { useAccessibility } from '../hooks/useAccessibility';

/**
 * Refactored Attendance Table View
 * Modern, responsive, and accessible attendance management interface
 */
const RefactoredAttendanceTableView = ({
  groupId,
  groupName = '',
  courseId = null,
  onAttendanceUpdate,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [updatingCells, setUpdatingCells] = useState(new Set());
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [viewMode, setViewMode] = useState('auto'); // auto | table | cards | virtualized
  const [filters, setFilters] = useState({
    searchQuery: '',
    statusFilter: 'all',
    dateRange: 'all',
    attendanceRateFilter: 'all',
    sessionFilter: 'all',
    customStartDate: '',
    customEndDate: '',
  });

  const loadData = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const [studentsRes, sessionsRes] = await Promise.all([
        fetchGroupRoster({ groupId, page: 1, limit: 200 }),
        fetchCourseSessions({ groupId }),
      ]);

      const studentsList = Array.isArray(studentsRes)
        ? studentsRes
        : studentsRes?.items || studentsRes?.data || [];

      const sessionsList = Array.isArray(sessionsRes)
        ? sessionsRes
        : sessionsRes?.items || sessionsRes?.data || [];

      setStudents(studentsList);
      setSessions(sessionsList);

      if (sessionsList.length > 0) {
        const attendancePromises = sessionsList.map((session) =>
          fetchSessionAttendance(session.id).catch(() => ({ items: [] }))
        );

        const attendanceResults = await Promise.all(attendancePromises);
        const consolidatedAttendance = {};

        attendanceResults.forEach((sessionAttendance, index) => {
          const sessionId = sessionsList[index]?.id;
          const attendanceItems = Array.isArray(sessionAttendance)
            ? sessionAttendance
            : sessionAttendance?.items || sessionAttendance?.rows || sessionAttendance?.data || [];

          attendanceItems.forEach((record) => {
            const studentId = record.studentId || record.userId;
            if (!studentId || !sessionId) return;

            if (!consolidatedAttendance[studentId]) {
              consolidatedAttendance[studentId] = {};
            }

            consolidatedAttendance[studentId][sessionId] = record.status;
          });
        });

        setAttendanceData(consolidatedAttendance);
      } else {
        setAttendanceData({});
      }
    } catch (loadError) {
      console.error('Failed to load attendance data:', loadError);
      setError(loadError);
      toast.error('Жүктөөдө ката кетти');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const responsiveViewMode = useMemo(() => {
    if (viewMode !== 'auto') return viewMode;

    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const shouldUseVirtualization =
      students.length > PERFORMANCE_THRESHOLDS.VIRTUAL_SCROLLING_THRESHOLD;

    if (isMobile) return 'cards';
    if (shouldUseVirtualization) return 'virtualized';
    return 'table';
  }, [viewMode, students.length]);

  const handleStatusChange = useCallback(
    (studentId, sessionId, status) => {
      const cellKey = `${studentId}-${sessionId}`;

      setPendingChanges((prev) => {
        const newChanges = new Map(prev);
        const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';

        if (status === currentStatus) {
          newChanges.delete(cellKey);
        } else {
          newChanges.set(cellKey, { studentId, sessionId, status });
        }

        return newChanges;
      });

      setAttendanceData((prev) => {
        const optimisticData = { ...prev };
        if (!optimisticData[studentId]) {
          optimisticData[studentId] = {};
        }
        optimisticData[studentId][sessionId] = status;
        return optimisticData;
      });

      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (next.has(cellKey)) {
          next.delete(cellKey);
        } else {
          next.add(cellKey);
        }
        return next;
      });
    },
    [attendanceData]
  );

  const handleBulkUpdate = useCallback(
    async (updates) => {
      if (!Array.isArray(updates) || updates.length === 0) return;

      try {
        setUpdatingCells(new Set(updates.map((u) => `${u.studentId}-${u.sessionId}`)));

        const updatesBySession = {};
        updates.forEach(({ studentId, sessionId, status }) => {
          if (!updatesBySession[sessionId]) {
            updatesBySession[sessionId] = [];
          }
          updatesBySession[sessionId].push({ studentId, status });
        });

        const promises = Object.entries(updatesBySession).map(([sessionId, rows]) =>
          markSessionAttendanceBulk(Number(sessionId), {
            courseId: courseId ? Number(courseId) : undefined,
            rows,
          })
        );

        await Promise.all(promises);

        setPendingChanges(new Map());

        if (onAttendanceUpdate) {
          onAttendanceUpdate();
        }

        toast.success(`${updates.length} катышуу ийгиликтүү жаңыртылды!`);
      } catch (saveError) {
        console.error('Failed to save attendance:', saveError);
        toast.error('Катышууну сактоо мүмкүн болбоду');
      } finally {
        setUpdatingCells(new Set());
      }
    },
    [courseId, onAttendanceUpdate]
  );

  const handleSave = useCallback(async () => {
    if (pendingChanges.size === 0) {
      toast('Сактоо үчүн өзгөртүүлөр жок');
      return;
    }

    const updates = Array.from(pendingChanges.values()).map(
      ({ studentId, sessionId, status }) => ({
        studentId: Number(studentId),
        sessionId: Number(sessionId),
        status,
      })
    );

    await handleBulkUpdate(updates);
  }, [pendingChanges, handleBulkUpdate]);

  const accessibility = useAccessibility({
    students,
    sessions,
    attendanceData,
    onStatusChange: handleStatusChange,
    onSelectionChange: setSelectedCells,
    onSave: handleSave,
  });

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const fullName = student.fullName || '';
        const email = student.email || '';

        if (filters.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          if (
            !fullName.toLowerCase().includes(searchLower) &&
            !email.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }

        if (filters.statusFilter !== 'all') {
          const studentStatuses = sessions.map(
            (session) => attendanceData[student.id]?.[session.id] || 'not_scheduled'
          );
          if (!studentStatuses.includes(filters.statusFilter)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  }, [students, filters, sessions, attendanceData]);

  const renderContentView = () => {
    if (loading) {
      return responsiveViewMode === 'cards' ? (
        <AttendanceCardSkeleton cardCount={5} />
      ) : (
        <AttendanceTableSkeleton rowCount={10} columnCount={sessions.length} />
      );
    }

    if (error) {
      return <AttendanceErrorState error={error} onRetry={loadData} />;
    }

    if (students.length === 0) {
      return (
        <AttendanceEmptyState
          type="students"
          title="Студенттер жок"
          subtitle="Бул группада студенттер жок же жүктөөдө ката кетти"
        />
      );
    }

    if (filteredStudents.length === 0) {
      return (
        <AttendanceEmptyState
          type="filtered"
          title="Натыйжалар жок"
          subtitle="Сиздин фильтриңизге ылайык натыйжалар табылган жок"
        />
      );
    }

    const commonProps = {
      students: filteredStudents,
      sessions,
      attendanceData,
      selectedCells,
      onStatusChange: handleStatusChange,
      onSelectionChange: setSelectedCells,
    };

    switch (responsiveViewMode) {
      case 'cards':
        return <AttendanceCardView {...commonProps} />;

      case 'virtualized':
        return <VirtualizedAttendanceTable {...commonProps} containerHeight={600} />;

      default:
        // Calculate minimum width based on content
        const minWidth = Math.max(800, 250 + (sessions.length * 120) + 100);

        return (
          <div className="w-full overflow-x-auto overflow-y-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <table className="w-full border-collapse" style={{ minWidth: `${minWidth}px` }}>
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="sticky left-0 z-20 min-w-[250px] max-w-[350px] border-r border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          selectedCells.size === students.length * sessions.length &&
                          students.length > 0 &&
                          sessions.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allCells = new Set();
                            students.forEach((student) => {
                              sessions.forEach((session) => {
                                allCells.add(`${student.id}-${session.id}`);
                              });
                            });
                            setSelectedCells(allCells);
                          } else {
                            setSelectedCells(new Set());
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-orange-500"
                      />
                      <span className="truncate">Студент</span>
                    </div>
                  </th>

                  {sessions.map((session) => (
                    <th
                      key={session.id}
                      className="min-w-[120px] max-w-[150px] border-b border-gray-200 px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-xs leading-tight">
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
                    </th>
                  ))}

                  <th className="sticky right-0 z-20 min-w-[100px] max-w-[120px] border-l border-gray-200 bg-gray-50 px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    Жыйынтык
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => {
                  const studentStats = sessions.reduce((stats, session) => {
                    const status =
                      attendanceData[student.id]?.[session.id] || 'not_scheduled';
                    stats[status] = (stats[status] || 0) + 1;
                    return stats;
                  }, {});

                  const attendedCount =
                    (studentStats.present || 0) + (studentStats.late || 0);

                  const scheduledCount =
                    (studentStats.present || 0) +
                    (studentStats.late || 0) +
                    (studentStats.absent || 0) +
                    (studentStats.excused || 0);

                  const attendanceRate =
                    scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="sticky left-0 z-10 min-w-[250px] max-w-[350px] border-r border-gray-200 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={sessions.every((session) =>
                              selectedCells.has(`${student.id}-${session.id}`)
                            )}
                            onChange={(e) => {
                              const newSelectedCells = new Set(selectedCells);
                              sessions.forEach((session) => {
                                const cellKey = `${student.id}-${session.id}`;
                                if (e.target.checked) {
                                  newSelectedCells.add(cellKey);
                                } else {
                                  newSelectedCells.delete(cellKey);
                                }
                              });
                              setSelectedCells(newSelectedCells);
                            }}
                            className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-orange-500"
                          />

                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
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
                      </td>

                      {sessions.map((session) => {
                        const cellKey = `${student.id}-${session.id}`;
                        const isSelected = selectedCells.has(cellKey);
                        const isUpdating = updatingCells.has(cellKey);

                        return (
                          <td
                            key={session.id}
                            className="min-w-[120px] max-w-[150px] border-b border-gray-100 px-2 py-3 text-center dark:border-gray-800"
                          >
                            <AttendanceCell
                              studentId={student.id}
                              studentName={student.fullName}
                              sessionId={session.id}
                              sessionTitle={session.title}
                              sessionDate={session.startsAt}
                              currentStatus={
                                attendanceData[student.id]?.[session.id] || 'not_scheduled'
                              }
                              isSelected={isSelected}
                              isUpdating={isUpdating}
                              size="compact"
                              onStatusChange={handleStatusChange}
                              onSelectionChange={setSelectedCells}
                              onKeyDown={accessibility.handleKeyDown}
                              {...accessibility.getCellAriaProps(
                                student.id,
                                session.id,
                                attendanceData[student.id]?.[session.id] || 'not_scheduled'
                              )}
                            />
                          </td>
                        );
                      })}

                      <td className="sticky right-0 z-10 min-w-[100px] max-w-[120px] border-l border-gray-200 bg-white px-3 py-3 text-center dark:border-gray-700 dark:bg-gray-900">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.round(attendanceRate)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {attendedCount}/{scheduledCount}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <EnhancedAttendanceSummary
        students={students}
        sessions={sessions}
        attendanceData={attendanceData}
        showStudentBreakdown={true}
        showSessionBreakdown={false}
      />

      <AttendanceFilters
        students={students}
        sessions={sessions}
        filters={filters}
        onFiltersChange={setFilters}
        showAdvancedFilters={true}
      />

      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${responsiveViewMode === 'table'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
          >
            Таблица
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${responsiveViewMode === 'cards'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
          >
            Карталар
          </button>
          {students.length > PERFORMANCE_THRESHOLDS.VIRTUAL_SCROLLING_THRESHOLD && (
            <button
              type="button"
              onClick={() => setViewMode('virtualized')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${responsiveViewMode === 'virtualized'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              Оптималдуу
            </button>
          )}
        </div>
      </div>

      {(selectedCells.size > 0 || pendingChanges.size > 0) && (
        <div className="sticky top-0 z-20 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {selectedCells.size > 0 && (
                <>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedCells.size} клетка тандалды
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {
                      new Set(Array.from(selectedCells).map((cell) => cell.split('-')[0])).size
                    }{' '}
                    студент •{' '}
                    {
                      new Set(Array.from(selectedCells).map((cell) => cell.split('-')[1])).size
                    }{' '}
                    сессия
                  </div>
                </>
              )}

              {pendingChanges.size > 0 && (
                <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {pendingChanges.size} өзгөртүү сакталган эмес
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {pendingChanges.size > 0 && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="dashboard-button-primary px-3 py-1 text-xs disabled:opacity-50"
                >
                  {loading ? 'Сакталууда...' : 'Сактоо'}
                </button>
              )}

              {selectedCells.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCells(new Set())}
                  className="rounded px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  Тандоону тазалоо
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {renderContentView()}

      {selectedCells.size > 0 && (
        <AttendanceBulkActions
          selectedCells={selectedCells}
          students={students}
          sessions={sessions}
          attendanceData={attendanceData}
          onBulkUpdate={handleBulkUpdate}
          loading={loading}
        />
      )}

      <AttendanceLoadingOverlay
        isVisible={loading && !students.length}
        message="Катышуу маалыматы жүктөлүүдө..."
      />

      {accessibility.announcement && (
        <div role="status" aria-live="polite" className="sr-only">
          {accessibility.announcement}
        </div>
      )}
    </div>
  );
};

RefactoredAttendanceTableView.propTypes = {
  groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  groupName: PropTypes.string,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAttendanceUpdate: PropTypes.func,
  className: PropTypes.string,
};

RefactoredAttendanceTableView.defaultProps = {
  groupName: '',
  courseId: null,
  onAttendanceUpdate: null,
  className: '',
};

export default RefactoredAttendanceTableView;