// @shared-ui/AuthRequiredModal.js
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { getAuthAcquisitionPath, isPublicVideoSignupEnabled } from '@shared/auth-config';
import { useTranslation } from 'react-i18next';

const AuthRequiredModal = ({ isOpen, onClose, title, description }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        navigate('/login', { state: { from: '/cart' } });
        onClose();
    };

    const handleRegister = () => {
        navigate(getAuthAcquisitionPath(), { state: { from: '/cart' } });
        onClose();
    };
    const resolvedTitle = title || t('public.courseShared.authRequired.title');
    const resolvedDescription = description || t('public.courseShared.authRequired.description');

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <FaShoppingCart className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {resolvedTitle}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {resolvedDescription}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                                aria-label={t('public.courseShared.authRequired.close')}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                <p className="text-orange-800 text-sm">
                                    <span className="font-semibold">
                                        {t('public.courseShared.authRequired.noticeLabel')}
                                    </span>{' '}
                                    {t('public.courseShared.authRequired.notice')}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {isPublicVideoSignupEnabled ? (
                                    <button
                                        onClick={handleRegister}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <FaUserPlus className="w-5 h-5" />
                                        <span>
                                            {t('public.courseShared.authRequired.createAccount')}
                                        </span>
                                    </button>
                                ) : null}

                                <button
                                    onClick={handleLogin}
                                    className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300"
                                >
                                    <FaSignInAlt className="w-5 h-5" />
                                    <span>{t('public.courseShared.authRequired.login')}</span>
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={onClose}
                                    className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors"
                                >
                                    {t('public.courseShared.authRequired.later')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthRequiredModal;
