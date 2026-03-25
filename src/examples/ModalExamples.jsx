import React, { useState } from 'react';
import AdvancedModal from '@shared/ui/AdvancedModal';

// Example 1: Basic Confirmation Modal
const ConfirmationModalExample = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Өчүрүүн ырастоо"
            subtitle="Бул аракетти кайтаруу мүмкүн эмес"
            size="sm"
            variant="danger"
            actions={[
                {
                    id: 'cancel',
                    label: 'Жокко чыгаруу',
                    onClick: () => setIsOpen(false),
                    variant: 'secondary'
                },
                {
                    id: 'confirm',
                    label: 'Өчүрүү',
                    onClick: () => setIsOpen(false),
                    variant: 'primary'
                }
            ]}
        >
            <div className="text-center py-4">
                <p className="text-gray-700 dark:text-gray-300">
                    Бул аракетти чындай жасагыңыз келет?
                </p>
            </div>
        </AdvancedModal>
    );
};

// Example 2: Form Modal with Loading State
const FormModalExample = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoading(false);
            setIsOpen(false);
            // Handle success
        } catch (error) {
            setLoading(false);
            // Handle error
        }
    };

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={() => !loading && setIsOpen(false)}
            title="Байланыш формасы"
            subtitle="Маалыматты өчүрүүгө ишенимдүүсүзбү?"
            size="lg"
            loading={loading}
            preventClose={loading}
            actions={[
                {
                    id: 'cancel',
                    label: 'Жокко чыгаруу',
                    onClick: () => setIsOpen(false),
                    variant: 'secondary',
                    disabled: loading
                },
                {
                    id: 'submit',
                    label: 'Жөнөтүү',
                    onClick: handleSubmit,
                    variant: 'primary',
                    loading: loading
                }
            ]}
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Аты
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={loading}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Атыңызды киргизиңиз"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Электрондук почта
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={loading}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="email@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Билдирүү
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        disabled={loading}
                        rows={4}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                        placeholder="Билдирүүңүздү жазыңыз"
                    />
                </div>
            </form>
        </AdvancedModal>
    );
};

// Example 3: Success Modal with Auto Close
const SuccessModalExample = () => {
    const [isOpen, setIsOpen] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Ийгиликтүү!"
            subtitle="Операция ийгиликтүү бүттү"
            size="md"
            variant="success"
            animation="bounce"
            showCloseButton={false}
        >
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    ✓
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Операция ийгиликтүү бүттү!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Бул терезе 3 секунддан кийин автоматтык түрдө жабылат.
                </p>
            </div>
        </AdvancedModal>
    );
};

// Example 4: Media Modal (Full Size)
const MediaModalExample = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AdvancedModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Медиа кароо"
            size="full"
            animation="fade"
            showCloseButton={true}
        >
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <img
                        src="https://picsum.photos/800/600"
                        alt="Example image"
                        className="max-w-full max-h-[70vh] rounded-lg"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg">
                        <p className="text-sm font-medium">Медиа сүрөтү</p>
                    </div>
                </div>
            </div>
        </AdvancedModal>
    );
};

export {
    ConfirmationModalExample,
    FormModalExample,
    SuccessModalExample,
    MediaModalExample
};
