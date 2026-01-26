// hooks/usePendingActions.js
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { toast } from 'react-hot-toast';

export const usePendingActions = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const { toggleFavourite } = useFavourites();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Проверяем, есть ли отложенные действия
            const pendingActionStr = localStorage.getItem('pendingAction');
            if (pendingActionStr) {
                try {
                    const pendingAction = JSON.parse(pendingActionStr);

                    // Проверяем, не устарело ли действие (больше 24 часов)
                    const now = Date.now();
                    const actionAge = now - pendingAction.timestamp;
                    const MAX_ACTION_AGE = 24 * 60 * 60 * 1000; // 24 часа

                    if (actionAge > MAX_ACTION_AGE) {
                        localStorage.removeItem('pendingAction');
                        return;
                    }

                    // Выполняем действие в зависимости от типа
                    const executeAction = async () => {
                        try {
                            if (pendingAction.type === 'favourite') {
                                const courseData = {
                                    id: pendingAction.courseId,
                                    title:
                                        pendingAction.courseTitle ||
                                        `Курс ${pendingAction.courseId}`,
                                    instructor: { fullName: '' },
                                    price: 0,
                                    coverImageUrl: '',
                                    ratingCount: 0,
                                    ratingAverage: 0,
                                    level: '',
                                    durationInHours: 0,
                                    lessonCount: 0,
                                    isPublished: true,
                                };
                                const result = await toggleFavourite(courseData);
                                if (result.success) {
                                    toast.success('Курс добавлен в избранное!');
                                    navigate('/favourite');
                                }
                            } else if (pendingAction.type === 'cart') {
                                const courseData = {
                                    id: pendingAction.courseId,
                                    title: pendingAction.courseTitle,
                                    instructor: { fullName: '' },
                                    price: 0,
                                    coverImageUrl: '',
                                    ratingCount: 0,
                                    ratingAverage: 0,
                                    level: '',
                                    durationInHours: 0,
                                    lessonCount: 0,
                                    isPublished: true,
                                };
                                const result = await addToCart(courseData);
                                if (result.success) {
                                    toast.success('Курс добавлен в корзину!');
                                    navigate('/cart');
                                }
                            }

                            // Удаляем выполненное действие
                            localStorage.removeItem('pendingAction');
                        } catch (error) {
                            console.error('Failed to execute pending action:', error);
                            localStorage.removeItem('pendingAction');
                        }
                    };

                    // Запускаем выполнение с небольшой задержкой
                    setTimeout(() => {
                        executeAction();
                    }, 1000);
                } catch (error) {
                    console.error('Failed to parse pending action:', error);
                    localStorage.removeItem('pendingAction');
                }
            }
        }
    }, [user, addToCart, toggleFavourite, navigate]);
};
