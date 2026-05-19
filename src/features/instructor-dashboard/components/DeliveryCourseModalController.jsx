import { useTranslation } from 'react-i18next';
import CreateDeliveryCourseModal from './modals/CreateDeliveryCourseModal.jsx';

const DeliveryCourseModalController = ({
    showDeliveryModal,
    onCloseDeliveryModal,
    onCreateDeliveryCourse,
    creatingDeliveryCourse,
    showEditDeliveryModal,
    onCloseEditDeliveryModal,
    onUpdateDeliveryCourse,
    updatingDeliveryCourse,
    editingDeliveryCourse,
    deliveryCategories,
}) => {
    const { t } = useTranslation();

    return (
        <>
            {showDeliveryModal && (
                <CreateDeliveryCourseModal
                    isOpen={showDeliveryModal}
                    onClose={onCloseDeliveryModal}
                    onCreateDeliveryCourse={onCreateDeliveryCourse}
                    creatingDeliveryCourse={creatingDeliveryCourse}
                    deliveryCategories={deliveryCategories}
                />
            )}
            {showEditDeliveryModal && (
                <CreateDeliveryCourseModal
                    isOpen={showEditDeliveryModal}
                    onClose={onCloseEditDeliveryModal}
                    onCreateDeliveryCourse={onUpdateDeliveryCourse}
                    creatingDeliveryCourse={updatingDeliveryCourse}
                    deliveryCategories={deliveryCategories}
                    initialValues={editingDeliveryCourse}
                    title={t('instructorDashboard.deliveryCourseModal.header.editTitle')}
                    subtitle={t('instructorDashboard.deliveryCourseModal.header.editSubtitle')}
                    submitLabel={t('instructorDashboard.deliveryCourseModal.actions.save')}
                />
            )}
        </>
    );
};

export default DeliveryCourseModalController;
