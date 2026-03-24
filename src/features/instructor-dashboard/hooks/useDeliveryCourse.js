import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { createCourse, fetchCategories } from '@services/api';

export const useDeliveryCourse = () => {
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
                setDeliveryCategories(Array.isArray(categories) ? categories : []);
            } catch (error) {
                console.error('Failed to load categories', error);
                toast.error('Категориялар жүктөлгөн жок');
            }
        }
        setShowDeliveryModal(true);
    }, [deliveryCategories.length]);

    const handleCreateDeliveryCourse = useCallback(async (onSuccess) => {
        if (!deliveryCourse.title || !deliveryCourse.description || !deliveryCourse.categoryId) {
            toast.error('Сураныч, аталыш, сүрөттөмө жана категорияны толтуруңуз.');
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

            toast.success('Курс түзүлдү. Эми группа жана сессия түзө аласыз.');
            closeDeliveryModal();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to create delivery course', error);
            toast.error('Курсту түзүүдө ката кетти.');
        } finally {
            setCreatingDeliveryCourse(false);
        }
    }, [deliveryCourse, closeDeliveryModal]);

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
