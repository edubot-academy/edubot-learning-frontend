import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import BasicModal from '@shared/ui/BasicModal';
import { SUPPORT_CONTACT } from '@shared/config/support';
import { submitContactMessage } from '@services/api';
import { useTranslation } from 'react-i18next';

const formatPrice = (price, t) => {
    if (!price && price !== 0) return t('public.courseShared.priceUnavailable');
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) return t('public.courseShared.priceUnavailable');

    return t('public.courseShared.currencyKgs', {
        amount: new Intl.NumberFormat('ru-RU').format(numericPrice),
    });
};

const normalizePhone = (phone) => phone.replace(/[^\d+]/g, '');

const getApiErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === 'string') return data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;

    return fallback;
};

const getApiFieldErrors = (error) => {
    const data = error?.response?.data;
    const source = data?.errors || data?.fieldErrors || data?.validationErrors;

    if (!source || typeof source !== 'object') return {};

    const fieldMap = {
        name: 'name',
        fullName: 'name',
        email: 'email',
        phone: 'phone',
        phoneNumber: 'phone',
        message: 'message',
    };

    return Object.entries(source).reduce((acc, [key, value]) => {
        const fieldName = fieldMap[key];
        if (!fieldName) return acc;

        acc[fieldName] = Array.isArray(value) ? value.join(' ') : String(value);
        return acc;
    }, {});
};

const buildContextMessage = ({ course, lessonCount, cartItems, totalPrice, message, t }) => {
    const details = [];

    if (cartItems?.length) {
        details.push(t('public.courseShared.contactModal.cartRequest'));
        cartItems.forEach((item, index) => {
            details.push(
                `${index + 1}. ${
                    item.title || `${t('public.courseShared.course')} ${item.id}`
                } - ${formatPrice(item.price, t)}`
            );
        });
        details.push(
            t('public.courseShared.contactModal.total', {
                price: formatPrice(totalPrice, t),
            })
        );
    } else if (course) {
        details.push(
            t('public.courseShared.contactModal.courseRequestLine', {
                title: course.title || `${t('public.courseShared.course')} ${course.id}`,
            })
        );
        details.push(
            t('public.courseShared.contactModal.priceLine', {
                price: formatPrice(course.price, t),
            })
        );
        if (lessonCount || lessonCount === 0) {
            details.push(
                t('public.courseShared.contactModal.lessonsLine', {
                    count: lessonCount,
                })
            );
        }
    }

    if (message.trim()) {
        details.push('');
        details.push(
            t('public.courseShared.contactModal.userMessage', {
                message: message.trim(),
            })
        );
    }

    return details.join('\n');
};

