import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  BrandCard, 
  BrandButton, 
  BrandProgressRing, 
  BrandStatCard,
  BrandSparklineChart 
} from '../ui/brand';
import { 
  FiCalendar, 
  FiUsers, 
  FiVideo, 
  FiClock, 
  FiMapPin,
  FiPlay,
  FiEdit,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { cn, formatDate, formatTime, formatRelativeTime } from '../../lib/utils';

/**
 * Enhanced Session Timeline Component
 * Features timeline view, live indicators, and brand styling
 */
const SessionTimeline = ({
  sessions = [],
  courses = [],
  groups = [],
  onCreateSession,
  onEditSession,
  onDeleteSession,
  onStartSession,
  onViewSession,
  loading = false,
  className,
  ...props
}) => {
  const [viewMode, setViewMode] = useState('timeline'); // timeline, list, calendar
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // today, week, month, all

  // Filter sessions based on selections
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    if (selectedCourse) {
      filtered = filtered.filter(session => session.courseId === selectedCourse);
    }

    if (selectedGroup) {
      filtered = filtered.filter(session => session.groupId === selectedGroup);
    }

    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= today && sessionDate <= weekEnd;
          });
          break;
        case 'month':
          const monthEnd = new Date(today);
          monthEnd.setMonth(today.getMonth() + 1);
          filtered = filtered.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= today && sessionDate <= monthEnd;
          });
          break;
      }
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sessions, selectedCourse, selectedGroup, dateFilter]);

  // Group sessions by date for timeline view
  const sessionsByDate = useMemo(() => {
    const grouped = {};
    
    filteredSessions.forEach(session => {
      const date = new Date(session.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  }, [filteredSessions]);

  const getSessionStatus = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const sessionEnd = new Date(session.date);
    sessionEnd.setHours(sessionEnd.getHours() + (session.duration || 1));

    if (session.isLive) return 'live';
    if (sessionDate > now) return 'upcoming';
    if (sessionEnd > now) return 'in-progress';
    return 'completed';
  };

  const getStatusColor = (status) => {
    const colors = {
      live: 'text-brand-success bg-brand-success/10',
      'in-progress': 'text-brand-primary-orange bg-brand-primary-orange/10',
      upcoming: 'text-blue-600 bg-blue-50',
      completed: 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    };
    return colors[status] || colors.completed;
  };

  const getStatusIcon = (status) => {
    const icons = {
      live: <FiPlay className="w-3 h-3" />,
      'in-progress': <FiPlay className="w-3 h-3" />,
      upcoming: <FiClock className="w-3 h-3" />,
      completed: <FiEye className="w-3 h-3" />
    };
    return icons[status] || icons.completed;
  };

  const SessionCard = ({ session, isCompact = false }) => {
    const status = getSessionStatus(session);
    const statusClasses = getStatusColor(status);

    if (isCompact) {
      return (
        <BrandCard 
          variant="glass" 
          hover={true}
          className="p-4 cursor-pointer group"
          onClick={() => onViewSession?.(session)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(session.date).toLocaleDateString('ky-KG', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(session.date).getDate()}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-primary-orange transition-colors">
                  {session.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatTime(session.date)}</span>
                  <span>•</span>
                  <span>{session.courseTitle}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", statusClasses)}>
                {getStatusIcon(status)}
                {status === 'live' ? 'Тиркеп' : status === 'in-progress' ? 'Жүрүп жатат' : status === 'upcoming' ? 'Күтүлөт' : 'Бүткөн'}
              </span>
            </div>
          </div>
        </BrandCard>
      );
    }

    return (
      <BrandCard 
        variant="elevated" 
        hover={true}
        className="group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary-orange transition-colors">
                {session.title}
              </h3>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", statusClasses)}>
                {getStatusIcon(status)}
                {status === 'live' ? 'Тиркеп' : status === 'in-progress' ? 'Жүрүп жатат' : status === 'upcoming' ? 'Күтүлөт' : 'Бүткөн'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(session.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                <span>{formatTime(session.date)} ({session.duration || 1} саат)</span>
              </div>
              <div className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" />
                <span>{session.location || 'Online'}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {status === 'upcoming' && (
              <BrandButton 
                size="sm" 
                variant="success"
                onClick={() => onStartSession?.(session)}
              >
                <FiPlay className="w-3 h-3" />
              </BrandButton>
            )}
            
            <BrandButton 
              size="sm" 
              variant="ghost"
              onClick={() => onEditSession?.(session)}
            >
              <FiEdit className="w-3 h-3" />
            </BrandButton>
            
            <BrandButton 
              size="sm" 
              variant="danger"
              onClick={() => onDeleteSession?.(session)}
            >
              <FiTrash2 className="w-3 h-3" />
            </BrandButton>
          </div>
        </div>

        {/* Session details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary-orange/10 rounded-lg flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-brand-primary-orange" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Катышуучулар</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {session.attendeeCount || 0}/{session.totalStudents || 0}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-success/10 rounded-lg flex items-center justify-center">
              <FiVideo className="w-4 h-4 text-brand-success" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Курс</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {session.courseTitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BrandProgressRing 
              value={session.attendanceRate || 0}
              max={100}
              size={60}
              color="orange"
              showPercentage={true}
            />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Катышуу</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {session.attendanceRate || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Engagement metrics */}
        {session.engagementData && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Активдүүлүк</span>
              <BrandSparklineChart 
                data={session.engagementData}
                color="orange"
                width={120}
                height={30}
              />
            </div>
          </div>
        )}
      </BrandCard>
    );
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Header with filters and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Сессиялар
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Course filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary-orange/50"
          >
            <option value="">Бардык курстар</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title || course.name}
              </option>
            ))}
          </select>

          {/* Group filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary-orange/50"
          >
            <option value="">Бардык группалар</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name || group.code}
              </option>
            ))}
          </select>

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary-orange/50"
          >
            <option value="">Бардык убакыт</option>
            <option value="today">Бүгүн</option>
            <option value="week">Бул апта</option>
            <option value="month">Бул ай</option>
          </select>

          {/* Create session button */}
          <BrandButton 
            onClick={onCreateSession}
            leftIcon={<FiCalendar className="w-4 h-4" />}
          >
            Жаңы сессия
          </BrandButton>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BrandStatCard
          label="Жалпы сессиялар"
          value={filteredSessions.length}
          color="orange"
          icon={<FiCalendar className="w-5 h-5" />}
        />
        <BrandStatCard
          label="Тиркеп сессиялар"
          value={filteredSessions.filter(s => getSessionStatus(s) === 'live').length}
          color="green"
          icon={<FiPlay className="w-5 h-5" />}
        />
        <BrandStatCard
          label="Бүгүнкө сессиялар"
          value={filteredSessions.filter(s => getSessionStatus(s) === 'today').length}
          color="blue"
          icon={<FiClock className="w-5 h-5" />}
        />
        <BrandStatCard
          label="Орточо катышуу"
          value={`${Math.round(filteredSessions.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / filteredSessions.length) || 0}%`}
          color="purple"
          icon={<FiUsers className="w-5 h-5" />}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-brand-primary-orange/30 border-t-brand-primary-orange rounded-full" />
        </div>
      )}

      {/* Sessions content */}
      {!loading && (
        <>
          {filteredSessions.length === 0 ? (
            <BrandCard className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <FiCalendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Сессиялар табылган жок</p>
                <p className="text-sm">Биринчи сессияны түзүңүз</p>
                <BrandButton 
                  className="mt-4"
                  onClick={onCreateSession}
                  leftIcon={<FiCalendar className="w-4 h-4" />}
                >
                  Сессия түзүү
                </BrandButton>
              </div>
            </BrandCard>
          ) : (
            <>
              {viewMode === 'timeline' ? (
                <div className="space-y-6">
                  {Object.entries(sessionsByDate).map(([date, daySessions]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">
                          {formatDate(date)}
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      </div>
                      
                      <div className="space-y-3">
                        {daySessions.map(session => (
                          <SessionCard 
                            key={session.id} 
                            session={session} 
                            isCompact={true}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map(session => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

SessionTimeline.propTypes = {
  sessions: PropTypes.arrayOf(PropTypes.object),
  courses: PropTypes.arrayOf(PropTypes.object),
  groups: PropTypes.arrayOf(PropTypes.object),
  onCreateSession: PropTypes.func,
  onEditSession: PropTypes.func,
  onDeleteSession: PropTypes.func,
  onStartSession: PropTypes.func,
  onViewSession: PropTypes.func,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default SessionTimeline;
