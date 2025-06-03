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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 13);
            setFormData((prev) => ({ ...prev, phone: digitsOnly }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitContactMessage(formData);
            toast.success('Билдирүү ийгиликтүү жөнөтүлдү!');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact submission failed:', error);
            toast.error('Билдирүү жөнөтүлбөй калды. Кайра аракет кылыңыз.');
        }
    };

    return (
        <div className="bg-white min-h-screen px-4 py-12 md:px-16 text-gray-800">
            <Toaster position="top-center" />
            <div className="max-w-6xl mx-auto">

                <div className="mb-6 mt-10 flex items-center gap-4 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#0EA78B]">Байланышуу</h1>
                    <div className='pt-2'>
                        <Link
                            to="/"
                            className="text-[#334155] pl-6 cursor-pointer no-underline hover:text-[#334155]"
                        >
                            Башкы бет
                        </Link>
                        <span className="mx-1">&gt;</span>
                        <span className="text-[#0EA78B] font-medium">Байланыш</span>
                    </div>
                </div>

                <p className="mb-10 text-lg">
                    Суроолоруңуз барбы? Төмөнкү форма аркылуу биз менен байланышсаңыз болот же түз байланыш маалыматтарыбызды колдонсоңуз болот.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {[
                            { label: 'Атыңыз', name: 'name', type: 'text' },
                            { label: 'Электрондук почта', name: 'email', type: 'email' },
                            { label: 'Тема', name: 'subject', type: 'text' },
                        ].map(({ label, name, type }) => (
                            <div key={name}>
                                <label className="block mb-1 font-medium">{label}</label>
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
                            <label className="block mb-1 font-medium">Телефон номери</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={13}
                                required
                                className="w-full border border-[#0EA78B] rounded-[10px] px-3 py-2 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Билдирүү</label>
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
                            <h2 className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={MailIcon} alt="mail" className="w-5 h-5" /> Электрондук почта
                            </h2>
                            <p>
                                <a href="mailto:jardam.edubot_learning@outlook.com" className="text-[#122144] underline">
                                    jardam.edubot_learning@outlook.com
                                </a>
                            </p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={MapPinIcon} alt="address" className="w-5 h-5" /> Дарек
                            </h2>
                            <p>Турусбеков 109/1, 4-кабат, Бишкек, Кыргызстан</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={PhoneIcon} alt="phone" className="w-5 h-5" /> WhatsApp
                            </h2>
                            <p>
                                <a href="https://wa.me/996503677798" className="text-[#122144] underline">
                                    +996 503 677 798
                                </a>
                            </p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={InstagramIcon} alt="instagram" className="w-5 h-5" /> Instagram
                            </h2>
                            <p>
                                <a href="https://www.instagram.com/edubot.company/" target="_blank" className="text-[#122144] underline">
                                    @edubot.company
                                </a>
                            </p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-[#0EA78B] flex items-center gap-2">
                                <img src={ClockIcon} alt="clock" className="w-5 h-5" /> Иштөө убактысы
                            </h2>
                            <p>Дүйшөмбү — Жума, 9:00 — 18:00 (Бишкек убактысы)</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 px-4 md:px-0">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.348249525932!2d74.59004331548586!3d42.87013037915568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb7b3276c0b2d%3A0x8f63e8bc06a52c57!2s109%2F1%20Turusbekov%20St%2C%20Bishkek%2C%20Kyrgyzstan!5e0!3m2!1sen!2skg!4v1712844064853!5m2!1sen!2skg"
                        className="w-full max-w-4xl mx-auto"
                        height="300"
                        style={{ border: 0, borderRadius: '20px' }}
                        allowFullScreen=""
                        loading="lazy"
                    
                        referrerPolicy="no-referrer-when-downgrade"
                        title="EduBot Location"
                    ></iframe>
                </div>
                
            </div>
        </div>
    );
};

export default ContactPage;
