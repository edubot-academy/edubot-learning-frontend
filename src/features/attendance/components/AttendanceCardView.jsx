import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
import { ATTENDANCE_STATUS_CONFIG } from '../constants/attendanceConfig';
import {
  filterAttendanceCardStudents,
  getAttendanceCardStudentStats,
} from '../utils/attendanceCardData';
import { formatAttendanceSessionDate } from '../utils/attendanceDateData';
import {
  getAttendanceSessionTitle,
  getAttendanceStudentInitials,
} from '../utils/attendanceDisplayData';
import { getAttendanceStatusLabel } from '../utils/attendanceStatusData';
import AttendanceCell from './AttendanceCell';

/**
 * Mobile-Responsive Card View for Attendance
 * Optimized for mobile devices with touch-friendly interactions
 */
const AttendanceCardView = ({
  students = [],
  sessions = [],
  attendanceData = {},
  onStatusChange,
  loading = false,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const language = i18n.resolvedLanguage || i18n.language || undefined;

  const filteredStudents = useMemo(
    () =>
      filterAttendanceCardStudents({
        students,
        sessions,
        attendanceData,
        searchQuery,
        statusFilter,
      }),
    [students, sessions, attendanceData, searchQuery, statusFilter]
  );

  // Toggle student card expansion
  const toggleStudentExpansion = useCallback((studentId) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  const getStudentStats = useCallback(
    (student) =>
      getAttendanceCardStudentStats({
        student,
        sessions,
        attendanceData,
      }),
    [sessions, attendanceData]
  );

  const formatSessionDate = useCallback(
    (value) =>
      formatAttendanceSessionDate(value, {
        language,
        missingFallback: t('attendance.fallbacks.noDate'),
        invalidFallback: t('attendance.fallbacks.unknownDate'),
      }),
    [language, t]
  );

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`attendance-card-view ${className}`}>
      {/* Mobile Filters */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
	          <input
	            type="text"
	            value={searchQuery}
	            onChange={(e) => setSearchQuery(e.target.value)}
	            placeholder={t('attendance.filters.searchStudent')}
	            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
	          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
	            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
	          >
	            <option value="all">{t('attendance.filters.allStatuses')}</option>
	            {Object.keys(ATTENDANCE_STATUS_CONFIG).map((key) => (
	              <option key={key} value={key}>
	                {getAttendanceStatusLabel(t, key)}
	              </option>
	            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
	            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
	          >
	            {t('attendance.actions.clear')}
	          </button>
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-4 p-4">
        {filteredStudents.length === 0 ? (
	          <div className="text-center py-8">
	            <div className="text-gray-500 dark:text-gray-400">
	              {t('attendance.cardView.noStudentsFound')}
	            </div>
	          </div>
        ) : (
          filteredStudents.map(student => {
            const stats = getStudentStats(student);
            const isExpanded = expandedStudents.has(student.id);

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200"
              >
                {/* Student Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {getAttendanceStudentInitials(
                          student.fullName,
                          t('attendance.cardView.unknownStudent')
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {student.fullName}
                        </div>
                        {student.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {student.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStudentExpansion(student.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {isExpanded ? (
                        <FiChevronUp className="h-5 w-5" />
                      ) : (
                        <FiChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Student Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
	                      <span className="text-gray-600 dark:text-gray-400">{t('attendance.cardView.attendanceRate')}</span>
                      <span className={`font-medium ${stats.attendanceRate >= 75 ? 'text-green-600' : stats.attendanceRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {Math.round(stats.attendanceRate)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
	                      <span className="text-gray-600 dark:text-gray-400">{t('attendance.cardView.attended')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.present + stats.late}/{stats.present + stats.late + stats.absent + stats.excused}
                      </span>
                    </div>
                  </div>

                  {/* Quick Status Overview */}
                  <div className="flex gap-2 mt-3">
                    {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([status, config]) => {
                      const count = stats[status] || 0;
                      if (count === 0) return null;
                      
                      return (
                        <div
                          key={status}
                          className={`
                            flex items-center gap-1 px-2 py-1 rounded-full text-xs
                            ${config.bgColor} ${config.textColor}
                          `}
                        >
                          <config.icon className="h-3 w-3" />
                          {count}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Session Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-3">
                      {sessions.map(session => {
                        const currentStatus = attendanceData[student.id]?.[session.id] || 'not_scheduled';

                        return (
                          <div key={session.id} className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {getAttendanceSessionTitle(t, session, {
                                  fallbackId: session.sessionIndex,
                                })}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
	                                {formatSessionDate(session.startsAt)}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <AttendanceCell
                                studentId={student.id}
                                studentName={student.fullName}
                                sessionId={session.id}
                                sessionTitle={session.title}
                                sessionDate={session.startsAt}
                                currentStatus={currentStatus}
                                isSelected={false}
                                size="compact"
                                onStatusChange={onStatusChange}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

AttendanceCardView.propTypes = {
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
  loading: PropTypes.bool,
  className: PropTypes.string,
};

AttendanceCardView.defaultProps = {
  students: [],
  sessions: [],
  attendanceData: {},
  onStatusChange: null,
  loading: false,
  className: '',
};

export default AttendanceCardView;
