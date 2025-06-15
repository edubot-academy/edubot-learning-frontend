import { useState } from 'react';
import evaluate from '../assets/images/evaluate-bot.png';

const Evaluate = () => {
    const [rating, setRating] = useState(0);

    const handleClick = (index) => {
        setRating(prev => (prev === index ? 0 : index));
    };

    return (
        <div className="bg-[#003A45] flex items-center justify-center p-4 py-8 sm:min-h-[unset] md:min-h-screen">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-6 items-center lg:items-start">

                {/* Фото — только на больших экранах */}
                <div className="hidden lg:flex basis-[40%] max-w-[380px] justify-center mr-24">
                    <img
                        src={evaluate}
                        alt="bot"
                        className="w-full h-auto object-contain rounded-2xl"
                    />
                </div>



                {/* Белый блок */}
                <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col flex-grow basis-[60%] max-w-[500px] min-h-[460px] sm:min-h-[500px] lg:ml-6">

                    {/* Заголовок и рейтинг */}
                    <div className="flex flex-col flex-grow">
                        <h2
                            className="font-bold text-[#001858] mb-4 text-center lg:text-left whitespace-nowrap overflow-hidden"
                            style={{ fontSize: 'clamp(10px, 3.5vw, 24px)' }}
                        >
                            EduBot платформасын баалаңыз
                        </h2>

                        <div className="flex justify-center lg:justify-start gap-4 md:gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((index) => (
                                <svg
                                    key={index}
                                    onClick={() => handleClick(index)}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 cursor-pointer transition-colors duration-300 ${rating >= index ? 'fill-yellow-400' : 'fill-gray-300'
                                        }`}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 .587l3.668 7.568L24 9.75l-6 5.93L19.336 24 12 19.897 4.664 24 6 15.68 0 9.75l8.332-1.595z" />
                                </svg>
                            ))}
                        </div>

                        <textarea
                            placeholder="Платформаны колдонуудагы тажрыйбаңыз менен бөлүшүңүз..."
                            className="flex-grow w-full p-3 sm:p-4 bg-[#F9F9F9] text-[#333] text-sm sm:text-base rounded-xl border border-[#E0E0E0] 
                         focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none min-h-[140px] sm:min-h-[160px] shadow"
                        />
                    </div>

                    {/* Кнопка — на всю ширину всегда */}
                    <button
                        className="mt-6 bg-teal-600 hover:bg-teal-700 transition-colors duration-300
                       text-white py-3 px-4 rounded-lg font-semibold
                       text-sm sm:text-base md:text-[17px]
                       w-full"
                    >
                        Биз менен байланышышыңыз
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Evaluate;
