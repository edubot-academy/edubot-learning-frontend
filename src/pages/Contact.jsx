import React, { useState } from 'react';
import { submitContactMessage } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (formData.name.trim().length < 2) {
            newErrors.name = 'Атыңыз кеминде 2 белгиден турушу керек.';
        }

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            newErrors.email = 'Туура электрондук почта киргизиңиз.';
        }

        if (!/^\d{9,13}$/.test(formData.phone)) {
            newErrors.phone = 'Телефон номери 9–13 цифрадан турушу керек.';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Тема бош болбошу керек.';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Билдирүү бош болбошу керек.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Ограничение для поля phone: только цифры и максимум 13 символов
        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return; // только цифры
            if (value.length > 13) return; // максимум 13
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await submitContactMessage(formData);
            toast.success('Билдирүү ийгиликтүү жөнөтүлдү!');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setErrors({});
        } catch (error) {
            toast.error('Билдирүү жөнөтүлбөй калды. Кайра аракет кылыңыз.');
        }
    };

    return (
        <div className="bg-white min-h-screen px-4 py-12 md:px-16 text-gray-800">
            <Toaster position="top-center" />
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 mt-10">
                    <h1 className="text-3xl font-bold text-[#0EA78B]">Байланышуу</h1>
                    <div className="pt-2 flex items-center gap-2">
                        <Link to="/" className="text-[#334155] pl-6 cursor-pointer no-underline hover:text-[#334155]">
                            Башкы бет
                        </Link>
                        <span className="mx-1">&gt;</span>
                        <span className="text-[#0EA78B] font-medium">Байланыш</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                    {[
                        { label: 'Атыңыз', name: 'name', type: 'text' },
                        { label: 'Электрондук почта', name: 'email', type: 'email' },
                        { label: 'Телефон номери', name: 'phone', type: 'tel' },
                        { label: 'Тема', name: 'subject', type: 'text' },
                    ].map(({ label, name, type }) => (
                        <div key={name}>
                            {errors[name] && <p className="text-red-500 text-sm mb-1">{errors[name]}</p>}
                            <label className="block font-medium">{label}</label>
                            <input
                                type={type}
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                required
                                className="w-full border border-[#0EA78B] rounded-[10px] px-3 py-2 focus:outline-none"
                            />
                        </div>
                    ))}

                    <div>
                        {errors.message && <p className="text-red-500 text-sm mb-1">{errors.message}</p>}
                        <label className="block font-medium">Билдирүү</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={4}
                            required
                            className="w-full border border-[#0EA78B] rounded-[10px] px-3 py-2 focus:outline-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="bg-[#0EA78B] text-white py-3 rounded-[10px] w-full hover:bg-opacity-90 transition"
                    >
                        Жөнөтүү
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;
