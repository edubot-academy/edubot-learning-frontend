import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    createCategory,
    deleteCategory,
    deleteCourse,
    fetchCategories,
    fetchCourseGroups,
    fetchCourses,
    updateCategory,
} from '@services/api';
import { normalizeEnrollmentCourseType } from '@features/enrollments/policy';
import { isForbiddenError, parseApiError } from '@shared/api/error';

export const useAdminCoursesDomain = ({ requestConfirmation }) => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [courseGroupsByCourseId, setCourseGroupsByCourseId] = useState({});
    const [selectedEnrollmentGroupIds, setSelectedEnrollmentGroupIds] = useState({});

    const loadCoursesAndCategories = useCallback(async () => {
        try {
            const [coursesRes, categoriesRes] = await Promise.all([
                fetchCourses(),
                fetchCategories(),
            ]);
            const loadedCourses = coursesRes?.courses || [];
            setCourses(loadedCourses);
            setCategories(categoriesRes || []);

            const deliveryCourses = loadedCourses.filter((course) =>
                ['offline', 'online_live'].includes(
                    normalizeEnrollmentCourseType(course?.courseType || course?.type)
                )
            );

            if (!deliveryCourses.length) {
                setCourseGroupsByCourseId({});
                return;
            }

            const groupEntries = await Promise.all(
                deliveryCourses.map(async (course) => {
                    try {
                        const response = await fetchCourseGroups({ courseId: Number(course.id) });
                        const items = Array.isArray(response)
                            ? response
                            : Array.isArray(response?.items)
                              ? response.items
                              : Array.isArray(response?.data)
                                ? response.data
                                : [];
                        return [String(course.id), items];
                    } catch (error) {
                        console.error('Failed to load groups for admin course', course.id, error);
                        return [String(course.id), []];
                    }
                })
            );

            setCourseGroupsByCourseId(Object.fromEntries(groupEntries));
        } catch (error) {
            if (!isForbiddenError(error)) {
                toast.error(parseApiError(error, t('adminCourses.toasts.loadError')).message);
            }
        }
    }, [t]);

    const handleDeleteCourse = useCallback(
        async (targetCourse) => {
            const id = typeof targetCourse === 'object' ? targetCourse.id : targetCourse;
            const courseLabel =
                typeof targetCourse === 'object'
                    ? targetCourse.title || t('adminCourses.fallback.course', { id })
                    : t('adminCourses.fallback.course', { id });

            requestConfirmation({
                title: t('adminCourses.confirm.deleteCourseTitle'),
                message: t('adminCourses.confirm.deleteCourseMessage', { title: courseLabel }),
                confirmLabel: t('adminCourses.actions.delete'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCourse(id);
                        setCourses((prev) => prev.filter((course) => course.id !== id));
                        toast.success(t('adminCourses.toasts.courseDeleted'));
                    } catch (error) {
                        toast.error(
                            parseApiError(error, t('adminCourses.toasts.courseDeleteError')).message
                        );
                    }
                },
            });
        },
        [requestConfirmation, t]
    );

    const handleAddCategory = useCallback(async () => {
        if (!newCategory.trim()) return;

        try {
            const created = await createCategory({ name: newCategory.trim() });
            setCategories((prev) => [...prev, created]);
            setNewCategory('');
            toast.success(t('adminCourses.toasts.categoryCreated'));
        } catch (error) {
            toast.error(parseApiError(error, t('adminCourses.toasts.categoryCreateError')).message);
        }
    }, [newCategory, t]);

    const handleUpdateCategory = useCallback(
        async (id) => {
            if (!editingCategoryName.trim()) return;

            try {
                await updateCategory(id, { name: editingCategoryName.trim() });
                setCategories((prev) =>
                    prev.map((category) =>
                        category.id === id
                            ? { ...category, name: editingCategoryName.trim() }
                            : category
                    )
                );
                setEditingCategoryId(null);
                setEditingCategoryName('');
                toast.success(t('adminCourses.toasts.categoryUpdated'));
            } catch (error) {
                toast.error(parseApiError(error, t('adminCourses.toasts.categoryUpdateError')).message);
            }
        },
        [editingCategoryName, t]
    );

    const handleDeleteCategory = useCallback(
        async (targetCategory) => {
            const id = typeof targetCategory === 'object' ? targetCategory.id : targetCategory;
            const categoryLabel =
                typeof targetCategory === 'object'
                    ? targetCategory.name || t('adminCourses.fallback.category', { id })
                    : t('adminCourses.fallback.category', { id });

            requestConfirmation({
                title: t('adminCourses.confirm.deleteCategoryTitle'),
                message: t('adminCourses.confirm.deleteCategoryMessage', { name: categoryLabel }),
                confirmLabel: t('adminCourses.actions.delete'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCategory(id);
                        setCategories((prev) => prev.filter((category) => category.id !== id));
                        toast.success(t('adminCourses.toasts.categoryDeleted'));
                    } catch (error) {
                        toast.error(
                            parseApiError(error, t('adminCourses.toasts.categoryDeleteError')).message
                        );
                    }
                },
            });
        },
        [requestConfirmation, t]
    );

    return {
        categories,
        courseGroupsByCourseId,
        courses,
        editingCategoryId,
        editingCategoryName,
        handleAddCategory,
        handleDeleteCategory,
        handleDeleteCourse,
        handleUpdateCategory,
        loadCoursesAndCategories,
        newCategory,
        selectedEnrollmentGroupIds,
        setEditingCategoryId,
        setEditingCategoryName,
        setNewCategory,
        setSelectedEnrollmentGroupIds,
    };
};
