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
}) => (
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
                title="Delivery курсту өзгөртүү"
                subtitle="Оффлайн же онлайн түз эфир курсунун негизги маалыматын жаңыртыңыз."
                submitLabel="Сактоо"
            />
        )}
    </>
);

export default DeliveryCourseModalController;
