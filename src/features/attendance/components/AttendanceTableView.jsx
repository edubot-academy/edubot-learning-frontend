import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { SESSION_ATTENDANCE_STATUS } from '@shared/contracts';
import {
  EmptyState,
} from '../../../components/ui/dashboard';
import { fetchGroupRoster } from '../../courseGroups/roster';
import { fetchCourseSessions } from '../../groupSessions/api';
import { fetchSessionAttendance, markSessionAttendanceBulk } from '../api';
import AttendanceFilters from './AttendanceFilters';
import AttendanceSummary from './AttendanceSummary';

const statusConfig = {
  [SESSION_ATTENDANCE_STATUS.PRESENT]: {
    label: 'Катышты',
    icon: FiCheckCircle,
    tone: 'green',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
  },
  [SESSION_ATTENDANCE_STATUS.LATE]: {
    label: 'Кечикти',
    icon: FiClock,
    tone: 'amber',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
  },
  [SESSION_ATTENDANCE_STATUS.ABSENT]: {
    label: 'Келген жок',
    icon: FiXCircle,
    tone: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-500/30',
  },
  [SESSION_ATTENDANCE_STATUS.EXCUSED]: {
    label: 'Себептүү',
    icon: FiAlertCircle,
    tone: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
  },
  not_scheduled: {
    label: 'Күтүлүүдө',
    icon: FiClock,
    tone: 'default',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-500 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
};

const AttendanceTableView = ({
  groupId,
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
  const [updatingCells] = useState(new Set());
  const [filters, setFilters] = useState({
    searchQuery: '',
    statusFilter: 'all',
    dateRange: 'all',
    attendanceRateFilter: 'all',
    sessionFilter: 'all',
    customStartDate: '',
    customEndDate: '',
  });
  const [popupCell, setPopupCell] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(new Map()); // Track unsaved changes

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

  const handleCellClick = useCallback(
    (studentId, sessionId) => {
      const student = students.find((s) => String(s.id) === String(studentId));
      const session = sessions.find((s) => String(s.id) === String(sessionId));
      const currentStatus = attendanceData[studentId]?.[sessionId] || 'not_scheduled';

      setPopupCell({
        studentId,
        sessionId,
        student,
        session,
        currentStatus,
      });
    },
    [students, sessions, attendanceData]
  );

  const handleStatusSelect = useCallback(
    (studentId, sessionId, status) => {
      const cellKey = `${studentId}-${sessionId}`;

      // Update pending changes instead of immediately saving
      setPendingChanges(prev => {
        const newChanges = new Map(prev);
        if (status === attendanceData[studentId]?.[sessionId]) {
          // If reverting to original value, remove from pending changes
          newChanges.delete(cellKey);
        } else {
          // Add or update pending change
          newChanges.set(cellKey, { studentId, sessionId, status });
        }
        return newChanges;
      });

      // Update local display immediately for better UX
      const optimisticData = { ...attendanceData };
      if (!optimisticData[studentId]) {
        optimisticData[studentId] = {};
      }
      optimisticData[studentId][sessionId] = status;
      setAttendanceData(optimisticData);

      // Handle selection
      const newSelectedCells = new Set(selectedCells);
      if (newSelectedCells.has(cellKey)) {
        newSelectedCells.delete(cellKey);
      } else {
        newSelectedCells.add(cellKey);
      }
      setSelectedCells(newSelectedCells);

      setPopupCell(null);
    },
    [attendanceData, selectedCells]
  );

  const handleSave = useCallback(async () => {
    if (pendingChanges.size === 0) {
      toast.info('Сактоо үчүн өзгөртүүлөр жок');
      return;
    }

    try {
      setLoading(true);

      // Group changes by session for API calls
      const updatesBySession = {};
      pendingChanges.forEach(({ studentId, sessionId, status }) => {
        if (!updatesBySession[sessionId]) {
          updatesBySession[sessionId] = [];
        }
        updatesBySession[sessionId].push({ studentId, status });
      });

      // Make API calls for each session
      const promises = Object.entries(updatesBySession).map(([sessionId, rows]) =>
        markSessionAttendanceBulk(Number(sessionId), {
          courseId: courseId ? Number(courseId) : undefined,
          rows,
        })
      );

      await Promise.all(promises);

      // Clear pending changes after successful save
      setPendingChanges(new Map());

      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }

      toast.success(`${pendingChanges.size} катышуу ийгиликтүү сакталды!`);
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Катышууну сактоо мүмкүн болбоду');
    } finally {
      setLoading(false);
    }
  }, [pendingChanges, courseId, onAttendanceUpdate]);

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((student) => {
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

      if (
        filters.sessionFilter &&
        filters.sessionFilter !== 'all' &&
        filters.statusFilter !== 'all'
      ) {
        const statusForSession =
          attendanceData[student.id]?.[filters.sessionFilter] || 'not_scheduled';
        if (statusForSession !== filters.statusFilter) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '')
    );
  }, [students, filters, sessions, attendanceData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-red-600 dark:text-red-400">
          Катышуу маалыматын жүктөөдө ката кетти
        </div>
        <button onClick={loadData} className="dashboard-button-primary">
          Кайта жүктөө
        </button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title="Студенттер жок"
        subtitle="Бул группада студенттер жок же жүктөөдө ката кетти"
        icon={<FiSearch className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <AttendanceSummary
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

      {/* Sticky Selection Controls - Always visible */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {selectedCells.size > 0 && (
              <>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedCells.size} клетка тандалды
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {new Set(Array.from(selectedCells).map(cell => cell.split('-')[0])).size} студент • {new Set(Array.from(selectedCells).map(cell => cell.split('-')[1])).size} сессия
                </div>
              </>
            )}
            {pendingChanges.size > 0 && (
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {pendingChanges.size} өзгөртүү сакталган эмес
              </div>
            )}
            {selectedCells.size === 0 && pendingChanges.size === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Катышуу белгилөө үчүн клеткаларды тандаңыз
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {pendingChanges.size > 0 && (
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="dashboard-button-primary text-xs px-3 py-1 disabled:opacity-50"
              >
                {loading ? 'Сакталууда...' : 'Сактоо'}
              </button>
            )}
            {selectedCells.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCells(new Set())}
                className="text-xs px-3 py-1 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/30 rounded"
              >
                Тандоону тазалоо
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="attendance-table-container w-full max-w-full min-w-0 overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="min-w-full align-middle">
          <table
            className="attendance-table w-full border-collapse"
            style={{ minWidth: `${Math.max(800, 250 + (sessions.length * 120) + 100)}px` }}
          >
            <thead>
              <tr>
                <th className="attendance-table-sticky-corner min-w-[200px] max-w-[300px] border-r border-gray-200 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCells.size === students.length * sessions.length && students.length > 0 && sessions.length > 0}
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
                    Студент
                  </div>
                </th>

                {sessions.map((session) => (
                  <th
                    key={session.id}
                    className="min-w-[70px] max-w-[100px] px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-xs truncate">
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

                <th className="sticky right-0 z-10 border-l border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  Жыйынтык
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => {
                const studentStats = sessions.reduce((stats, session) => {
                  const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                  stats[status] = (stats[status] || 0) + 1;
                  return stats;
                }, {});

                const attendedCount =
                  (studentStats[SESSION_ATTENDANCE_STATUS.PRESENT] || 0) +
                  (studentStats[SESSION_ATTENDANCE_STATUS.LATE] || 0);

                const scheduledCount =
                  (studentStats[SESSION_ATTENDANCE_STATUS.PRESENT] || 0) +
                  (studentStats[SESSION_ATTENDANCE_STATUS.LATE] || 0) +
                  (studentStats[SESSION_ATTENDANCE_STATUS.ABSENT] || 0) +
                  (studentStats[SESSION_ATTENDANCE_STATUS.EXCUSED] || 0);

                const attendanceRate =
                  scheduledCount > 0 ? (attendedCount / scheduledCount) * 100 : 0;

                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sessions.every(session => selectedCells.has(`${student.id}-${session.id}`))}
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
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-orange-500"
                        />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {(student.fullName || 'Unknown')
                            .split(' ')
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
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
                      const status = attendanceData[student.id]?.[session.id] || 'not_scheduled';
                      const cellKey = `${student.id}-${session.id}`;
                      const isSelected = selectedCells.has(cellKey);
                      const isUpdating = updatingCells.has(cellKey);
                      const config = statusConfig[status] || statusConfig.not_scheduled;
                      const Icon = config.icon;

                      const sessionDate = session.startsAt ? new Date(session.startsAt) : null;
                      const now = new Date();
                      const isSessionIncomplete =
                        sessionDate && !Number.isNaN(sessionDate.getTime())
                          ? sessionDate > now
                          : false;

                      return (
                        <td
                          key={session.id}
                          className={`attendance-cell p-2 text-center transition-colors ${isSessionIncomplete
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                            } ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20' : ''} ${isUpdating ? 'opacity-50' : ''
                            }`}
                          onClick={() =>
                            !isUpdating &&
                            !isSessionIncomplete &&
                            handleCellClick(student.id, session.id)
                          }
                          role={isSessionIncomplete ? 'presentation' : 'button'}
                          tabIndex={isSessionIncomplete ? -1 : 0}
                          aria-label={`Change attendance for ${student.fullName} in ${session.title || `Session ${session.sessionIndex}`
                            }`}
                        >
                          <div
                            className={`attendance-status inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-200 ${config.bgColor} ${config.textColor} ${config.borderColor} ${isSessionIncomplete ? 'grayscale' : ''
                              }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                        </td>
                      );
                    })}

                    <td className="sticky right-0 z-10 border-l border-gray-200 bg-white px-4 py-3 text-center dark:border-gray-700 dark:bg-gray-900">
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

        {popupCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Катышуу статусун тандаңыз
                </h3>
                <button
                  type="button"
                  onClick={() => setPopupCell(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{popupCell.student?.fullName}</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {popupCell.session?.title || `Сессия ${popupCell.session?.sessionIndex}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        handleStatusSelect(popupCell.studentId, popupCell.sessionId, status)
                      }
                      className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-colors ${popupCell.currentStatus === status
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                    >
                      <Icon className={`mb-1 h-6 w-6 ${config.textColor}`} />
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AttendanceTableView.propTypes = {
  groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  groupName: PropTypes.string,
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAttendanceUpdate: PropTypes.func,
  className: PropTypes.string,
};

export default AttendanceTableView;
