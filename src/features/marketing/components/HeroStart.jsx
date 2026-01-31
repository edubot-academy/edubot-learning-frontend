import { useState, useEffect, useContext } from 'react';
import bannerImg1 from '/banner-img1.png';
import bannerBlure1 from '/banner-img1-blure.png';
import bannerBlureDark from '/banner-img1-blure-dark.png';
import bannerImg2 from '/banner-img2.png';
import bannerImg3 from '/banner-img3.png';
import bannerMan3 from '/banner-img-man.png';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@app/providers';

const HeroStart = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const slides = [
        {
            title: 'Окуңуз, өнүгүңүз жана ийгиликке Edubot Learning менен бирге жетишиңиз!',
            description:
                'Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү сабактар аркылуу өздөштүрүңүз',
            image: bannerImg1,
            color: 'from-white to-gray-50',
        },
        {
            title: 'БИЗДИН КУРСТАР DIGITAL-ДҮЙНӨСҮ КАНТИП ИШТЕШИН ТУШУНУУГО ЖАРДАМ БЕРЕТ.',
            description:
                'Биз баштан-аяк, этап-этабы менен – баштапкыдан жогорку деңгээлге чейин үйрөтөбүз. Жаңы кесибиңиз сиз ойлогондон да жакын!',
            image: bannerImg2,
            color: 'from-teal-900 to-teal-700',
        },
        {
            title: 'Ишкердик жана келечекке инвестиция',
            description: 'IT-адистери үчүн керектүү билимдерди алгыла',
            image: bannerImg3,
            color: 'from-emerald-900 to-emerald-700',
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="relative from-green-900 to-green-800 text-white 2xl:h-[600px] h-[794px] lg:h-[535px] overflow-hidden">
            <div className="relative h-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out  ${index === currentSlide
                            ? 'opacity-100 z-10 translate-x-0'
                            : 'opacity-0 z-0 translate-x-full'
                            }`}
                    >
                        {/* ---------- СЛАЙД 1 ---------- */}
                        {index === 0 && (
                            <section className="w-full relative mx-auto flex flex-col lg:flex-row items-center justify-between px-10 py-12 text-black dark:text-white bg-white dark:bg-[#0F1013]">
                                <div className="lg:w-[600px] text-center lg:text-left space-y-6 h-[50%] lg:h-[454px]">
                                    <h1 className="font-inter 2xl:font-bold text-[28px] 2xl:text-[38px] 2xl:leading-tight font-semibold leading-[100%] text-black dark:text-white">
                                        {slide.title}
                                    </h1>
                                    <p className="font-normal text-[#3E424A] dark:text-[#D7DBE3] text-[18px]">
                                        {slide.description}
                                    </p>

                                    <div className="flex justify-center lg:justify-start gap-[12px] pt-[32px] md:pt-[60px]">
                                        <button
                                            onClick={() => {
                                                navigate('/contact');
                                            }}
                                            className="border border-[#141619] dark:border-white/70 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition font-semibold h-[52px] w-[197px] md:w-[220px] md:h-[54px] text-[14px]"
                                        >
                                            Толук маалымат алуу
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (user !== null) {
                                                    navigate('/courses');
                                                } else {
                                                    navigate('/login');
                                                }
                                            }}
                                            className="rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white shadow-[0px_5px_21.3px_0px_#E14219BF] font-semibold h-[52px] w-[197px] md:w-[220px] md:h-[54px] text-[14px]"
                                        >
                                            Сабакты азыр баштоо
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-center lg:justify-end relative lg:mt-10 mt-0">
                                    <div className="absolute bg-gray-100 dark:bg-white/10 bg-[var(--Gray-Gray-50,#F3F4F6)] border border-[var(--Gray-Gray-50,#F3F4F6)] dark:border-white/20 left-[-105px] top-[180px] z-[0] w-[228px] h-[117px] rounded-[4.73px] py-[18.91px] px-[19.51px]">
                                        <span className=" font-normal leading-[100%] tracking-[0%] text-[28px] text-[#141619] dark:text-white">
                                            200+
                                        </span>
                                        <p className="leading-[100%] tracking-[0%] text-[#141619] dark:text-[#E8ECF3] font-normal text-[12px] mt-[5.91px]">
                                            Тажрыйбалуу менторлордон онлайн сабактар
                                        </p>
                                    </div>

                                    <div className="absolute bg-white/30 dark:bg-white/15 backdrop-blur-lg border border-[var(--Gray-Gray-50,#F3F4F6)] dark:border-white/25 left-[110px] top-[340px] z-[2] w-[205px] h-[129px] rounded-[5.23px] py-[20.9px] px-[21.56px]">
                                        <span className=" font-[Suisse_Intl] leading-[100%] tracking-[0%] text-[28px] text-[#141619] dark:text-white">
                                            10k+
                                        </span>
                                        <p className="font-[Suisse_Intl] text-[12px] leading-[100%] tracking-[0%] text-[#141619] dark:text-[#E8ECF3] mt-[6.53px]">
                                            Азыркы күнгө чейинки колдонуучулар
                                        </p>
                                    </div>

                                    <img
                                        src={slide.image}
                                        alt="Edubot"
                                        className="z-[1] lg:h-full w-[326px] lg:mr-20"
                                    />
                                    <img
                                        src={bannerBlure1}
                                        alt=""
                                        className="absolute z-[1] right-[-3%] bottom-[0px] h-[97%] lg:flex hidden dark:hidden"
                                    />
                                    <img
                                        src={bannerBlureDark}
                                        alt=""
                                        className="absolute z-[1] right-[-3%] bottom-[0px] h-[97%] dark:lg:flex hidden"
                                    />
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
                                        className="w-full h-full"
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(173.96deg,rgba(141,63,14,0.86)_19.82%,rgba(255,255,255,0)_204.47%)] dark:bg-gradient-to-t from-black/[86%] to-transparent to-[125.26%]" />
                                </div>

                                {/* контент */}
                                <div className="relative z-10 flex flex-col items-center text-center max-w-[1079px] space-y-6">
                                    <h1 className="font-bold lg:text-[57.95px] md:text-[40px] text-[28px] leading-[120%] tracking-[1%] text-center">
                                        {slide.title}
                                    </h1>
                                    <p className="font-normal text-[16px] md:text-[20px] lg:text-[25px] px-2 md:px-5">
                                        {slide.description}
                                    </p>

                                    {/* блок кнопок и контактов */}
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-[60px]">
                                        <button
                                            className="border border-white rounded-lg text-white transition w-[177px] h-[46px] md:w-[373px] md:h-[72px] font-semibold text-[10.12px] md:text-[20px] "
                                            onClick={() => {
                                                navigate('/contact');
                                            }}
                                        >
                                            Толук маалымат алуу
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (user !== null) {
                                                    navigate('/courses');
                                                } else {
                                                    navigate('/login');
                                                }
                                            }}
                                            className="rounded-lg w-[177px] h-[46px] md:w-[373px] md:h-[72px] bg-gradient-to-b from-[#FF8C6E] to-[#E14219] font-semibold text-[10.12px] md:text-[20px] text-white shadow-[0px_5px_21.3px_0px_#E14219BF]"
                                        >
                                            Сабакты азыр баштоо
                                        </button>
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
                                    <div className="absolute inset-0 bg-black/30 dark:bg-[#000000BD]" />
                                </div>

                                {/* Оранжевый блок с текстом */}
                                <div className="relative bg-[linear-gradient(93.72deg,#F06743_11.31%,#D27A3B_67.42%)] text-white px-[4%] py-[4%] md:px-[2%] md:py-[2%] flex flex-col lg:flex-row h-[80%] w-[90%] rounded-3xl m-auto justify-between">
                                    <div className="">
                                        <h1 className="font-[Suisse_Intl] text-[30px] leading-[120%] tracking-[1%]">
                                            Жылдык планды сатып алыңыз <br /> жана бардык курстарга
                                            50% <br /> арзандатуу алыңыз.
                                        </h1>
                                        <p className="font-[Suisse_Intl] text-[18px] leading-[120%] tracking-[0%] mt-[26px] ">
                                            Программалоо тилдерин жана код жазуу <br /> жөндөмдөрүн
                                            интерактивдүү сабактар аркылуу <br /> өздөштүрүңүз
                                        </p>
                                    </div>
                                    <img
                                        src={bannerMan3}
                                        alt="Student"
                                        className="lg:h-[120%] -scale-x-100 absolute lg:left-[26%] bottom-0 h-[55%] md:h-[70%] "
                                    />
                                    <div className="flex-col justify-between hidden lg:flex">
                                        <p className="text-[#FFFFFF73] font-normal text-[26px] leading-[120%] tracking-[0%]">
                                            болуп көрбөгөндөй арзандатуу!
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
                                className={`h-full bg-white rounded-full transition-all duration-5000 ease-linear ${isActive ? 'animate-progress' : ''
                                    }`}
                                style={{ width: isActive ? '100%' : '0%' }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes progress {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
                .animate-progress {
                  animation: progress 5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default HeroStart;
