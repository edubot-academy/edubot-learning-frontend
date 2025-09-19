import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logotip from "../assets/images/logotip-hero.png";
import Vektor from "../assets/images/vector.png";

import bannerImg1 from "../../public/banner-img1.png";
import bannerImg2 from "../../public/banner-img2.png";
import bannerImg3 from "../../public/banner-img3.png";
import bannerMan3 from "../../public/banner-img-man.png";

const HeroStart = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Окуңуз, өнүгүңүз жана ийгиликке Edubot Learning менен бирге жетишиңиз!",
            description:
                "Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү сабактар аркылуу өздөштүрүңүз",
            image: bannerImg1,
            color: "from-white to-gray-50",
        },
        {
            title: "БУТКЕМП КУРСЫ ДЛЯ ВАШЕГО РЕБЕНКА!",
            description:
                "Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү сабактар аркылуу өздөштүрүңүз",
            image: bannerImg2,
            color: "from-teal-900 to-teal-700",
        },
        {
            title: "Ишкердик жана келечекке инвестиция",
            description: "IT-адистери үчүн керектүү билимдерди алгыла",
            image: bannerImg3,
            color: "from-emerald-900 to-emerald-700",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="relative from-green-900 to-green-800 text-white h-[946px] overflow-hidden">
            <div className="relative h-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide
                            ? "opacity-100 z-10 translate-x-0"
                            : "opacity-0 z-0 translate-x-full"
                            }`}
                    >
                        {/* ---------- СЛАЙД 1 ---------- */}
                        {index === 0 && (
                            <section className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between h-[946px] px-6 py-12 text-black">
                                <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
                                    <h1 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg sm:text-xl md:text-2xl max-w-xl">
                                        {slide.description}
                                    </p>

                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                        <Link
                                            to="/info"
                                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-100 transition"
                                        >
                                            Толук маалымат алуу
                                        </Link>
                                        <Link
                                            to="/courses"
                                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow hover:opacity-90 transition"
                                        >
                                            Сабакты азыр баштоо
                                        </Link>
                                    </div>

                                    <div className="flex gap-6 pt-6 justify-center lg:justify-start">
                                        <div className="bg-gray-100 rounded-lg px-4 py-3 text-center">
                                            <span className="text-2xl font-bold text-gray-800">
                                                200+
                                            </span>
                                            <p className="text-sm text-gray-600">
                                                Тажрыйбалуу менторлордон онлайн сабактар
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 rounded-lg px-4 py-3 text-center">
                                            <span className="text-2xl font-bold text-gray-800">
                                                10k+
                                            </span>
                                            <p className="text-sm text-gray-600">
                                                Азыркы күнгө чейинки колдонуучулар
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative mt-10 lg:mt-0">
                                    <img
                                        src={slide.image}
                                        alt="Edubot"
                                        className="w-[320px] sm:w-[450px] lg:w-[500px] h-auto object-contain"
                                    />
                                </div>
                            </section>
                        )}

                        {/* ---------- СЛАЙД 2 ---------- */}
                        {index === 1 && (
                            <section className="relative h-[946px] flex items-center justify-center text-white">
                                {/* фон с затемнением */}
                                <div className="absolute inset-0">
                                    <img
                                        src={slide.image}
                                        alt="Background"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40" />
                                </div>

                                {/* контент */}
                                <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl space-y-6">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                                        {slide.title}
                                    </h1>
                                    <p className="text-base sm:text-lg md:text-xl opacity-90">
                                        {slide.description}
                                    </p>

                                    {/* блок кнопок и контактов */}
                                    <div className="mt-10 w-full max-w-4xl bg-white/20 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-8">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* кнопка 1 */}
                                            <button className="flex items-center gap-2 px-4 py-2 text-white hover:text-gray-200">
                                                <span>Посмотреть новые уроки</span>
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-black">
                                                    →
                                                </span>
                                            </button>
                                            {/* кнопка 2 */}
                                            <button className="flex items-center gap-2 px-4 py-2 text-white hover:text-gray-200">
                                                <span>Узнать расписание</span>
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-black">
                                                    →
                                                </span>
                                            </button>
                                        </div>

                                        <div className="text-center sm:text-right">
                                            <p className="text-sm opacity-80">Наши контакты</p>
                                            <p className="text-lg font-semibold">+996 (550) 942 433</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ---------- СЛАЙД 3 ---------- */}
                        {index === 2 && (
                            <section className="relative h-[946px] flex items-center justify-center text-white">
                                {/* Фон офиса */}
                                <div className="absolute inset-0">
                                    <img
                                        src={slide.image}
                                        alt="background"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30" />
                                </div>

                                {/* Контент */}
                                <div className="relative z-10 w-full max-w-6xl flex items-center justify-center px-6 ">
                                    {/* Оранжевый блок с текстом */}
                                    <div className="relative bg-[#e87029] text-white rounded-2xl p-8 w-full w-[1703px] flex flex-col lg:flex-row items-center">
                                        <div className="space-y-6 lg:w-2/3">
                                            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                                                Купи годовой тариф <br /> и получи 50% скидку <br /> на все курсы
                                            </h1>
                                            <p className="text-base sm:text-lg opacity-90 max-w-md">
                                                Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү
                                                сабактар аркылуу өздөштүрүңүз
                                            </p>
                                            <p className="absolute top-6 right-6 text-sm text-white/80">
                                                болуп коробогондой арзандатуу!
                                            </p>
                                            <div className="absolute bottom-6 right-6 text-white/30 text-7xl font-bold">
                                                50%
                                            </div>
                                        </div>

                                        {/* Парень поверх блока, по центру */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
                                            <img
                                                src={bannerMan3}
                                                alt="Student"
                                                className="w-[300px] sm:w-[380px] lg:w-[420px] h-auto object-contain transform -scale-x-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                    </div>
                ))}
            </div>

            {/* индикаторы */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
                {slides.map((_, index) => {
                    const isActive = index === currentSlide;
                    return (
                        <div
                            key={index}
                            className="h-1 w-12 bg-white/30 rounded-full overflow-hidden"
                        >
                            <div
                                className={`h-full bg-white rounded-full transition-all duration-5000 ease-linear ${isActive ? "animate-progress" : ""
                                    }`}
                                style={{ width: isActive ? "100%" : "0%" }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
        </div>
    );
};

export default HeroStart;