const ContactCourseModal = ({
    isOpen,
    onClose,
    course,
    lessonCount,
    cartItems = [],
    totalPrice,
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        const phone = normalizePhone(formData.phone);
        if (formData.name.trim().length < 2) {
            newErrors.name = t('public.courseShared.contactModal.validation.name');
        }
        if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email.trim())) {
            newErrors.email = t('public.courseShared.contactModal.validation.email');
        }
        if (!/^\+\d{10,15}$/.test(phone)) {
            newErrors.phone = t('public.courseShared.contactModal.validation.phone');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const cleanedValue = value.replace(/[^\d+\s-()]/g, '');
            if (cleanedValue.replace(/\D/g, '').length > 13) return;
            setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        if (formError) {
            setFormError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const subject = cartItems.length
                ? t('public.courseShared.contactModal.cartSubject', {
                      count: cartItems.length,
                  })
                : t('public.courseShared.contactModal.courseSubject', {
                      title: course?.title || t('public.courseShared.course'),
                  });

            await submitContactMessage({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: normalizePhone(formData.phone),
                subject,
                message: buildContextMessage({
                    course,
                    lessonCount,
                    cartItems,
                    totalPrice,
                    message: formData.message,
                    t,
                }),
            });

            toast.success(t('public.courseShared.contactModal.success'));
            onClose?.();
            setFormData({ name: '', email: '', phone: '', message: '' });
            setErrors({});
            setFormError('');
        } catch (error) {
            const apiFieldErrors = getApiFieldErrors(error);
            const message = getApiErrorMessage(
                error,
                t('public.courseShared.contactModal.requestFailed')
            );

            if (Object.keys(apiFieldErrors).length > 0) {
                setErrors(apiFieldErrors);
            } else {
                setFormError(message);
            }

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasCartContext = cartItems.length > 0;
    const summaryTitle = hasCartContext
        ? t('public.courseShared.contactModal.summaryCart', { count: cartItems.length })
        : t('public.courseShared.contactModal.summaryCourse', {
              title: course?.title || t('public.courseShared.contactModal.noCourseSelected'),
          });
    const summaryPrice = hasCartContext ? totalPrice : course?.price;

    return (
        <BasicModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('public.courseShared.contactModal.title')}
            subtitle={t('public.courseShared.contactModal.subtitle')}
            size="md"
            darkMode
        >
            <div className="p-1">
                <div className="mb-6 rounded-lg border border-orange-100 bg-gradient-to-r from-orange-50 to-red-50 p-4 dark:border-orange-800/30 dark:from-orange-900/20 dark:bg-gray-800">
                    <h3 className="font-bold text-lg mb-2 text-[#EA580C] dark:text-orange-400">
                        {summaryTitle}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">
                                {t('public.courseShared.price')}:
                            </span>
                            <span className="font-bold text-gray-800 dark:text-white ml-2">
                                {formatPrice(summaryPrice, t)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">
                                {hasCartContext
                                    ? t('public.courseShared.contactModal.courses')
                                    : t('public.courseShared.contactModal.lessons')}
                            </span>
                            <span className="font-bold text-gray-800 dark:text-white ml-2">
                                {hasCartContext
                                    ? cartItems.length
                                    : (lessonCount ?? t('public.courseShared.notSpecified'))}
                            </span>
                        </div>
                    </div>
                    {hasCartContext && (
                        <ul className="mt-3 space-y-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                            {cartItems.slice(0, 3).map((item) => (
                                <li key={item.cartItemId || item.id}>
                                    {item.title || `${t('public.courseShared.course')} ${item.id}`}{' '}
                                    - {formatPrice(item.price, t)}
                                </li>
                            ))}
                            {cartItems.length > 3 && (
                                <li>
                                    {t('public.courseShared.contactModal.moreCourses', {
                                        count: cartItems.length - 3,
                                    })}
                                </li>
                            )}
                        </ul>
                    )}
                    <p className="mt-3 text-xs leading-5 text-gray-600 dark:text-gray-300">
                        {t('public.courseShared.contactModal.quickContact', {
                            phone: SUPPORT_CONTACT.phoneDisplay,
                            telegram: SUPPORT_CONTACT.telegramHandle,
                        })}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="course-contact-name"
                            className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm"
                        >
                            {t('public.courseShared.contactModal.fullName')}
                        </label>
                        <input
                            id="course-contact-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition-all duration-200 
                                ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder={t('public.courseShared.contactModal.fullNamePlaceholder')}
                            autoComplete="name"
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'course-contact-name-error' : undefined}
                        />
                        {errors.name && (
                            <p
                                id="course-contact-name-error"
                                className="text-red-500 dark:text-red-400 text-xs mt-1"
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="course-contact-phone"
                            className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm"
                        >
                            {t('public.courseShared.contactModal.phone')}
                        </label>
                        <input
                            id="course-contact-phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition-all duration-200 
                                ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder="+996 ___ __ __ __"
                            autoComplete="tel"
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={
                                errors.phone
                                    ? 'course-contact-phone-error'
                                    : 'course-contact-phone-help'
                            }
                        />
                        <p
                            id="course-contact-phone-help"
                            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        >
                            {t('public.courseShared.contactModal.phoneHelp')}
                        </p>
                        {errors.phone && (
                            <p
                                id="course-contact-phone-error"
                                className="text-red-500 dark:text-red-400 text-xs mt-1"
                            >
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="course-contact-email"
                            className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm"
                        >
                            {t('public.courseShared.contactModal.email')}
                        </label>
                        <input
                            id="course-contact-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition-all duration-200 
                                ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder="example@mail.com"
                            autoComplete="email"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? 'course-contact-email-error' : undefined
                            }
                        />
                        {errors.email && (
                            <p
                                id="course-contact-email-error"
                                className="text-red-500 dark:text-red-400 text-xs mt-1"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="course-contact-message"
                            className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm"
                        >
                            {t('public.courseShared.contactModal.message')}
                        </label>
                        <textarea
                            id="course-contact-message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="3"
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition resize-none
                                ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder={t('public.courseShared.contactModal.messagePlaceholder')}
                            aria-invalid={Boolean(errors.message)}
                            aria-describedby={
                                errors.message
                                    ? 'course-contact-message-error'
                                    : 'course-contact-message-help'
                            }
                        />
                        <p
                            id="course-contact-message-help"
                            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        >
                            {t('public.courseShared.contactModal.messageHelp')}
                        </p>
                        {errors.message && (
                            <p
                                id="course-contact-message-error"
                                className="text-red-500 dark:text-red-400 text-xs mt-1"
                            >
                                {errors.message}
                            </p>
                        )}
                    </div>

                    {formError && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
                        >
                            {formError}
                        </div>
                    )}
                    {isSubmitting && (
                        <p role="status" className="text-sm text-gray-600 dark:text-gray-300">
                            {t('public.courseShared.contactModal.submittingStatus')}
                        </p>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                                border border-gray-300 dark:border-gray-600 rounded-lg 
                                hover:bg-gray-50 dark:hover:bg-gray-700 
                                transition-colors duration-200 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('public.courseShared.contactModal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 
                                ${
                                    isSubmitting
                                        ? 'bg-[#FF8C6E] dark:bg-orange-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#EA580C] to-[#E14219] dark:from-orange-600 dark:to-red-700 hover:from-[#d64d0b] hover:to-[#c13613] dark:hover:from-orange-700 dark:hover:to-red-800'
                                }`}
                        >
                            {isSubmitting
                                ? t('public.courseShared.contactModal.submitting')
                                : t('public.courseShared.contactModal.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </BasicModal>
    );
};

ContactCourseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    course: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    lessonCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cartItems: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            cartItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
    ),
    totalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ContactCourseModal;
