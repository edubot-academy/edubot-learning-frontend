import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import { getDashboardPath } from '@shared/utils/navigation';

const MAX_PENDING_ACTION_AGE = 24 * 60 * 60 * 1000;

export const getPostLoginPath = (user, location) => {
    const from = location.state?.from;
    const fromPath = typeof from === 'string' ? from : from?.pathname;
    const fromSearch = typeof from === 'string' ? '' : from?.search || '';

    if (fromPath && fromPath !== '/login') {
        return `${fromPath}${fromSearch}`;
    }

    return getDashboardPath(user);
};

export const executePendingAuthAction = async ({ addToCart, toggleFavourite, navigate }) => {
    const pendingActionStr = localStorage.getItem('pendingAction');
    if (!pendingActionStr) return false;

    try {
        const pendingAction = JSON.parse(pendingActionStr);

        if (Date.now() - pendingAction.timestamp > MAX_PENDING_ACTION_AGE) {
            localStorage.removeItem('pendingAction');
            return false;
        }

        if (pendingAction.type === 'favourite') {
            const course = {
                ...pendingAction.course,
                id: pendingAction.courseId,
                title: pendingAction.courseTitle || i18n.t('pages.auth.postLogin.courseFallback', {
                    id: pendingAction.courseId,
                }),
            };
            const result = await toggleFavourite(course);

            if (result.success) {
                localStorage.removeItem('pendingAction');
                toast.success(i18n.t('pages.auth.postLogin.favouriteAdded'));
                navigate('/favourites');
                return true;
            }
        }

        if (pendingAction.type === 'cart') {
            const course = {
                ...pendingAction.course,
                id: pendingAction.courseId,
                title: pendingAction.courseTitle || i18n.t('pages.auth.postLogin.courseFallback', {
                    id: pendingAction.courseId,
                }),
            };
            const result = await addToCart(course);

            if (result.success) {
                localStorage.removeItem('pendingAction');
                toast.success(i18n.t('pages.auth.postLogin.cartAdded'));
                navigate('/cart');
                return true;
            }
        }

        localStorage.removeItem('pendingAction');
        return false;
    } catch (error) {
        console.error('Failed to execute pending action:', error);
        localStorage.removeItem('pendingAction');
        return false;
    }
};
