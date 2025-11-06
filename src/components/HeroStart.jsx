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
        <div className="relative from-green-900 to-green-800 text-white 2xl:h-[994px] h-[794px] lg:h-[535px] overflow-hidden">
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
                            <section className="2xl:w-[1763px] w-full relative mx-auto flex flex-col lg:flex-row items-center justify-between 2xl:px-6 px-10 py-12 text-black">
                                <div className="lg:w-[600px] 2xl:w-1/2 text-center lg:text-left space-y-6 h-[50%] lg:h-[454px]">
                                    <h1 className="font-inter 2xl:font-bold text-[30px] 2xl:text-[58px] 2xl:leading-tight font-semibold leading-[100%] ">
                                        {slide.title}
                                    </h1>
                                    <p className="font-normal 2xl:text-[26px] text-[#3E424A] text-[18px]">
                                        {slide.description}
                                    </p>

                                    <div className="flex justify-center lg:justify-start 2xl:gap-4 gap-[12px] pt-[60px]">
                                        <button
                                            className='border border-[#141619] rounded-lg text-gray-800 hover:bg-gray-100 transition 2xl:w-[373px] 2xl:h-[72px] 2xl:font-semibold 2xl:text-[20px] w-[197px] h-[64px] font-normal text-[14px]'>
                                            Толук маалымат алуу
                                        </button>
                                        <button
                                            className="rounded-lg 2xl:w-[394px] 2xl:h-[72px] bg-gradient-to-b from-[#FF8C6E] to-[#E14219] 2xl:font-semibold 2xl:text-[20px] text-white shadow-[0px_5px_21.3px_0px_#E14219BF] w-[197px] h-[64px] font-normal text-[14px]">
                                            Сабакты азыр баштоо
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-center lg:justify-end relative lg:mt-10 mt-0">
                                    <div className="absolute bg-gray-100 2xl:rounded-lg 2xl:px-[33px] 2xl:py-[32px] 2xl:w-[369px] 2xl:h-[198px] bg-[var(--Gray-Gray-50,#F3F4F6)] border border-[var(--Gray-Gray-50,#F3F4F6)] 2xl:left-0 left-[-105px] 2xl:top-[370px] top-[180px] z-[0] w-[228px] h-[117px] rounded-[4.73px] py-[18.91px] px-[19.51px]">
                                        <span className="2xl:text-[54px] font-normal leading-[100%] tracking-[0%] text-[28px]">
                                            200+
                                        </span>
                                        <p className="2xl:text-[20px] leading-[100%] tracking-[0%] text-[#141619] font-normal text-[12px] 2xl:mt-[11px] mt-[5.91px]">
                                            Тажрыйбалуу менторлордон онлайн сабактар
                                        </p>
                                    </div>

                                    <div className="absolute 2xl:rounded-lg 2xl:px-[33px] 2xl:py-[32px] 2xl:w-[315px] 2xl:h-[198px] bg-white/30 backdrop-blur-lg border border-[var(--Gray-Gray-50,#F3F4F6)] 2xl:left-[486px] left-[110px] 2xl:top-[704px] top-[340px] z-[2] w-[205px] h-[129px] rounded-[5.23px] py-[20.9px] px-[21.56px]">
                                        <span className="2xl:text-[54px] font-[Suisse_Intl] font-normal leading-[100%] tracking-[0%] text-[28px]">
                                            10k+
                                        </span>
                                        <p className="font-[Suisse_Intl] font-normal 2xl:text-[20px] text-[12px] leading-[100%] tracking-[0%] text-[#141619] 2xl:mt-[11px] mt-[6.53px]">
                                            Азыркы күнгө чейинки колдонуучулар
                                        </p>
                                    </div>

                                    <img
                                        src={slide.image}
                                        alt="Edubot"
                                        className="2xl:w-[662px] z-[1] w-[326px] 2xl:mr-0 mr-10"
                                    />
                                    <img src={bannerBlure1} alt="" className='absolute z-[1] left-[490px] bottom-[10px] hidden 2xl:flex' />
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
                                    <h1 className="font-bold lg:text-[67.95px] text-[40px] leading-[120%] tracking-[1%] text-center">
                                        {slide.title}
                                    </h1>
                                    <p className="font-normal text-[20px] lg:text-[30.46px] px-5">
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
                                <div className="relative bg-[linear-gradient(93.72deg,#F06743_11.31%,#D27A3B_67.42%)] text-white 2xl:px-[61px] px-[2%] 2xl:py-[66px] py-[2%] flex flex-col lg:flex-row 2xl:w-[1703px] 2xl:h-[601px] h-[80%] w-[90%] rounded-3xl 2xl:mt-[269px] m-auto justify-between">
                                    <div className="">
                                        <h1 className="font-[Suisse_Intl] font-bold 2xl:text-[58px] text-[30px] leading-[120%] tracking-[1%]">
                                            Купи годовой тариф <br /> и получи 50% скидку <br /> на все курсы
                                        </h1>
                                        <p className="font-[Suisse_Intl] font-normal 2xl:text-[26px] text-[18px] leading-[120%] tracking-[0%] mt-[26px] ">
                                            Программалоо тилдерин жана код жазуу <br /> жөндөмдөрүн интерактивдүү
                                            сабактар аркылуу <br /> өздөштүрүңүз
                                        </p>
                                    </div>
                                    <img
                                        src={bannerMan3}
                                        alt="Student"
                                        className="2xl:w-[871px] 2xl:h-[871px] lg:h-[120%] -scale-x-100 absolute 2xl:left-[500px] lg:left-[26%] left-[30%] bottom-0"
                                    />
                                    <div className="flex flex-col justify-between 2xl:h-[496px]">
                                        <p className="text-[#FFFFFF73] font-normal text-[26px] leading-[120%] tracking-[0%]">
                                            болуп коробогондой арзандатуу!
                                        </p>
                                        <div className="text-[#FFFFFF26] font-bold text-[150.49px] lg:text-center text-left">
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
