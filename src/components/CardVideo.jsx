import React from "react";
import { FiBook } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { TbLock } from "react-icons/tb";
import Button from "../components/ui/button"; // если используешь shadcn/ui

const ResponsiveCourseCard = () => {
    return (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-[90vw] sm:w-[70vw] md:w-[40vw] lg:w-[30vw] max-w-[420px] px-4 py-6 m-5">
            {/* Изображение */}
            <div className="relative w-full ">
                <img
                    className="w-full h-[30vw] sm:h-[20vw] md:h-[15vw] lg:h-[12vw] object-cover rounded-md"
                    src="https://img.freepik.com/free-vector/abstract-orange-background_698452-2795.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="course"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition rounded-md">
                    <div className="bg-white/70 backdrop-blur-sm rounded-full p-[1vw] sm:p-[0.8vw] shadow-md flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#EA580C"
                            viewBox="0 0 24 24"
                            stroke="none"
                            className="w-[4vw] h-[4vw] sm:w-[3vw] sm:h-[3vw] md:w-[2vw] md:h-[2vw]"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.25 5.25v13.5L18 12 5.25 5.25z"
                            />
                        </svg>
                    </div>
                </button>

            </div>

            <div className="flex flex-col gap-[1vw] py-[2vw] sm:py-[1.5vw]">
                <div className="flex items-center justify-between text-gray-700">
                    <p className="text-lg text-[#5A5F69] font-normal">
                        Price per Lesson
                    </p>
                    <span className="text-3xl font-bold text-black">
                        120$
                    </span>
                </div>

                <div className="flex flex-col gap-[0.5vw] text-[#3E424A]">
                    <p className="flex items-center gap-[0.6vw] text-base font-semibold">
                        <FiBook /> 12 уроков
                    </p>
                    <p className="flex items-center gap-[0.6vw] text-base font-semibold">
                        <IoMdTime /> 4 часа
                    </p>
                    <p className="flex items-center gap-[0.6vw] text-base font-semibold">
                        <TbLock /> Доступ платный
                    </p>
                </div>

                <div className="flex flex-col gap-[1vw] mt-[1vw] w-[15vw]">
                    <Button>
                        Байланышуу
                    </Button>
                    <Button variant="secondary">
                        Добавить в избранное
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveCourseCard;
