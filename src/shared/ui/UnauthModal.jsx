import { useNavigate } from 'react-router-dom';
import Button from '@shared-ui/Button';
import BasicModal from '@shared-ui/BasicModal';
import { getAuthAcquisitionPath } from '@shared/auth-config';

const UnauthModal = ({
    isOpen,
    onClose,
    actionType = 'favourite',
    courseId = null,
    courseTitle = '',
    course = null,
}) => {
    const navigate = useNavigate();
    const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    const storePendingAction = () => {
        if (!courseId) return;

        const pendingAction = {
            type: actionType,
            courseId,
            courseTitle,
            course,
            timestamp: Date.now(),
        };
        localStorage.setItem('pendingAction', JSON.stringify(pendingAction));
    };

    const handleRegister = () => {
        storePendingAction();

        onClose();
        navigate(getAuthAcquisitionPath(), {
            state: {
                from: returnPath,
                actionType,
                courseId,
                courseTitle,
            },
        });
    };

    const handleLogin = () => {
        storePendingAction();

        onClose();
        navigate('/login', {
            state: {
                from: returnPath,
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
                return 'себеттеги сурамды улантуу';
            default:
                return 'бул аракетти аткаруу';
        }
    };

    return (
        <BasicModal isOpen={isOpen} onClose={onClose} title='Каттоо талап кылынат' size="md">
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        {actionType === 'favourite' ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 text-orange-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
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
                                aria-hidden="true"
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
                        <h3 className="font-bold">
                            Кириңиз же катталыңыз
                        </h3>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300">
                    {courseTitle && actionType === 'favourite' ? (
                        <>
                            Курсту тандалгандарга кошуу үчүн каттодон өтүү керек
                        </>
                    ) : courseTitle && actionType === 'cart' ? (
                        <>
                            Себет боюнча сурамды улантуу үчүн кириңиз же катталыңыз.
                            Себетиңиз жана бул аракет сакталат.
                        </>
                    ) : (
                        <>{getActionText()} үчүн каттоо талап кылынат.</>
                    )}
                </p>

                <div className="space-y-3 pt-2">
                    <Button type="button" variant="primary" onClick={handleRegister} className="w-full py-3">
                        Катталуу
                    </Button>

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full rounded-lg border border-blue-200 px-4 py-2 text-center font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-950/30"
                        >
                            Кирүү
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Баракчада калуу
                        </button>
                    </div>
                </div>
            </div>
        </BasicModal>
    );
};

export default UnauthModal;
