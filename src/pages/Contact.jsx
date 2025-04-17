import React, { useState } from 'react';
import { submitContactMessage } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

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
        setFormData((prev) => ({ ...prev, [name]: value }));
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
        <div className="bg-white min-h-screen px-4 py-24 md:px-20 text-gray-800">
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-6">Байланышуу</h1>

                <p className="mb-6 text-lg">Суроолоруңуз барбы? Төмөнкү форма аркылуу биз менен байланышсаңыз болот же түз байланыш маалыматтарыбызды колдонсоңуз болот.</p>

                <div className="grid md:grid-cols-2 gap-10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Атыңыз</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Электрондук почта</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Телефон номери</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Тема</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2"
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
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            ></textarea>
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">Жөнөтүү</button>
                    </form>

                    <div className="space-y-4 text-lg">
                        <div>
                            <h2 className="font-semibold text-blue-600">📧 Электрондук почта</h2>
                            <p><a href="mailto:jardam.edubot_learning@outlook.com" className="text-blue-500 underline">jardam.edubot_learning@outlook.com</a></p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-blue-600">📍 Дарек</h2>
                            <p>Турусбеков 109/1, 4-кабат, Бишкек, Кыргызстан</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-blue-600">📱 WhatsApp</h2>
                            <p><a href="https://wa.me/996503677798" className="text-blue-500 underline">+996 503 677 798</a></p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-blue-600">📸 Instagram</h2>
                            <p><a href="https://www.instagram.com/edubot.company/" target="_blank" className="text-blue-500 underline">@edubot.company</a></p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-blue-600">🕒 Иштөө убактысы</h2>
                            <p>Дүйшөмбү — Жума, 9:00 — 18:00 (Бишкек убактысы)</p>
                        </div>
                    </div>
                </div>

                {/* Google Map moved after contact section */}
                <div className="mt-10">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.348249525932!2d74.59004331548586!3d42.87013037915568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb7b3276c0b2d%3A0x8f63e8bc06a52c57!2s109%2F1%20Turusbekov%20St%2C%20Bishkek%2C%20Kyrgyzstan!5e0!3m2!1sen!2skg!4v1712844064853!5m2!1sen!2skg"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
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
