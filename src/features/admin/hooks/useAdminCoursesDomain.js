import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
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
import { isForbiddenError } from '@shared/api/error';

export const useAdminCoursesDomain = ({ requestConfirmation }) => {
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
                toast.error('Курстарды жана категорияларды жүктөөдө ката кетти');
            }
        }
    }, []);

    const handleDeleteCourse = useCallback(
        async (id) => {
            requestConfirmation({
                title: 'Курсту өчүрүү',
                message: 'Бул курсту өчүрүүгө ишенимдүүсүзбү?',
                confirmLabel: 'Өчүрүү',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCourse(id);
                        setCourses((prev) => prev.filter((course) => course.id !== id));
                        toast.success('Курс ийгиликтүү өчүрүлдү');
                    } catch {
                        toast.error('Курсту өчүрүүдө ката кетти');
                    }
                },
            });
        },
        [requestConfirmation]
    );

    const handleAddCategory = useCallback(async () => {
        if (!newCategory.trim()) return;

        try {
            const created = await createCategory({ name: newCategory.trim() });
            setCategories((prev) => [...prev, created]);
            setNewCategory('');
            toast.success('Категория ийгиликтүү кошулду');
        } catch {
            toast.error('Категория кошууда ката кетти');
        }
    }, [newCategory]);

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
                toast.success('Категория ийгиликтүү жаңыртылды');
            } catch {
                toast.error('Категорияны жаңыртууда ката кетти');
            }
        },
        [editingCategoryName]
    );

    const handleDeleteCategory = useCallback(
        async (id) => {
            requestConfirmation({
                title: 'Категорияны өчүрүү',
                message: 'Бул категорияны өчүрүүгө ишенимдүүсүзбү?',
                confirmLabel: 'Өчүрүү',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await deleteCategory(id);
                        setCategories((prev) => prev.filter((category) => category.id !== id));
                        toast.success('Категория ийгиликтүү өчүрүлдү');
                    } catch {
                        toast.error('Категорияны өчүрүүдө ката кетти');
                    }
                },
            });
        },
        [requestConfirmation]
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
