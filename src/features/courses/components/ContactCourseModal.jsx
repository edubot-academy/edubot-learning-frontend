import React, { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import BasicModal from '@shared/ui/BasicModal';

const ContactCourseModal = ({ isOpen, onClose, course, lessonCount }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (formData.name.trim().length < 2) {
            newErrors.name = 'Атыңыз кеминде 2 белгиден турушу керек.';
        }
        if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            newErrors.email = 'Туура электрондук почта киргизиңиз.';
        }
        if (!/^\d{9,13}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Телефон номери 9–13 цифрадан турушу керек.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const cleanedValue = value.replace(/[^\d+\s-()]/g, '');
            if (cleanedValue.replace(/\D/g, '').length > 13) return;
            setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            // TODO: wire to backend when available
            toast.success('Сурам ийгиликтүү жөнөтүлдү');
            onClose?.();
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error('Жөнөтүүдө ката кетти:', error);
            toast.error('Жөнөтүүдө ката кетти');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BasicModal
            isOpen={isOpen}
            onClose={onClose}
            title="Байланышуу"
            size="md"
            darkMode
        >
            <div className="p-1">
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 
                    dark:from-orange-900/20 dark:bg-gray-800
                    rounded-lg border border-orange-100 dark:border-orange-800/30">
                    <h3 className="font-bold text-lg mb-2 text-[#EA580C] dark:text-orange-400">
                        Курс: {course?.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Баасы:</span>
                            <span className="font-bold text-gray-800 dark:text-white ml-2">
                                ${course?.price}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Сабактын саны:</span>
                            <span className="font-bold text-gray-800 dark:text-white ml-2">
                                {lessonCount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Имя */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Аты-жөнүңүз *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition-all duration-200 
                                ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder="Сиздин толук атыңыз"
                        />
                        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Телефон */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Телефон номериңиз *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition-all duration-200 
                                ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder="+996 ___ __ __ __"
                        />
                        {errors.phone && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Электрондук почтаңыз *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition-all duration-200 
                                ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                dark:text-white dark:placeholder-gray-400`}
                            placeholder="example@mail.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Сообщение */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                            Суроо же сунушуңуз
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="3"
                            disabled={isSubmitting}
                            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:focus:ring-orange-500 transition resize-none
                                ${isSubmitting ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
                                border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                            placeholder="Бул курс боюнча суроолоруңуз..."
                        />
                    </div>

                    {/* Кнопки */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                                border border-gray-300 dark:border-gray-600 rounded-lg 
                                hover:bg-gray-50 dark:hover:bg-gray-700 
                                transition-colors duration-200 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Жокко чыгаруу
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 
                                ${isSubmitting
                                    ? 'bg-[#FF8C6E] dark:bg-orange-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#EA580C] to-[#E14219] dark:from-orange-600 dark:to-red-700 hover:from-[#d64d0b] hover:to-[#c13613] dark:hover:from-orange-700 dark:hover:to-red-800'
                                }`}
                        >
                            {isSubmitting ? 'Жөнөтүлүүдө...' : 'Жөнөтүү'}
                        </button>
                    </div>
                </form>
            </div>
        </BasicModal>
    );
};

ContactCourseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    course: PropTypes.shape({
        title: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    lessonCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ContactCourseModal;