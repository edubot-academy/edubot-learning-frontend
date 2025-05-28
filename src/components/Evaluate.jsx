import { useState } from 'react';
import evaluate from '../assets/images/evaluate-bot.png';

const Evaluate = () => {
    const [rating, setRating] = useState(0);

    const handleClick = (index) => {
        setRating(prev => (prev === index ? 0 : index));
    };

    return (
        <div className="bg-[#003A45] min-h-screen flex items-center justify-center p-4">
            {/* Основной контейнер для двух колонок (изображение + форма) */}
            <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-6xl min-h-[500px]">

                {/* Левая колонка с изображением */}
                {/* Теперь этот блок является частью flex-контейнера */}
                <div className="md:w-1/2 w-full bg-[#003A45] flex items-end justify-center p-6">
                    <img
                        src={evaluate}
                        alt="EduBot"
                        // w-full заставляет изображение занимать всю ширину родительского блока
                        // h-auto сохраняет пропорции
                        // max-h-[600px] устанавливает максимальную высоту
                        // object-contain гарантирует, что изображение впишется в контейнер
                        className="w-full h-auto max-h-[600px] object-contain"
                    />
                </div>

                {/* Правая колонка с формой */}
                <div className="md:w-1/2 flex items-center justify-center p-6 md:pl-10 md:pr-16">
                    <div className="w-full max-w-md text-[#001858]">
                        <h2 className="text-2xl font-bold mb-4 text-center">EduBot платформасын баалаңыз</h2>

                        {/* Звёзды */}
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((index) => (
                                <svg
                                    key={index}
                                    onClick={() => handleClick(index)}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-8 h-8 cursor-pointer transition-colors duration-300 ${rating >= index ? 'fill-yellow-400' : 'fill-gray-300'
                                        }`}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 .587l3.668 7.568L24 9.75l-6 5.93L19.336 24 12 19.897 4.664 24 6 15.68 0 9.75l8.332-1.595z" />
                                </svg>
                            ))}
                        </div>

                        {/* Текстовое поле */}
                        <textarea
                            placeholder="Платформаны колдонуудагы тажрыйбаңыз менен бөлүшүңүз..."
                            className="w-full p-4 bg-[#F9F9F9] text-[#333] rounded-xl border border-[#E0E0E0] focus:outline-none focus:ring-0 resize-none min-h-[120px] shadow-sm"
                        />

                        {/* Кнопка */}
                        <button className="mt-4 w-full bg-teal-600 hover:bg-teal-700 transition-colors duration-300 text-white py-2 px-4 rounded-lg font-semibold">
                            Биз менен байланышышыңыз
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Evaluate;