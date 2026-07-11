import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '@features/categories/api';
import {
    createCourse,
    markCoursePending,
    updateCourse,
} from '@features/courses/api';
import { parseApiError } from '@shared/api/error';
import { toArray } from '@shared/api/response';

const DEFAULT_DELIVERY_COURSE = {
    courseType: 'offline',
    title: '',
    description: '',
    categoryId: '',
    price: '',
    languageCode: 'ky',
};

const buildDeliveryCoursePayload = (payload) => ({
    title: payload.title,
    description: payload.description,
    categoryId: parseInt(payload.categoryId, 10),
    price: Number(payload.price || 0),
    languageCode: payload.languageCode || 'ky',
    courseType: payload.courseType,
    isPaid: Number(payload.price || 0) > 0,
});

const isMissingRequiredFields = (payload) =>
    !payload?.title || !payload?.description || !payload?.categoryId;

export const useDeliveryCourse = ({
    onCreated,
    onUpdated,
    onSubmittedForApproval,
} = {}) => {
    const { t } = useTranslation();
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [creatingDeliveryCourse, setCreatingDeliveryCourse] = useState(false);
    const [showEditDeliveryModal, setShowEditDeliveryModal] = useState(false);
    const [editingDeliveryCourse, setEditingDeliveryCourse] = useState(null);
    const [updatingDeliveryCourse, setUpdatingDeliveryCourse] = useState(false);
    const [submittingCourseId, setSubmittingCourseId] = useState(null);
    const [deliveryCategories, setDeliveryCategories] = useState([]);
    const [deliveryCourse, setDeliveryCourse] = useState(DEFAULT_DELIVERY_COURSE);

    const ensureDeliveryCategories = useCallback(async () => {
        if (deliveryCategories.length) return true;

        try {
            const categories = await fetchCategories();
            setDeliveryCategories(toArray(categories));
            return true;
        } catch (error) {
            console.error('Failed to load categories', error);
            toast.error(
                parseApiError(
                    error,
                    t('instructorDashboard.shell.toasts.categoriesLoadError')
                ).message
            );
            return false;
        }
    }, [deliveryCategories.length, t]);

    const handleDeliveryCourseChange = useCallback((event) => {
        const { name, value } = event.target;
        setDeliveryCourse((prev) => ({ ...prev, [name]: value }));
    }, []);

    const closeDeliveryModal = useCallback(() => {
        setShowDeliveryModal(false);
        setDeliveryCourse(DEFAULT_DELIVERY_COURSE);
    }, []);

    const closeEditDeliveryModal = useCallback(() => {
        setShowEditDeliveryModal(false);
        setEditingDeliveryCourse(null);
    }, []);

    const openDeliveryModal = useCallback(async () => {
        await ensureDeliveryCategories();
        setShowDeliveryModal(true);
    }, [ensureDeliveryCategories]);

    const openDeliveryEditModal = useCallback(async (course) => {
        if (!course) return;

        const categoriesLoaded = await ensureDeliveryCategories();
        if (!categoriesLoaded) return;

        setEditingDeliveryCourse({
            id: course.id,
            courseType: course.courseType || 'offline',
            title: course.title || '',
            description: course.description || '',
            categoryId: course.category?.id || course.categoryId || '',
            price: course.price || 0,
            languageCode: course.languageCode || 'ky',
            status: course.status || '',
            isPublished: Boolean(course.isPublished),
        });
        setShowEditDeliveryModal(true);
    }, [ensureDeliveryCategories]);

    const handleCreateDeliveryCourse = useCallback(async (payloadOrSuccessCallback) => {
        const payload =
            typeof payloadOrSuccessCallback === 'function'
                ? deliveryCourse
                : payloadOrSuccessCallback;

        if (isMissingRequiredFields(payload)) {
            toast.error(t('instructorDashboard.shell.toasts.requiredFields'));
            return false;
        }

        setCreatingDeliveryCourse(true);

        try {
            const createdCourse = await createCourse(buildDeliveryCoursePayload(payload));

            toast.success(t('instructorDashboard.shell.toasts.deliveryCourseCreated'));
            closeDeliveryModal();

            if (typeof payloadOrSuccessCallback === 'function') {
                payloadOrSuccessCallback(createdCourse);
            } else if (onCreated) {
                await onCreated(createdCourse);
            }
            return true;
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error(
                parseApiError(
                    error,
                    t('instructorDashboard.shell.toasts.deliveryCourseCreateError')
                ).message
            );
            return false;
        } finally {
            setCreatingDeliveryCourse(false);
        }
    }, [closeDeliveryModal, deliveryCourse, onCreated, t]);

    const handleUpdateDeliveryCourse = useCallback(async (payload) => {
        if (!editingDeliveryCourse?.id) return false;

        if (isMissingRequiredFields(payload)) {
            toast.error(t('instructorDashboard.shell.toasts.requiredFields'));
            return false;
        }

        setUpdatingDeliveryCourse(true);
        try {
            const updatedCourse = await updateCourse(
                editingDeliveryCourse.id,
                buildDeliveryCoursePayload(payload)
            );

            const requiresReview =
                editingDeliveryCourse.status === 'approved' ||
                editingDeliveryCourse.isPublished;
            const reviewCourse = requiresReview
                ? await markCoursePending(editingDeliveryCourse.id)
                : null;

            if (onUpdated) {
                await onUpdated({
                    courseId: editingDeliveryCourse.id,
                    requiresReview,
                    reviewCourse,
                    updatedCourse,
                });
            }

            toast.success(
                requiresReview
                    ? t('instructorDashboard.shell.toasts.deliveryCourseUpdatedForReview')
                    : t('instructorDashboard.shell.toasts.deliveryCourseUpdated')
            );
            closeEditDeliveryModal();
            return true;
        } catch (error) {
            console.error('Failed to update delivery course', error);
            toast.error(
                parseApiError(
                    error,
                    t('instructorDashboard.shell.toasts.deliveryCourseUpdateError')
                ).message
            );
            return false;
        } finally {
            setUpdatingDeliveryCourse(false);
        }
    }, [closeEditDeliveryModal, editingDeliveryCourse, onUpdated, t]);

    const handleSubmitCourseForApproval = useCallback(async (courseId) => {
        if (!courseId) return false;

        setSubmittingCourseId(courseId);
        try {
            const pendingCourse = await markCoursePending(courseId);
            if (onSubmittedForApproval) {
                await onSubmittedForApproval({ courseId, pendingCourse });
            }
            toast.success(t('instructorDashboard.shell.toasts.courseSubmittedForApproval'));
            return true;
        } catch (error) {
            console.error('Failed to submit course for approval', error);
            toast.error(
                parseApiError(
                    error,
                    t('instructorDashboard.shell.toasts.courseSubmitError')
                ).message
            );
            return false;
        } finally {
            setSubmittingCourseId(null);
        }
    }, [onSubmittedForApproval, t]);

    return {
        showDeliveryModal,
        creatingDeliveryCourse,
        showEditDeliveryModal,
        editingDeliveryCourse,
        updatingDeliveryCourse,
        submittingCourseId,
        deliveryCategories,
        deliveryCourse,
        handleDeliveryCourseChange,
        closeDeliveryModal,
        closeEditDeliveryModal,
        openDeliveryModal,
        openDeliveryEditModal,
        handleCreateDeliveryCourse,
        handleUpdateDeliveryCourse,
        handleSubmitCourseForApproval,
    };
};
