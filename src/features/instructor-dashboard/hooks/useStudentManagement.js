import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    fetchInstructorStudentCourses,
    fetchCourseStudents,
} from '@services/api';
import { parseApiError } from '@shared/api/error';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

export const useStudentManagement = (user) => {
    const { t } = useTranslation();
    const [studentCourses, setStudentCourses] = useState([]);
    const [studentCoursesTotal, setStudentCoursesTotal] = useState(null);
    const [loadingStudentCourses, setLoadingStudentCourses] = useState(false);
    const [selectedStudentCourseId, setSelectedStudentCourseId] = useState(null);
    const [courseStudents, setCourseStudents] = useState([]);
    const [courseStudentsMeta, setCourseStudentsMeta] = useState(null);
    const [loadingCourseStudents, setLoadingCourseStudents] = useState(false);
    const [studentsPage, setStudentsPage] = useState(1);
    const [studentSearch, setStudentSearch] = useState('');
    const [progressMin, setProgressMin] = useState('');
    const [progressMax, setProgressMax] = useState('');
    const [studentsError, setStudentsError] = useState('');

    const loadStudentCourses = useCallback(async () => {
        if (!user?.id || user.role !== 'instructor') return;

        setLoadingStudentCourses(true);
        setStudentsError('');

        try {
            const data = await fetchInstructorStudentCourses();
            const list = toArray(data?.courses || data);

            setStudentCourses(list);
            setStudentCoursesTotal(
                typeof data?.total === 'number'
                    ? data.total
                    : list.reduce((acc, course) => acc + (course.studentCount || 0), 0)
            );

            setSelectedStudentCourseId((prev) => {
                if (!list.length) return null;
                const exists = list.some((course) => course.id === prev);
                return exists ? prev : null;
            });

            if (!list.length) {
                setCourseStudents([]);
                setCourseStudentsMeta(null);
            }
        } catch (error) {
            console.error('Failed to load student courses', error);
            if (error?.response?.status === 403) {
                setStudentsError(t('instructorDashboard.data.errors.courseForbidden'));
            } else {
                toast.error(parseApiError(error, t('instructorDashboard.data.toasts.studentCoursesLoadError')).message);
            }
        } finally {
            setLoadingStudentCourses(false);
        }
    }, [t, user]);

    const loadCourseStudents = useCallback(
        async (courseId) => {
            if (!courseId) {
                setCourseStudents([]);
                setCourseStudentsMeta(null);
                return;
            }

            setLoadingCourseStudents(true);
            setStudentsError('');

            try {
                const data = await fetchCourseStudents(courseId, {
                    page: studentsPage,
                    limit: 20,
                    q: studentSearch || undefined,
                    progressGte: progressMin === '' ? undefined : Number(progressMin),
                    progressLte: progressMax === '' ? undefined : Number(progressMax),
                });

                setCourseStudents(toArray(data?.students || data));
                setCourseStudentsMeta({
                    ...(data?.course || {}),
                    page: data?.page,
                    total: data?.total,
                    totalPages: data?.totalPages,
                    limit: data?.limit,
                });
            } catch (error) {
                console.error('Failed to load course students', error);
                setCourseStudents([]);
                setCourseStudentsMeta(null);

                if (error?.response?.status === 403) {
                    setStudentsError(t('instructorDashboard.data.errors.courseForbidden'));
                } else {
                    toast.error(parseApiError(error, t('instructorDashboard.data.toasts.courseStudentsLoadError')).message);
                }
            } finally {
                setLoadingCourseStudents(false);
            }
        },
        [progressMax, progressMin, studentSearch, studentsPage, t]
    );

    const handleSelectStudentCourse = useCallback((courseId) => {
        setStudentsPage(1);
        setSelectedStudentCourseId(courseId);
    }, []);

    const selectedCourse = useMemo(
        () => studentCourses.find((course) => course.id === selectedStudentCourseId),
        [studentCourses, selectedStudentCourseId]
    );

    return {
        // State
        studentCourses,
        studentCoursesTotal,
        loadingStudentCourses,
        selectedStudentCourseId,
        courseStudents,
        courseStudentsMeta,
        loadingCourseStudents,
        studentsPage,
        studentSearch,
        progressMin,
        progressMax,
        studentsError,
        selectedCourse,

        // Actions
        setStudentsPage,
        setStudentSearch,
        setProgressMin,
        setProgressMax,
        loadStudentCourses,
        loadCourseStudents,
        handleSelectStudentCourse,
    };
};
