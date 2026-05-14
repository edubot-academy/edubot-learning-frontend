import { useMemo } from 'react';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../utils/studentDashboard.constants.js';
import {
    isOfflineOrLiveCourse,
    readNumber,
} from '../utils/studentDashboard.helpers.js';

export const useStudentDashboardViewModel = ({
    accessLoaded,
    accessState,
    accessStateError,
    certificates,
    courses,
    filterCourseId,
    notificationSettings,
    offerings,
    profileData,
    progress,
    summary,
    user,
}) => {
    const groupOptions = useMemo(() => {
        const groups = [];
        offerings.forEach((item) => {
            const groupId = item.groupId || item.group?.id;
            if (!groupId) return;
            const groupName = item.groupName || item.group?.name || `Group #${groupId}`;
            if (!groups.some((g) => String(g.id) === String(groupId))) {
                groups.push({ id: String(groupId), name: groupName });
            }
        });
        return groups;
    }, [offerings]);

    const hasAttendanceEligibleCourses = useMemo(() => {
        if (filterCourseId) {
            const selected = courses.find((course) => String(course.id) === String(filterCourseId));
            return isOfflineOrLiveCourse(selected);
        }
        return courses.some((course) => isOfflineOrLiveCourse(course));
    }, [courses, filterCourseId]);

    const overviewStudent = useMemo(
        () => ({
            id: user?.id || null,
            name: summary?.name || user?.fullName || 'Студент',
            lastLesson: summary?.lastLesson || null,
        }),
        [summary, user]
    );

    const overviewStats = useMemo(
        () =>
            summary?.stats || {
                activeCourses: 0,
                lessonsCompleted: 0,
                timeThisWeek: '—',
                pendingTasks: 0,
            },
        [summary]
    );

    const attendanceStats = useMemo(() => {
        if (!hasAttendanceEligibleCourses) {
            return { rate: 0, totalSessions: 0, present: 0, absent: 0 };
        }

        const rawRate = readNumber(summary, [
            'attendance.rate',
            'stats.attendanceRate',
            'attendanceRate',
            'attendance.percent',
        ]);
        const rawTotalSessions = readNumber(summary, [
            'attendance.totalSessions',
            'stats.totalSessions',
        ]);
        const rawPresent = readNumber(summary, [
            'attendance.present',
            'stats.attendedSessions',
        ]);
        const rawAbsent = readNumber(summary, ['attendance.absent', 'stats.absentSessions']);

        if (rawRate === null && rawTotalSessions === null && rawPresent === null && rawAbsent === null) {
            return { rate: 0, totalSessions: 0, present: 0, absent: 0 };
        }

        const rate = rawRate !== null ? Math.round(rawRate) : null;
        const totalSessions = rawTotalSessions ?? Math.max(0, (rawPresent || 0) + (rawAbsent || 0));
        const present = rawPresent ?? (
            rate !== null && totalSessions > 0 ? Math.round((totalSessions * rate) / 100) : 0
        );
        const absent = rawAbsent ?? Math.max(0, totalSessions - present);

        return {
            rate: rate ?? (totalSessions ? Math.round((present / totalSessions) * 100) : 0),
            totalSessions,
            present,
            absent,
        };
    }, [summary, hasAttendanceEligibleCourses]);

    const attendanceEnabled = useMemo(() => {
        if (!hasAttendanceEligibleCourses) return false;

        return [
            'attendance.rate',
            'stats.attendanceRate',
            'attendanceRate',
            'attendance.percent',
            'attendance.totalSessions',
            'stats.totalSessions',
            'attendance.present',
            'stats.attendedSessions',
            'attendance.absent',
            'stats.absentSessions',
        ].some((path) => readNumber(summary, path) !== null);
    }, [summary, hasAttendanceEligibleCourses]);

    const hasActiveStudentAccess = useMemo(() => {
        if (typeof accessState?.hasActiveAccess === 'boolean') {
            return accessState.hasActiveAccess;
        }

        if (accessStateError) return true;
        if (!accessLoaded) return true;

        if (Number(summary?.stats?.upcomingSessions || 0) > 0) return true;
        if (Number(summary?.stats?.availableRecordings || 0) > 0) return true;
        if (Number(summary?.stats?.homeworkOpen || 0) > 0) return true;
        if (Number(overviewStats.activeCourses || 0) > 0) return true;
        return false;
    }, [accessLoaded, accessState, accessStateError, summary, overviewStats.activeCourses]);

    const accessStateDetails = useMemo(() => {
        if (accessStateError) {
            return {
                state: 'unknown',
                title: 'Окуу мүмкүнчүлүгүн текшерүү мүмкүн болбоду',
                description: 'Курстар же сабактар көрүнбөй калса, баракты жаңыртып көрүңүз же колдоо кызматына кайрылыңыз.',
            };
        }

        if (!accessLoaded) {
            return {
                state: 'unloaded',
                title: 'Окуу мүмкүнчүлүгү текшерилип жатат',
                description: 'Курстар, сабактар жана прогресс жүктөлгөндөн кийин жеткиликтүүлүк так көрсөтүлөт.',
            };
        }

        if (!hasActiveStudentAccess) {
            return {
                state: 'gated',
                title: 'Окуу мүмкүнчүлүгү азырынча активдүү эмес',
                description: 'Сизде активдүү курс же пландагы сабак жок. Төлөм ырасталгандан же каттоо иштетилгенден кийин окуу материалдары ачылат.',
            };
        }

        return {
            state: 'active',
            title: 'Окуу мүмкүнчүлүгү активдүү',
            description: 'Активдүү курстарыңыз жана окуу материалдарыңыз жеткиликтүү.',
        };
    }, [accessLoaded, accessStateError, hasActiveStudentAccess]);

    const offeringsByCourse = useMemo(() => {
        const map = new Map();
        offerings.forEach((offering) => {
            const key = String(
                offering.courseId || offering.course?.id || offering.course?.courseId || ''
            );
            if (!key) return;
            const current = map.get(key) || [];
            current.push(offering);
            map.set(key, current);
        });
        return map;
    }, [offerings]);

    const progressItems = useMemo(() => {
        return (progress || []).map((item) => {
            const lessonsArray = Array.isArray(item.lessons) ? item.lessons : [];
            const sectionsMap = new Map();
            lessonsArray.forEach((lesson) => {
                const sectionKey =
                    lesson.sectionId ?? `section-${lesson.sectionTitle || 'unknown'}`;
                if (!sectionsMap.has(sectionKey)) {
                    sectionsMap.set(sectionKey, {
                        sectionId: lesson.sectionId,
                        sectionTitle: lesson.sectionTitle || 'Секция',
                        sectionOrder: lesson.sectionOrder ?? 0,
                        lessons: [],
                    });
                }
                sectionsMap.get(sectionKey).lessons.push(lesson);
            });
            const sections = Array.from(sectionsMap.values())
                .map((section) => ({
                    ...section,
                    lessons: section.lessons
                        .slice()
                        .sort(
                            (a, b) =>
                                (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0) ||
                                String(a.lessonTitle || '').localeCompare(b.lessonTitle || '')
                        ),
                }))
                .sort(
                    (a, b) =>
                        (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0) ||
                        String(a.sectionTitle || '').localeCompare(b.sectionTitle || '')
                );
            const totalLessons =
                item.lessonsTotal ?? (lessonsArray.length ? lessonsArray.length : 0);
            const completedLessons = item.lessonsCompleted ?? 0;
            const progressPercent =
                totalLessons > 0
                    ? Math.min(100, Math.round((completedLessons * 100) / totalLessons))
                    : 0;
            const flatOrderedLessons = sections.flatMap((section) => section.lessons);
            const resumeLesson =
                item.lastViewedLesson && item.lastViewedLesson.lessonId
                    ? item.lastViewedLesson
                    : flatOrderedLessons.find((lesson) => !lesson.completed) ||
                    flatOrderedLessons[0];
            const certificate =
                item.certificate ||
                certificates.find(
                    (cert) => cert.courseId === item.courseId || cert.course === item.course
                ) ||
                null;
            const hasCertificate =
                certificate?.status === 'issued' ||
                certificates.some(
                    (cert) =>
                        (cert.courseId === item.courseId || cert.course === item.course) &&
                        cert.status === 'issued'
                );
            return {
                courseId: item.courseId,
                courseTitle: item.courseTitle || item.course || 'Course',
                lessonsCompleted: completedLessons,
                lessonsTotal: totalLessons,
                progressPercent,
                sections: sections.map((section) => ({
                    ...section,
                    lessons: section.lessons.map((lesson) => ({
                        ...lesson,
                        kind: lesson.kind || 'video',
                    })),
                })),
                resumeLesson,
                hasCertificate,
                certificateStatus: certificate?.status || null,
                certificateIssuedAt: certificate?.issuedAt || null,
                certificateDownloadUrl: certificate?.downloadUrl || null,
                certificateVerificationUrl: certificate?.verificationUrl || null,
            };
        });
    }, [progress, certificates]);

    const mergedNotificationSettings = useMemo(
        () => ({
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(notificationSettings || {}),
        }),
        [notificationSettings]
    );

    const profileStudent = useMemo(
        () => ({
            name: profileData?.fullName || user?.fullName || overviewStudent.name,
            email: profileData?.email || user?.email || '',
            phone: profileData?.phoneNumber || user?.phoneNumber || '',
            avatar: profileData?.avatar || user?.avatar || '',
        }),
        [overviewStudent.name, profileData, user]
    );

    return {
        attendanceEnabled,
        attendanceStats,
        accessStateDetails,
        groupOptions,
        hasActiveStudentAccess,
        hasAttendanceEligibleCourses,
        mergedNotificationSettings,
        offeringsByCourse,
        overviewStats,
        overviewStudent,
        profileStudent,
        progressItems,
    };
};
