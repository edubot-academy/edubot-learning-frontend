import React, { useState } from 'react';
import { submitContactMessage } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import MailIcon from '../assets/icons/blue-mail.svg';
import MapPinIcon from '../assets/icons/blue-map.svg';
import PhoneIcon from '../assets/icons/whatsapp.svg';
import InstagramIcon from '../assets/icons/instagram.svg';
import ClockIcon from '../assets/icons/clock.svg';

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

        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 13) return;
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
                    <h1 className="text-3xl font-bold text-black">Байланышуу</h1>
                    <div className="pt-2 flex items-center gap-2 text-sm">
                        <Link
                            to="/"
                            className="text-[#334155] cursor-pointer no-underline hover:text-[#334155]"
                        >
                            Башкы бет
                        </Link>
                        <span className="text-gray-400">{'>'}</span>
                        <span className="text-[#0EA78B] font-medium">Байланыш</span>
                    </div>
                </div>


                <p className="mb-10 text-lg">
                    Суроолоруңуз барбы? Төмөнкү форма аркылуу биз менен байланышсаңыз болот же түз байланыш маалыматтарыбызды колдонсоңуз болот.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                        {[
                            { label: 'Атыңыз', name: 'name', type: 'text' },
                            { label: 'Электронная почта', name: 'email', type: 'email' },
                            { label: 'Телефон номери', name: 'phone', type: 'tel' },
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

                    <div className="space-y-6 text-lg">
                        <div>
                            <div className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={PhoneIcon} alt="phone" className="w-5 h-5" /> WhatsApp
                            </div>
                            <a href="https://wa.me/996503677798" className="text-[#122144] underline">
                                +996 503 677 798
                            </a>
                        </div>

                        <div>
                            <div className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={InstagramIcon} alt="instagram" className="w-5 h-5" /> Instagram
                            </div>
                            <a href="https://www.instagram.com/edubot.company/" target="_blank" className="text-[#122144] underline">
                                @edubot.company
                            </a>
                        </div>
                        <div>
                            <div className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={MailIcon} alt="mail" className="w-5 h-5" /> Электрондук почта
                            </div>
                            <a href="mailto:jardam.edubot_learning@outlook.com" className="text-[#122144] underline">
                                jardam.edubot_learning@outlook.com
                            </a>
                        </div>

                        <div>
                            <div className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={MapPinIcon} alt="address" className="w-5 h-5" /> Дарек
                            </div>
                            <p>Турусбеков 109/1, 4-кабат, Бишкек, Кыргызстан</p>
                        </div>

                        <div>
                            <div className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={ClockIcon} alt="clock" className="w-5 h-5" /> Иштөө убактысы
                            </div>
                            <p>Дүйшөмбү — Жума, 9:00 — 21:00 (Бишкек убактысы)</p>
                        </div>
                    </div>

                </div>

                <div className="mt-16 max-w-3xl mx-auto">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.348249525932!2d74.59004331548586!3d42.87013037915568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb7b3276c0b2d%3A0x8f63e8bc06a52c57!2s109%2F1%20Turusbekov%20St%2C%20Bishkek%2C%20Kyrgyzstan!5e0!3m2!1sen!2skg!4v1712844064853!5m2!1sen!2skg"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="EduBot Location"
                        className="rounded-xl"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
