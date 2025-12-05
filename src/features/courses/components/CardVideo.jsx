import React, {useState} from 'react';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import Button from '@shared/ui/Button';
import { FaPlay } from 'react-icons/fa';
import Modal from '../../../shared/ui/Modal'

const CardVideo = ({ coverImageUrl, course, lessonCount }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (formData.name.trim().length < 2) {
            newErrors.name = "Атыңыз кеминде 2 белгиден турушу керек.";
        }
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            newErrors.email = "Туура электрондук почта киргизиңиз.";
        }
        if (!/^\d{9,13}$/.test(formData.phone)) {
            newErrors.phone = "Телефон номери 9–13 цифрадан турушу керек.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 13) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSubmitting(true);
        try {
           
            console.log("Отправка данных:", formData);
            setModalOpen(false);
            setFormData({ name: "", email: "", phone: "", message: "" });
        } catch (error) {
            console.error("Ошибка отправки:", error);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <>
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-[90vw] sm:w-[70vw] md:w-[40vw] lg:w-[30vw] max-w-[420px] px-4 py-5 m-5">
            <div className="relative w-full ">
                <img
                    src={coverImageUrl}
                    className="max-h-52 w-full object-cover rounded"
                    alt="courseImage"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition rounded-md">
                    <button className="bg-white/35 rounded-full p-4">
                        <FaPlay className="text-[#EA580C] text-2xl pl-1" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 py-4">
                <div className="flex items-center justify-between text-gray-700">
                    <p className="text-lg text-[#5A5F69] font-normal">Price per Lesson</p>
                    <span className="text-3xl font-bold text-black">{course.price}$</span>
                </div>

                <div className="flex flex-col gap-2 text-[#3E424A]">
                    <p className="flex items-center gap-2 text-base font-semibold">
                        <FiBook /> {lessonCount} уроков
                    </p>

                    <p className="flex items-center gap-2 text-base font-semibold">
                        <IoMdTime /> {course.durationInHours} часа
                    </p>

                    <p className="flex items-center gap-2 text-base font-semibold">
                        <TbLock /> Доступ {course.isPaid ? 'Платный' : 'Бесплатный'}
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-3">
                    <div>
                        <Button onClick={() => setModalOpen(true)}>Байланышуу</Button>
                    </div>
                    <div>
                        <Button variant="secondary">Добавить в избранное</Button>
                    </div>
                </div>
            </div>
        </div>
        <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title="Байланышуу"
                size="md"
            >
                <div className="p-1">
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                        <h3 className="font-bold text-lg mb-2 text-[#EA580C]">Курс: {course.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-600">Баасы:</span>
                                <span className="font-bold text-gray-800 ml-2">${course.price}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Урок саны:</span>
                                <span className="font-bold text-gray-800 ml-2">{lessonCount}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                Аты-жөнүңүз *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`
                                    w-full border rounded-lg px-4 py-3 
                                    focus:outline-none focus:ring-2 focus:ring-[#EA580C]
                                    transition-all duration-200
                                    ${errors.name ? "border-red-500" : "border-gray-300"}
                                    ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}
                                `}
                                placeholder="Сиздин толук атыңыз"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                Телефон номериңиз *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`
                                    w-full border rounded-lg px-4 py-3 
                                    focus:outline-none focus:ring-2 focus:ring-[#EA580C]
                                    transition-all duration-200
                                    ${errors.phone ? "border-red-500" : "border-gray-300"}
                                    ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}
                                `}
                                placeholder="+996 _ _ _"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                Электрондук почтаңыз *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`
                                    w-full border rounded-lg px-4 py-3 
                                    focus:outline-none focus:ring-2 focus:ring-[#EA580C]
                                    transition-all duration-200
                                    ${errors.email ? "border-red-500" : "border-gray-300"}
                                    ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}
                                `}
                                placeholder="example@mail.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">
                                Суроо же сунушуңуз
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="3"
                                disabled={isSubmitting}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 
                                         focus:outline-none focus:ring-2 focus:ring-[#EA580C] 
                                         focus:border-transparent transition resize-none"
                                placeholder="Бул курс боюнча суроолоруңуз..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 
                                         border border-gray-300 rounded-lg hover:bg-gray-50 
                                         transition-colors duration-200
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Жокко чыгаруу
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                                    px-6 py-2.5 text-sm font-medium text-white rounded-lg
                                    transition-all duration-200
                                    ${isSubmitting
                                        ? "bg-[#FF8C6E] cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#EA580C] to-[#E14219] hover:from-[#d64d0b] hover:to-[#c13613]"
                                    }
                                `}
                            >
                                {isSubmitting ? "Жөнөтүлүүдө..." : "Жөнөтүү"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

                </>
    );
};

export default CardVideo;
