import React, { useState } from 'react';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import Button from '@shared/ui/Button';
import { FaPlay } from 'react-icons/fa';
import ContactCourseModal from './ContactCourseModal';

const CardVideo = ({ coverImageUrl, course, lessonCount }) => {
    const [isContactOpen, setIsContactOpen] = useState(false);

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
                            <Button onClick={() => setIsContactOpen(true)}>Байланышуу</Button>
                        </div>
                        <div>
                            <Button variant="secondary">Добавить в избранное</Button>
                        </div>
                    </div>
                </div>
            </div>

            <ContactCourseModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                course={course}
                lessonCount={lessonCount}
            />
        </>
    );
};

export default CardVideo;
