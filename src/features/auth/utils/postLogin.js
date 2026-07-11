import toast from 'react-hot-toast';
import i18n from '../../../i18n';
import { getDashboardPath } from '@shared/utils/navigation';
import { clearPendingAuthAction, loadPendingAuthAction } from '../storage';

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

export const executePendingAuthAction = async ({ addToCart, toggleFavourite, saveResource, navigate }) => {
    const pendingAction = loadPendingAuthAction();
    if (!pendingAction) return false;

    try {
        if (Date.now() - pendingAction.timestamp > MAX_PENDING_ACTION_AGE) {
            clearPendingAuthAction();
            return false;
        }

        if (pendingAction.type === 'favourite') {
            const course = {
                ...pendingAction.course,
                id: pendingAction.courseId,
                title: pendingAction.courseTitle || i18n.t('public.auth.postLogin.courseFallback', {
                    id: pendingAction.courseId,
                }),
            };
            const result = await toggleFavourite(course);

            if (result.success) {
                clearPendingAuthAction();
                toast.success(i18n.t('public.auth.postLogin.favouriteAdded'));
                navigate('/favourites');
                return true;
            }
        }

        if (pendingAction.type === 'cart') {
            const course = {
                ...pendingAction.course,
                id: pendingAction.courseId,
                title: pendingAction.courseTitle || i18n.t('public.auth.postLogin.courseFallback', {
                    id: pendingAction.courseId,
                }),
            };
            const result = await addToCart(course);

            if (result.success) {
                clearPendingAuthAction();
                toast.success(i18n.t('public.auth.postLogin.cartAdded'));
                navigate('/cart');
                return true;
            }
        }

        if (pendingAction.type === 'save-resource' && pendingAction.slug) {
            clearPendingAuthAction();
            if (saveResource) {
                saveResource(pendingAction.slug, {
                    title: pendingAction.resourceTitle || pendingAction.slug,
                });
            }
            toast.success(
                i18n.t('public.externalResources.saveToast', {
                    title: pendingAction.resourceTitle || pendingAction.slug,
                })
            );
            navigate(`/resources/${pendingAction.slug}`);
            return true;
        }

        clearPendingAuthAction();
        return false;
    } catch (error) {
        console.error('Failed to execute pending action:', error);
        clearPendingAuthAction();
        return false;
    }
};
