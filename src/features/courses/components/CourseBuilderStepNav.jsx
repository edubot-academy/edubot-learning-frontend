import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const CourseBuilderStepNav = ({ step, onStepChange, items = [] }) => {
    const { t } = useTranslation();
    // Map step keys to step numbers
    const keyToStepNumber = {
        'info': 1,
        'curriculum': 2,
        'media': 3,
    };

    return (
        <nav
            aria-label={t('instructorDashboard.courseBuilder.aria.steps')}
            className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#111111]"
        >
            {items.map((item, index) => {
                const stepNumber = keyToStepNumber[item.key];
                const isCurrent = step === stepNumber;
                const stateLabel = isCurrent
                    ? t('instructorDashboard.courseBuilder.aria.currentStep')
                    : item.completed
                        ? t('instructorDashboard.courseBuilder.aria.completedStep')
                        : t('instructorDashboard.courseBuilder.aria.incompleteStep');

                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onStepChange(stepNumber)}
                        disabled={!item.enabled}
                        aria-current={isCurrent ? 'step' : undefined}
                        aria-disabled={!item.enabled}
                        aria-label={`${index + 1}. ${item.label}: ${stateLabel}`}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${isCurrent
                                ? 'bg-slate-900 text-white dark:bg-blue-950'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-[#1c1c1c] dark:text-slate-200'
                            }`}
                    >
                        {index + 1}. {item.label}
                    </button>
                );
            })}
        </nav>
    );
};

CourseBuilderStepNav.propTypes = {
    step: PropTypes.number.isRequired,
    onStepChange: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            completed: PropTypes.bool,
            enabled: PropTypes.bool.isRequired,
        })
    ),
};

export default CourseBuilderStepNav;
