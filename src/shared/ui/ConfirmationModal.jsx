import PropTypes from 'prop-types';
import AdvancedModal from './AdvancedModal';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Ырастоо',
    cancelLabel = 'Жокко чыгаруу',
    confirmVariant = 'danger',
    loading = false,
}) => (
    <AdvancedModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={message}
        size="sm"
        variant={confirmVariant === 'danger' ? 'danger' : 'warning'}
        actions={[
            {
                id: 'cancel',
                label: cancelLabel,
                onClick: onClose,
                variant: 'secondary',
                disabled: loading,
            },
            {
                id: 'confirm',
                label: confirmLabel,
                onClick: onConfirm,
                variant: confirmVariant,
                loading,
            },
        ]}
    >
        <div className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 text-sm leading-6 text-edubot-muted dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            Бул аракетти улантсаңыз, өзгөртүү дароо колдонулат.
        </div>
    </AdvancedModal>
);

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
