import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logotip from "../assets/images/logotip-hero.png";
import Vektor from "../assets/images/vector.png";

import bannerImg1 from "../../public/banner-img1.png";
import bannerBlure1 from "../../public/banner-img1-blure.png";
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
            description: "Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү сабактар аркылуу өздөштүрүңүз",
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
        <div className="relative from-green-900 to-green-800 text-white h-[994px] overflow-hidden mt-[100px]">
            <div className="relative h-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out  ${index === currentSlide
                            ? "opacity-100 z-10 translate-x-0"
                            : "opacity-0 z-0 translate-x-full"
                            }`}
                    >
                        {/* ---------- СЛАЙД 1 ---------- */}
                        {index === 0 && (
                            <section className="w-[1763px] relative mx-auto flex flex-col lg:flex-row items-center justify-between px-6 py-12 text-black">
                                <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6 h-[454px]">
                                    <h1 className="font-inter font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[58px] leading-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="font-normal text-[26px] text-[#3E424A]">
                                        {slide.description}
                                    </p>

                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-[60px]"><button className='border border-[#141619] rounded-lg text-gray-800 hover:bg-gray-100 transition w-[373px] h-[72px] font-semibold text-[20px] '>
                                        Толук маалымат алуу
                                    </button>
                                        <button
                                            className="rounded-lg w-[394px] h-[72px] bg-gradient-to-b from-[#FF8C6E] to-[#E14219] font-semibold text-[20px] text-white shadow-[0px_5px_21.3px_0px_#E14219BF]">
                                            Сабакты азыр баштоо</button>
                                    </div>
                                </div>

                                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative mt-10 lg:mt-0">
                                    <div className="absolute bg-gray-100 rounded-lg px-[33px] py-[32px] w-[369px] h-[198px] bg-[var(--Gray-Gray-50,#F3F4F6)] border border-[var(--Gray-Gray-50,#F3F4F6)] left-0 top-[370px] z-[0]">
                                        <span className="text-[54px] font-[Suisse_Intl] font-normal text-[54px] leading-[100%] tracking-[0%] ">
                                            200+
                                        </span>
                                        <p className="font-[Suisse_Intl] font-normal text-[20px] leading-[100%] tracking-[0%] text-[#141619] mt-[11px]">
                                            Тажрыйбалуу менторлордон онлайн сабактар
                                        </p>
                                    </div>

                                    <div className="absolute rounded-lg px-[33px] py-[32px] w-[315px] h-[198px] bg-white/30 backdrop-blur-lg border border-[var(--Gray-Gray-50,#F3F4F6)] left-[486px] top-[704px] z-[2]">
                                        <span className="text-[54px] font-[Suisse_Intl] font-normal text-[54px] leading-[100%] tracking-[0%] ">
                                            10k+
                                        </span>
                                        <p className="font-[Suisse_Intl] font-normal text-[20px] leading-[100%] tracking-[0%] text-[#141619] mt-[11px]">
                                            Азыркы күнгө чейинки колдонуучулар
                                        </p>
                                    </div>

                                    <img
                                        src={slide.image}
                                        alt="Edubot"
                                        className="w-[662px]  z-[1]"
                                    />
                                    <img src={bannerBlure1} alt="" className='absolute z-[1] left-[680px] bottom-[10px]' />
                                </div>
                            </section>
                        )}

                        {/* ---------- СЛАЙД 2 ---------- */}
                        {index === 1 && (
                            <section className="relative h-full flex items-center justify-center text-white">
                                {/* фон с затемнением */}
                                <div className="absolute inset-0">
                                    <img
                                        src={slide.image}
                                        alt="Background"
                                        className="w-full h-full bg-[linear-gradient(168.58deg,rgba(65,65,65,0.86)_8.4%,rgba(255,255,255,0)_343.16%)]"
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(168.58deg,rgba(65,65,65,0.86)_8.4%,rgba(255,255,255,0)_343.16%)]" />
                                </div>

                                {/* контент */}
                                <div className="relative z-10 flex flex-col items-center text-center max-w-[1079px] space-y-6">
                                    <h1 className="font-bold text-[67.95px] leading-[120%] tracking-[1%] text-center">
                                        {slide.title}
                                    </h1>
                                    <p className="font-normal text-[30.46px]">
                                        {slide.description}
                                    </p>

                                    {/* блок кнопок и контактов */}
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-[60px]"><button className='border border-white rounded-lg text-white transition w-[373px] h-[72px] font-semibold text-[20px] '>
                                        Толук маалымат алуу
                                    </button>
                                        <button
                                            className="rounded-lg w-[394px] h-[72px] bg-gradient-to-b from-[#FF8C6E] to-[#E14219] font-semibold text-[20px] text-white shadow-[0px_5px_21.3px_0px_#E14219BF]">
                                            Сабакты азыр баштоо</button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ---------- СЛАЙД 3 ---------- */}
                        {index === 2 && (
                            <section className="relative h-full flex justify-center text-white">
                                {/* Фон офиса */}
                                <div className="absolute inset-0">
                                    <img
                                        src={slide.image}
                                        alt="background"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30" />
                                </div>

                                {/* Оранжевый блок с текстом */}
                                <div className="relative bg-[linear-gradient(93.72deg,#F06743_11.31%,#D27A3B_67.42%)] text-white px-[61px] py-[66px] w-[1703px] flex w-[1703px] h-[601px] rounded-3xl mt-[269px] justify-between">
                                    <div className="">
                                        <h1 className="font-[Suisse_Intl] font-bold text-[58px] leading-[120%] tracking-[1%]">
                                            Купи годовой тариф <br /> и получи 50% скидку <br /> на все курсы
                                        </h1>
                                        <p className="font-[Suisse_Intl] font-normal text-[26px] leading-[120%] tracking-[0%] mt-[26px] w-[672px]">
                                            Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү
                                            сабактар аркылуу өздөштүрүңүз
                                        </p>
                                    </div>
                                    <img
                                        src={bannerMan3}
                                        alt="Student"
                                        className="w-[871px] h-[871px] -scale-x-100 absolute left-[500px] bottom-0"
                                    />
                                    <div className="flex flex-col justify-between h-[496px]">
                                        <p className="text-[#FFFFFF73] font-normal text-[26px] leading-[120%] tracking-[0%]">
                                            болуп коробогондой арзандатуу!
                                        </p>
                                        <div className="text-[#FFFFFF26] font-bold text-[150.49px] text-center">
                                            50%
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
