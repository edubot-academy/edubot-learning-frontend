import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AdvancedModal from '@shared/ui/AdvancedModal';

const CreateDeliveryCourseModal = ({
    isOpen,
    onClose,
    onCreateDeliveryCourse,
    creatingDeliveryCourse,
    deliveryCategories,
}) => {
    const [formData, setFormData] = useState({
        courseType: 'offline',
        title: '',
        description: '',
        categoryId: '',
        price: '',
        languageCode: 'ky',
    });
    const [errors, setErrors] = useState({});

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                courseType: 'offline',
                title: '',
                description: '',
                categoryId: '',
                price: '',
                languageCode: 'ky',
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Курс аталышын толтуруңуз';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Курс сүрөттөмөн толтуруңуз';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Категорияны тандаңыз';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();

        if (!validate()) {
            return;
        }

        const success = await onCreateDeliveryCourse({
            ...formData,
            price: Number(formData.price || 0),
            isPaid: Number(formData.price || 0) > 0,
        });

        if (success) {
            onClose();
        }
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            setFormData(prev => ({ ...prev, price: value }));
        }
    };

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Жаңы курс түзүү"
            subtitle="Оффлайн же онлайн курс түзүү үчүн формасы"
            size="lg"
            loading={creatingDeliveryCourse}
            preventClose={creatingDeliveryCourse}
            className="enhanced-modal"
            actions={[
                {
                    id: 'cancel',
                    label: 'Жокко чыгаруу',
                    onClick: onClose,
                    variant: 'secondary',
                    disabled: creatingDeliveryCourse
                },
                {
                    id: 'submit',
                    label: 'Курс түзүү',
                    onClick: handleSubmit,
                    variant: 'primary',
                    loading: creatingDeliveryCourse
                }
            ]}
        >
            <form
                className="space-y-6"
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                {/* Course Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Курс түрү *
                        </label>
                        <div className="relative">
                            <select
                                name="courseType"
                                value={formData.courseType}
                                onChange={handleChange}
                                disabled={creatingDeliveryCourse}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors appearance-none ${errors.courseType ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                aria-describedby="courseType-error"
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    msAppearance: 'none'
                                }}
                            >
                                <option value="offline">Оффлайн</option>
                                <option value="online_live">Онлайн түз эфир</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {errors.courseType && (
                                <p id="courseType-error" className="text-red-500 text-xs mt-1">
                                    {errors.courseType}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Сабак тили *
                        </label>
                        <div className="relative">
                            <select
                                name="languageCode"
                                value={formData.languageCode}
                                onChange={handleChange}
                                disabled={creatingDeliveryCourse}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors appearance-none ${errors.languageCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                aria-describedby="languageCode-error"
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    msAppearance: 'none'
                                }}
                            >
                                <option value="ky">Кыргызча</option>
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-4 4H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            {errors.languageCode && (
                                <p id="languageCode-error" className="text-red-500 text-xs mt-1">
                                    {errors.languageCode}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Course Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Курс аталышы *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={creatingDeliveryCourse}
                        placeholder="Курсунун аталышын киргизиңиз"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors ${errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                        aria-describedby="title-error"
                        maxLength={100}
                    />
                    {errors.title && (
                        <p id="title-error" className="text-red-500 text-xs mt-1">
                            {errors.title}
                        </p>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.title.length}/100 белги
                    </div>
                </div>

                {/* Course Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Курс сүрөттөмө *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={creatingDeliveryCourse}
                        placeholder="Курс жөнүндө эмне экенин сүрөттөңүз"
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none transition-colors ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        aria-describedby="description-error"
                        maxLength={500}
                    />
                    {errors.description && (
                        <p id="description-error" className="text-red-500 text-xs mt-1">
                            {errors.description}
                        </p>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.description.length}/500 белги
                    </div>
                </div>

                {/* Category and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Категория *
                        </label>
                        <div className="relative">
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                disabled={creatingDeliveryCourse}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors appearance-none ${errors.categoryId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                aria-describedby="categoryId-error"
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    msAppearance: 'none'
                                }}
                            >
                                <option value="">Тандаңыз</option>
                                {deliveryCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-4 4H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            {errors.categoryId && (
                                <p id="categoryId-error" className="text-red-500 text-xs mt-1">
                                    {errors.categoryId}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Баасы (сом)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">сом</span>
                            </div>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handlePriceChange}
                                disabled={creatingDeliveryCourse}
                                placeholder="0"
                                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors ${errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                aria-describedby="price-error"
                            />
                            {errors.price && (
                                <p id="price-error" className="text-red-500 text-xs mt-1">
                                    {errors.price}
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Бош калса акысыз курс болот
                        </p>
                    </div>
                </div>

                {/* Course Type Description */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1m1-4h1M3 21h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Курс түрү
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                {formData.courseType === 'offline'
                                    ? 'Офлайн тренинг – жайгашкан жерди көрсөтүңүз.'
                                    : 'Zoom же Google Meet аркылуу жандуу сабак.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
            </form>
        </AdvancedModal>
    );
};

CreateDeliveryCourseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreateDeliveryCourse: PropTypes.func.isRequired,
    creatingDeliveryCourse: PropTypes.bool,
    deliveryCategories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
    })),
};

export default CreateDeliveryCourseModal;
