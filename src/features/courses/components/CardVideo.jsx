import { useContext, useState } from 'react';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import Button from '@shared/ui/Button';
import { FaPlay } from 'react-icons/fa';
import ContactCourseModal from './ContactCourseModal';
import ModalPreviewVideo from './ModalPreviewVideo';
import UnauthModal from '@shared/ui/UnauthModal';
import formatDuration from '../../../shared/formatDuration';


const CardVideo = ({ coverImageUrl, course, lessonCount, activeLesson }) => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showUnauthModal, setShowUnauthModal] = useState(false);

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="border border-gray-200 rounded-md overflow-hidden bg-white dark:bg-[#222222] w-full max-w-full px-6 py-5"
            >
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
                    <div className="flex items-center justify-between text-[#141619] dark:text-[#E8ECF3]">
                        <p className="text-lg text-[#3E424A] dark:text-[#a6adba] font-normal">
                            Баасы
                        </p>
                        <span className="text-3xl font-bold text-[#141619] dark:text-white">
                            {course.price} сом
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 text-[#3E424A] dark:text-[#a6adba]">
                        <p className="flex items-center gap-2 text-base font-semibold">
                            <FiBook /> {lessonCount} сабак
                        </p>

                        <p className="flex items-center gap-2 text-base font-semibold">
                            <IoMdTime /> {formatDuration(course.durationInHours)}
                        </p>

                        <p className="flex items-center gap-2 text-base font-semibold">
                            <TbLock /> Мүмкүнчүлүк: {course.isPaid ? 'Төлөм керектелет' : 'Бекер'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-3">
                        <div>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsContactOpen(true);
                                }}
                            >
                                Байланышуу
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUnauthModal(true);
                                }}
                                variant="secondary"
                            >
                                Избранныйга кошуу
                            </Button>
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
            <ModalPreviewVideo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseId={course.id}
            />
            <UnauthModal
                isOpen={showUnauthModal}
                onClose={() => {
                    setShowUnauthModal(false);
                }}
                actionType="favourite"
                courseId={course.id}
                courseTitle={course.title}
            />
        </>
    );
};

export default CardVideo;
