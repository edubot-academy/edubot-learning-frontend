import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createCourse, fetchCategories } from '@services/api';
import { parseApiError } from '@shared/api/error';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

export const useDeliveryCourse = () => {
    const { t } = useTranslation();
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [creatingDeliveryCourse, setCreatingDeliveryCourse] = useState(false);
    const [deliveryCategories, setDeliveryCategories] = useState([]);
    const [deliveryCourse, setDeliveryCourse] = useState({
        courseType: 'offline',
        title: '',
        description: '',
        categoryId: '',
        price: '',
        languageCode: 'ky',
    });

    const handleDeliveryCourseChange = useCallback((event) => {
        const { name, value } = event.target;
        setDeliveryCourse((prev) => ({ ...prev, [name]: value }));
    }, []);

    const closeDeliveryModal = useCallback(() => {
        setShowDeliveryModal(false);
        setDeliveryCourse({
            courseType: 'offline',
            title: '',
            description: '',
            categoryId: '',
            price: '',
            languageCode: 'ky',
        });
    }, []);

    const openDeliveryModal = useCallback(async () => {
        if (!deliveryCategories.length) {
            try {
                const categories = await fetchCategories();
                setDeliveryCategories(toArray(categories));
            } catch (error) {
                console.error('Failed to load categories', error);
                toast.error(parseApiError(error, t('instructorDashboard.deliveryCourseModal.toasts.categoriesLoadError')).message);
            }
        }
        setShowDeliveryModal(true);
    }, [deliveryCategories.length, t]);

    const handleCreateDeliveryCourse = useCallback(async (onSuccess) => {
        if (!deliveryCourse.title || !deliveryCourse.description || !deliveryCourse.categoryId) {
            toast.error(t('instructorDashboard.deliveryCourseModal.validation.requiredFields'));
            return;
        }

        setCreatingDeliveryCourse(true);

        try {
            await createCourse({
                title: deliveryCourse.title,
                description: deliveryCourse.description,
                categoryId: parseInt(deliveryCourse.categoryId, 10),
                price: Number(deliveryCourse.price || 0),
                languageCode: deliveryCourse.languageCode || 'ky',
                courseType: deliveryCourse.courseType,
                isPaid: Number(deliveryCourse.price || 0) > 0,
            });

            toast.success(t('instructorDashboard.deliveryCourseModal.toasts.created'));
            closeDeliveryModal();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error(parseApiError(error, t('instructorDashboard.deliveryCourseModal.toasts.createError')).message);
        } finally {
            setCreatingDeliveryCourse(false);
        }
    }, [closeDeliveryModal, deliveryCourse, t]);

    return {
        showDeliveryModal,
        creatingDeliveryCourse,
        deliveryCategories,
        deliveryCourse,
        handleDeliveryCourseChange,
        closeDeliveryModal,
        openDeliveryModal,
        handleCreateDeliveryCourse,
    };
};
