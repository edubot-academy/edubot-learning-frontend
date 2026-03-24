import { Link } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import PropTypes from 'prop-types';
import StudentStatCard from '../shared/StudentStatCard.jsx';

const ProgressTab = ({
    items,
    attendanceStats,
    attendanceEnabled,
    engagement,
    leaderboardItems,
    milestoneItems,
    badgeItems,
}) => {
    const formatTime = (seconds) => {
        if (seconds === null || seconds === undefined) return null;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60)
            .toString()
            .padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (!items.length) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                    Прогресс жана сертификаттар
                </h2>
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                    Азырынча катталган курстар жок.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#E8ECF3]">
                Прогресс жана сертификаттар
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <StudentStatCard label="XP" value={engagement.xp} />
                <StudentStatCard label="Окуу сериясы" value={`${engagement.streak} күн`} />
                {attendanceEnabled ? (
                    <StudentStatCard label="Катышуу" value={`${attendanceStats.rate}%`} />
                ) : null}
                <StudentStatCard
                    label="Рейтинг"
                    value={leaderboardItems.length ? `Top ${leaderboardItems.length}` : 'Tracked'}
                />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <div className="xl:col-span-2 bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Курстагы этаптар
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                        {milestoneItems.map((item) => (
                            <div key={item.id || item.title}>
                                <p className="font-medium text-gray-900 dark:text-[#E8ECF3]">
                                    {item.title}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">{item.value || item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                        Жетишкендик белгилери
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {badgeItems.map((badge) => (
                            <span
                                key={badge.id || badge.title}
                                className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            >
                                {badge.title || badge.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.courseId || item.courseTitle}
                        className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-4"
                    >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                    {item.courseTitle}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Сабактар: {item.lessonsCompleted}/{item.lessonsTotal || '—'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {item.progressPercent}%
                                </span>
                                {item.resumeLesson ? (
                                    <Link
                                        to={
                                            item.courseId
                                                ? `/courses/${item.courseId}?resumeLessonId=${item.resumeLesson.lessonId || ''
                                                }${item.resumeLesson.lastVideoTime
                                                    ? `&resumeTime=${Math.floor(
                                                        item.resumeLesson.lastVideoTime
                                                    )}`
                                                    : ''
                                                }`
                                                : '#'
                                        }
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30"
                                    >
                                        <FiPlay className="shrink-0" />
                                        Улантуу: {item.resumeLesson.lessonTitle}
                                        {item.resumeLesson.lastVideoTime
                                            ? ` (${formatTime(item.resumeLesson.lastVideoTime)})`
                                            : ''}
                                    </Link>
                                ) : null}
                                {item.hasCertificate ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        Сертификат даяр
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                            <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{
                                    width: `${Math.min(100, Math.max(0, item.progressPercent))}%`,
                                }}
                            />
                        </div>

                        {item.sections.length ? (
                            <div className="space-y-3">
                                {item.sections.map((section) => (
                                    <div
                                        key={section.sectionId || section.sectionTitle}
                                        className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-gray-900 dark:text-[#E8ECF3]">
                                                {section.sectionTitle}
                                            </p>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {section.lessons.filter((l) => l.completed).length}/
                                                {section.lessons.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {section.lessons.map((lesson) => {
                                                const isQuiz = lesson.kind === 'quiz';
                                                const quizBadge = isQuiz
                                                    ? lesson.quizPassed === true
                                                        ? {
                                                            label: 'Квиз өттү',
                                                            className:
                                                                'bg-green-100 text-green-700',
                                                        }
                                                        : lesson.quizPassed === false
                                                            ? {
                                                                label: 'Квиз өтпөдү',
                                                                className:
                                                                    'bg-red-100 text-red-700',
                                                            }
                                                            : null
                                                    : null;
                                                return (
                                                    <div
                                                        key={lesson.lessonId || lesson.lessonTitle}
                                                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-800/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${lesson.completed
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400'
                                                                    }`}
                                                            >
                                                                {lesson.completed ? '✓' : ''}
                                                            </span>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm text-gray-800 dark:text-[#E8ECF3]">
                                                                        {lesson.lessonTitle}
                                                                    </p>
                                                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase">
                                                                        {lesson.kind === 'quiz'
                                                                            ? 'Квиз'
                                                                            : lesson.kind ===
                                                                                'article'
                                                                                ? 'Макала'
                                                                                : lesson.kind ===
                                                                                    'code'
                                                                                    ? 'Код'
                                                                                    : 'Видео'}
                                                                    </span>
                                                                    {quizBadge ? (
                                                                        <span
                                                                            className={`text-[11px] px-2 py-0.5 rounded-full ${quizBadge.className}`}
                                                                        >
                                                                            {quizBadge.label}
                                                                            {typeof lesson.quizScore ===
                                                                                'number'
                                                                                ? ` (${lesson.quizScore}%)`
                                                                                : ''}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                                {!lesson.completed &&
                                                                    lesson.lastVideoTime ? (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Акыркы убакыт:{' '}
                                                                        {formatTime(
                                                                            lesson.lastVideoTime
                                                                        )}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Бул курс боюнча сабактар табылган жок.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

ProgressTab.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    attendanceStats: PropTypes.shape({
        rate: PropTypes.number,
    }).isRequired,
    attendanceEnabled: PropTypes.bool.isRequired,
    engagement: PropTypes.shape({
        xp: PropTypes.number,
        streak: PropTypes.number,
    }).isRequired,
    leaderboardItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    milestoneItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    badgeItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ProgressTab;
