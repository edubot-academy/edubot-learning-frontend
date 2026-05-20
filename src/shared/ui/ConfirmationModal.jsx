import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AdvancedModal from './AdvancedModal';

const MODAL_VARIANT_BY_CONFIRM_VARIANT = {
    danger: 'danger',
    primary: 'info',
    success: 'success',
};

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    confirmVariant = 'danger',
    loading = false,
}) => {
    const { t } = useTranslation();

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={message}
            size="sm"
            loading={loading}
            variant={MODAL_VARIANT_BY_CONFIRM_VARIANT[confirmVariant] || 'warning'}
            actions={[
                {
                    id: 'cancel',
                    label: cancelLabel || t('confirmationModal.cancel'),
                    onClick: onClose,
                    variant: 'secondary',
                    disabled: loading,
                },
                {
                    id: 'confirm',
                    label: confirmLabel || t('confirmationModal.confirm'),
                    onClick: onConfirm,
                    variant: confirmVariant,
                    loading,
                    disabled: loading,
                },
            ]}
        >
            <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 text-sm leading-6 text-edubot-muted dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                {t('confirmationModal.defaultBody')}
            </div>
        </AdvancedModal>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    confirmVariant: PropTypes.oneOf(['primary', 'danger', 'success']),
    loading: PropTypes.bool,
};

export default ConfirmationModal;
