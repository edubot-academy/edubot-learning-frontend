import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AdvancedModal from '@shared/ui/AdvancedModal';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const MODALITY_OPTIONS = ['ONLINE', 'OFFLINE', 'HYBRID'];

const courseShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
});

const courseCollectionShape = PropTypes.oneOfType([
    PropTypes.arrayOf(courseShape),
    PropTypes.shape({
        items: PropTypes.arrayOf(courseShape),
        data: PropTypes.arrayOf(courseShape),
    }),
]);

const CreateOfferingModal = ({
    courses,
    form,
    onChange,
    onClose,
    onSubmit,
    creating,
    mode
}) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const normalizedCourses = toArray(courses);
    const modalityCopy = {
        ONLINE: {
            label: t('instructorDashboard.createOfferingModal.modalities.online.label'),
            description: t('instructorDashboard.createOfferingModal.modalities.online.description'),
        },
        OFFLINE: {
            label: t('instructorDashboard.createOfferingModal.modalities.offline.label'),
            description: t('instructorDashboard.createOfferingModal.modalities.offline.description'),
        },
        HYBRID: {
            label: t('instructorDashboard.createOfferingModal.modalities.hybrid.label'),
            description: t('instructorDashboard.createOfferingModal.modalities.hybrid.description'),
        },
    };

    const scheduleBlocks = form.scheduleBlocks || [];
    const selectedCourse = normalizedCourses.find((course) => String(course.id) === String(form.courseId));

    // Reset form when modal opens
    useEffect(() => {
        if (form) {
            setCurrentStep(1);
            setErrors({});
        }
    }, [form]);

    const handleBlockChange = (index, field, value) => {
        const next = scheduleBlocks.map((block, idx) =>
            idx === index ? { ...block, [field]: value } : block
        );
        onChange('scheduleBlocks', next);
    };

    const handleBlockAdd = () => {
        onChange('scheduleBlocks', [...scheduleBlocks, { day: '', startTime: '', endTime: '' }]);
    };

    const handleBlockRemove = (index) => {
        onChange(
            'scheduleBlocks',
            scheduleBlocks.filter((_, idx) => idx !== index)
        );
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!form.courseId) {
                newErrors.courseId = t('instructorDashboard.createOfferingModal.validation.courseRequired');
            }
            if (!form.modality) {
                newErrors.modality = t('instructorDashboard.createOfferingModal.validation.modalityRequired');
            }
            if (!form.price || form.price < 0) {
                newErrors.price = t('instructorDashboard.createOfferingModal.validation.priceRequired');
            }
        }

        if (step === 2) {
            if (!scheduleBlocks || scheduleBlocks.length === 0) {
                newErrors.schedule = t('instructorDashboard.createOfferingModal.validation.scheduleRequired');
            }

            scheduleBlocks.forEach((block, index) => {
                if (!block.day) {
                    newErrors[`day_${index}`] = t('instructorDashboard.createOfferingModal.validation.dayRequired');
                }
                if (!block.startTime) {
                    newErrors[`startTime_${index}`] = t('instructorDashboard.createOfferingModal.validation.startTimeRequired');
                }
                if (!block.endTime) {
                    newErrors[`endTime_${index}`] = t('instructorDashboard.createOfferingModal.validation.endTimeRequired');
                }
                if (block.startTime && block.endTime && block.startTime >= block.endTime) {
                    newErrors[`time_${index}`] = t('instructorDashboard.createOfferingModal.validation.timeInvalid');
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (validateStep(currentStep)) {
            await onSubmit();
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instructorDashboard.createOfferingModal.fields.course')} *
                            </label>
                            <div className="relative">
                                <select
                                    value={form.courseId}
                                    onChange={(e) => onChange('courseId', e.target.value)}
                                    disabled={creating}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors ${errors.courseId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    aria-describedby="courseId-error"
                                >
                                    <option value="">{t('instructorDashboard.createOfferingModal.placeholders.course')}</option>
                                    {normalizedCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {errors.courseId && (
                                    <p id="courseId-error" className="text-red-500 text-xs mt-1">
                                        {errors.courseId}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modality Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instructorDashboard.createOfferingModal.fields.modality')} *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {MODALITY_OPTIONS.map((key) => (
                                    <label
                                        key={key}
                                        className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${form.modality === key
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="modality"
                                            value={key}
                                            checked={form.modality === key}
                                            onChange={(e) => onChange('modality', e.target.value)}
                                            disabled={creating}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.modality === key
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {form.modality === key && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {modalityCopy[key].label}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {modalityCopy[key].description}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.modality && (
                                <p className="text-red-500 text-xs mt-2">
                                    {errors.modality}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instructorDashboard.createOfferingModal.fields.price')} *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">
                                        {t('instructorDashboard.createOfferingModal.currency')}
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => onChange('price', e.target.value)}
                                    disabled={creating}
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
                                {t('instructorDashboard.createOfferingModal.priceHelp')}
                            </p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                {t('instructorDashboard.createOfferingModal.fields.schedule')}
                            </label>
                            <div className="space-y-3">
                                {scheduleBlocks.map((block, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {t('instructorDashboard.createOfferingModal.schedule.blockNumber', {
                                                    number: index + 1,
                                                })}
                                            </h4>
                                            {scheduleBlocks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleBlockRemove(index)}
                                                    disabled={creating}
                                                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                                    aria-label={t('instructorDashboard.createOfferingModal.schedule.deleteAria', {
                                                        number: index + 1,
                                                    })}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116 21H8a2 2 0 01-2-2V7a2 2 0 012-2h4zM10 9v6m4-6v6" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    {t('instructorDashboard.createOfferingModal.schedule.day')} *
                                                </label>
                                                <select
                                                    value={block.day}
                                                    onChange={(e) => handleBlockChange(index, 'day', e.target.value)}
                                                    disabled={creating}
                                                    className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm ${errors[`day_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">{t('instructorDashboard.createOfferingModal.placeholders.select')}</option>
                                                    {WEEKDAYS.map((day) => (
                                                        <option key={day} value={day}>
                                                            {t(`instructorDashboard.createOfferingModal.weekdays.${day}`)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`day_${index}`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`day_${index}`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    {t('instructorDashboard.createOfferingModal.schedule.startTime')} *
                                                </label>
                                                <input
                                                    type="time"
                                                    value={block.startTime}
                                                    onChange={(e) => handleBlockChange(index, 'startTime', e.target.value)}
                                                    disabled={creating}
                                                    className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm ${errors[`startTime_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {errors[`startTime_${index}`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`startTime_${index}`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    {t('instructorDashboard.createOfferingModal.schedule.endTime')} *
                                                </label>
                                                <input
                                                    type="time"
                                                    value={block.endTime}
                                                    onChange={(e) => handleBlockChange(index, 'endTime', e.target.value)}
                                                    disabled={creating}
                                                    className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm ${errors[`endTime_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                {errors[`endTime_${index}`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`endTime_${index}`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {errors[`time_${index}`] && (
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors[`time_${index}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.schedule && (
                                <p className="text-red-500 text-sm">
                                    {errors.schedule}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleBlockAdd}
                                disabled={creating}
                                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H8m8 0l-8 8" />
                                </svg>
                                {t('instructorDashboard.createOfferingModal.actions.addSchedule')}
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                                {t('instructorDashboard.createOfferingModal.review.title')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                                    <span className="text-sm text-green-900 dark:text-green-100">
                                        {t('instructorDashboard.createOfferingModal.review.course', {
                                            course: selectedCourse?.title || t('instructorDashboard.createOfferingModal.fallbacks.notSelected'),
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                                    <span className="text-sm text-green-900 dark:text-green-100">
                                        {t('instructorDashboard.createOfferingModal.review.modality', {
                                            modality: modalityCopy[form.modality]?.label || t('instructorDashboard.createOfferingModal.fallbacks.notSelected'),
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                                    <span className="text-sm text-green-900 dark:text-green-100">
                                        {t('instructorDashboard.createOfferingModal.review.price', {
                                            price: form.price
                                                ? t('instructorDashboard.createOfferingModal.review.priceValue', {
                                                    price: form.price,
                                                })
                                                : t('instructorDashboard.createOfferingModal.review.free'),
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                                    <span className="text-sm text-green-900 dark:text-green-100">
                                        {t('instructorDashboard.createOfferingModal.review.scheduleCount', {
                                            count: scheduleBlocks.length,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t('instructorDashboard.createOfferingModal.review.confirm', {
                                action: mode === 'edit'
                                    ? t('instructorDashboard.createOfferingModal.actions.update')
                                    : t('instructorDashboard.createOfferingModal.actions.create'),
                            })}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return t('instructorDashboard.createOfferingModal.steps.basic');
            case 2: return t('instructorDashboard.createOfferingModal.steps.schedule');
            case 3: return t('instructorDashboard.createOfferingModal.steps.review');
            default: return '';
        }
    };

    const getStepActions = () => {
        switch (currentStep) {
            case 1:
                return [
                    {
                        id: 'cancel',
                        label: t('instructorDashboard.createOfferingModal.actions.cancel'),
                        onClick: onClose,
                        variant: 'secondary',
                        disabled: creating
                    },
                    {
                        id: 'next',
                        label: t('instructorDashboard.createOfferingModal.actions.next'),
                        onClick: handleNext,
                        variant: 'primary',
                        disabled: creating
                    }
                ];
            case 2:
                return [
                    {
                        id: 'previous',
                        label: t('instructorDashboard.createOfferingModal.actions.back'),
                        onClick: handlePrevious,
                        variant: 'secondary',
                        disabled: creating
                    },
                    {
                        id: 'next',
                        label: t('instructorDashboard.createOfferingModal.actions.review'),
                        onClick: handleNext,
                        variant: 'primary',
                        disabled: creating
                    }
                ];
            case 3:
                return [
                    {
                        id: 'previous',
                        label: t('instructorDashboard.createOfferingModal.actions.back'),
                        onClick: handlePrevious,
                        variant: 'secondary',
                        disabled: creating
                    },
                    {
                        id: 'submit',
                        label: mode === 'edit'
                            ? t('instructorDashboard.createOfferingModal.actions.update')
                            : t('instructorDashboard.createOfferingModal.actions.create'),
                        onClick: handleSubmit,
                        variant: 'primary',
                        loading: creating
                    }
                ];
            default:
                return [];
        }
    };

    return (
        <AdvancedModal
            isOpen={!!form}
            onClose={onClose}
            title={t('instructorDashboard.createOfferingModal.header.title', {
                title: mode === 'edit'
                    ? t('instructorDashboard.createOfferingModal.header.editTitle')
                    : t('instructorDashboard.createOfferingModal.header.createTitle'),
                step: currentStep,
                total: 3,
            })}
            subtitle={getStepTitle()}
            size="2xl"
            variant="default"
            loading={creating}
            preventClose={creating}
            actions={getStepActions()}
        >
            {/* Progress Indicator */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step
                                ? 'bg-blue-600 text-white'
                                : currentStep > step
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                                }`}>
                                {currentStep > step ? '✓' : step}
                            </div>
                            {step < 3 && (
                                <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {renderStepContent()}
            </div>
        </AdvancedModal>
    );
};

CreateOfferingModal.propTypes = {
    courses: courseCollectionShape,
    form: PropTypes.object,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    creating: PropTypes.bool,
    mode: PropTypes.oneOf(['create', 'edit']),
};

export default CreateOfferingModal;
