import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendOtp, resetPassword } from '@services/api';
import { IoClose } from 'react-icons/io5';

const getApiError = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

const getMethodOptions = (t) => [
    { value: 'email', label: 'Email', hint: t('pages.auth.forgotPassword.methods.emailHint') },
    { value: 'whatsapp', label: 'WhatsApp', hint: t('pages.auth.forgotPassword.methods.whatsappHint') },
];

const validateIdentifier = ({ method, identifier, t }) => {
    const value = identifier.trim();

    if (!method) return t('pages.auth.forgotPassword.validation.methodRequired');
    if (!value) return t('pages.auth.forgotPassword.validation.identifierRequired');
    if (method === 'email' && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value)) {
        return t('pages.auth.forgotPassword.validation.emailInvalid');
    }
    if (method === 'whatsapp' && !/^\+?\d{9,16}$/.test(value)) {
        return t('pages.auth.forgotPassword.validation.whatsappInvalid');
    }

    return '';
};

const validatePasswordStep = ({ otp, newPassword, confirmPassword, t }) => {
    if (!/^\d{4,8}$/.test(otp.trim())) return t('pages.auth.forgotPassword.validation.otpInvalid');
    if (newPassword.length < 8) return t('pages.auth.forgotPassword.validation.passwordTooShort');
    if (newPassword !== confirmPassword) return t('pages.auth.forgotPassword.validation.passwordMismatch');
    return '';
};

const ForgotPassword = ({ onClose }) => {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState('');
    const [method, setMethod] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordReset, setPasswordReset] = useState(false);
    const closeButtonRef = useRef(null);
    const methodOptions = getMethodOptions(t);

    const selectedMethod = methodOptions.find((item) => item.value === method);

    useEffect(() => {
        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const validationError = validateIdentifier({ method, identifier, t });

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await sendOtp({ identifier: identifier.trim(), method });
            setOtpSent(true);
        } catch (err) {
            setError(getApiError(err, t('pages.auth.forgotPassword.errors.sendOtp')));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const validationError = validatePasswordStep({ otp, newPassword, confirmPassword, t });

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword({
                identifier: identifier.trim(),
                otp: otp.trim(),
                newPassword,
                method,
            });
            setPasswordReset(true);
        } catch (err) {
            setError(getApiError(err, t('pages.auth.forgotPassword.errors.resetPassword')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="presentation">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="forgot-password-title"
                aria-describedby="forgot-password-description"
                className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#222222] sm:p-8"
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-gray-600 transition hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-[#a6adba] dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={t('pages.auth.forgotPassword.close')}
                >
                    <IoClose size={26} aria-hidden="true" />
                </button>

                <p className="text-sm font-semibold uppercase tracking-wide text-edubot-orange">
                    {t('pages.auth.forgotPassword.eyebrow')}
                </p>
                <h2 id="forgot-password-title" className="mt-2 text-2xl font-bold text-black dark:text-white">
                    {t('pages.auth.forgotPassword.title')}
                </h2>
                <p id="forgot-password-description" className="mt-2 text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                    {t('pages.auth.forgotPassword.description')}
                </p>

                {error && (
                    <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                        {error}
                    </p>
                )}

                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-white">
                                {t('pages.auth.forgotPassword.methodLabel')}
                            </span>
                            <select
                                value={method}
                                onChange={(e) => {
                                    setMethod(e.target.value);
                                    setError('');
                                }}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                                required
                            >
                                <option value="">{t('pages.auth.forgotPassword.methodPlaceholder')}</option>
                                {methodOptions.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-white">
                                {method === 'whatsapp'
                                    ? t('pages.auth.forgotPassword.whatsappLabel')
                                    : t('pages.auth.forgotPassword.emailLabel')}
                            </span>
                            <input
                                type={method === 'email' ? 'email' : 'text'}
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    setError('');
                                }}
                                placeholder={method === 'whatsapp' ? '+996700123456' : 'name@example.com'}
                                autoComplete={method === 'email' ? 'email' : 'tel'}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                                required
                            />
                            {selectedMethod && (
                                <span className="mt-1 block text-xs text-gray-500 dark:text-[#a6adba]">
                                    {selectedMethod.hint}
                                </span>
                            )}
                        </label>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] py-3 font-semibold text-white shadow-[0px_5px_21.3px_0px_#E14219BF] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading
                                ? t('pages.auth.forgotPassword.actions.sending')
                                : t('pages.auth.forgotPassword.actions.sendOtp')}
                        </button>
                    </form>
                ) : !passwordReset ? (
                    <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                        <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-800">
                            {t('pages.auth.forgotPassword.otpSent', {
                                channel: selectedMethod?.label || t('pages.auth.forgotPassword.selectedChannel'),
                            })}
                        </p>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder={t('pages.auth.forgotPassword.otpPlaceholder')}
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value);
                                setError('');
                            }}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                            required
                        />
                        <input
                            type="password"
                            placeholder={t('pages.auth.forgotPassword.newPasswordPlaceholder')}
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setError('');
                            }}
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                            required
                        />
                        <input
                            type="password"
                            placeholder={t('pages.auth.forgotPassword.confirmPasswordPlaceholder')}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError('');
                            }}
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-[#222222] dark:text-white"
                            required
                        />

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] py-3 font-semibold text-white shadow-[0px_5px_21.3px_0px_#E14219BF] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-75"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading
                                ? t('pages.auth.forgotPassword.actions.resetting')
                                : t('pages.auth.forgotPassword.actions.resetPassword')}
                        </button>
                    </form>
                ) : (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                        <p className="font-semibold">{t('pages.auth.forgotPassword.success.title')}</p>
                        <p className="mt-1 text-sm">{t('pages.auth.forgotPassword.success.description')}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                        >
                            {t('pages.auth.forgotPassword.actions.backToLogin')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
