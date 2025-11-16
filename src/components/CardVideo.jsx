import React from "react";
import { FiBook } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { TbLock } from "react-icons/tb";
import Button from "../components/ui/button";
import { FaPlay } from "react-icons/fa";

const CardVideo = ({ course }) => {
    if (!course || !course.lessons) return null; 
    const lessonCount = course.lessons.length;
    const totalMinutes = course.lessons.reduce(
        (sum, lesson) => sum + lesson.duration,
        0
    );
    const totalHours = (totalMinutes / 60).toFixed(1);
    const fullPrice = course.pricePerLesson * lessonCount;

    return (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-[90vw] sm:w-[70vw] md:w-[40vw] lg:w-[30vw] max-w-[420px] px-4 py-6 m-5">
            <div className="relative w-full ">
                <img
                    className="w-full h-[30vw] sm:h-[20vw] md:h-[15vw] lg:h-[12vw] object-cover rounded-md"
                    src="https://img.freepik.com/free-vector/abstract-orange-background_698452-2795.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="course"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition rounded-md">
                    <button className="bg-white/35 rounded-full p-4">
                        <FaPlay className="text-[#EA580C] text-2xl pl-1" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-[1vw] py-[2vw] sm:py-[1.5vw]">
                <div className="flex items-center justify-between text-gray-700">
                    <p className="text-lg text-[#5A5F69] font-normal">
                        Price per Lesson
                    </p>
                    <span className="text-3xl font-bold text-black">
                        {course.pricePerLesson}$
                    </span>
                </div>

                <div className="flex flex-col gap-[0.5vw] text-[#3E424A]">
                    <p className="flex items-center gap-[0.6vw] text-base font-semibold">
                        <FiBook /> {lessonCount} уроков
                    </p>

                    <p className="flex items-center gap-[0.6vw] text-base font-semibold">
                        <IoMdTime /> {totalHours} часа
                    </p>

                    <p className="flex items-center gap-[0.6vw] text-base font-semibold">
                        <TbLock /> Доступ {course.isPrivate ? "Платный" : "Бесплатный"}
                    </p>
                </div>

                <div className="flex md:flex-col gap-[1vw] mt-[1vw]">
                    <div>
                        <Button>
                            Байланышуу
                        </Button>
                    </div>
                    <div>
                        <Button variant="secondary">
                            Добавить в избранное
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardVideo;
