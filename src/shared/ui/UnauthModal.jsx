import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@shared-ui/Button';
import Modal from '@shared-ui/Modal';

const UnauthModal = ({
    isOpen,
    onClose,
    actionType = 'favourite',
    courseId = null,
    courseTitle = '',
}) => {
    const navigate = useNavigate();

    const handleRegister = () => {
        if (courseId) {
            const pendingAction = {
                type: actionType,
                courseId,
                courseTitle,
                timestamp: Date.now(),
            };
            localStorage.setItem('pendingAction', JSON.stringify(pendingAction));
        }

        onClose();
        navigate('/register', {
            state: {
                from: window.location.pathname,
                actionType,
                courseId,
                courseTitle,
            },
        });
    };

    const handleLogin = () => {
        if (courseId) {
            const pendingAction = {
                type: actionType,
                courseId,
                courseTitle,
                timestamp: Date.now(),
            };
            localStorage.setItem('pendingAction', JSON.stringify(pendingAction));
        }

        onClose();
        navigate('/login', {
            state: {
                from: window.location.pathname,
                actionType,
                courseId,
                courseTitle,
            },
        });
    };

    const getActionText = () => {
        switch (actionType) {
            case 'favourite':
                return 'жактырылгандарга кошуу';
            case 'cart':
                return 'сооданы улантуу';
            default:
                return 'бул аракетти аткаруу';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Каттоо талап кылынат" size="md">
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        {actionType === 'favourite' ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 text-orange-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 text-orange-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold">Кириңиз же катталыңыз</h3>
                    </div>
                </div>

                <p className="text-gray-600">
                    {courseTitle && actionType === 'favourite' ? (
                        <>
                            Курсту тандалгандарга кошуу үчүн каттодон өтүү керек
                        </>
                    ) : courseTitle && actionType === 'cart' ? (
                        <>
                            Курска заказ берүү үчүн "
                            <span className="font-semibold">{courseTitle}</span>"каттоо талап
                            кылынат.
                        </>
                    ) : (
                        <>Для {getActionText()} каттоо талап кылынат.</>
                    )}
                </p>

                <div className="space-y-3 pt-2">
                    <Button variant="primary" onClick={handleRegister} className="w-full py-3">
                        Катталуу
                    </Button>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleLogin}
                            className="text-blue-600 hover:text-blue-800 font-medium py-2"
                        >
                            Каттоо эсебиңиз барбы? Кирүү
                        </button>

                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 py-2 text-sm"
                        >
                            Баракчада калуу
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default UnauthModal;
