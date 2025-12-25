import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import Button from '@shared/ui/Button';
import ContactCourseModal from './ContactCourseModal';
import { useFavourites } from '../../../context/FavouritesContext';

const CardVideo = ({ coverImageUrl, course, lessonCount }) => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [showFavoritePopup, setShowFavoritePopup] = useState(false);
    const { toggleFavourite, isFavourite } = useFavourites();
    const navigate = useNavigate(); 
    const isCourseFavourite = isFavourite(course.id);

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const courseData = {
            id: course.id,
            title: course.title,
            instructor: course.instructor,
            price: course.price,
            coverImageUrl: coverImageUrl,
            ratingCount: course.ratingCount || 0,
            ratingAverage: course.ratingAverage || 0,
            level: course.level,
            durationInHours: course.durationInHours,
            lessonCount: lessonCount,
            isPublished: course.isPublished || true,
        };

        const result = await toggleFavourite(courseData);

        // show popup.
        if (!isCourseFavourite) {
            setShowFavoritePopup(true);
        }

        return result;
    };

    const closeFavoritePopup = () => {
        setShowFavoritePopup(false);
    };

    const goToFavourites = () => {
        closeFavoritePopup();
        navigate('/favourite'); 
    };

    return (
        <>
            <div className="border border-gray-200 rounded-md overflow-hidden bg-white w-[90vw] sm:w-[70vw] md:w-[40vw] lg:w-[30vw] max-w-[420px] px-4 py-5 m-5">
                <div className="relative w-full">
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                        aria-label={
                            isCourseFavourite ? 'Удалить из избранного' : 'Добавить в избранное'
                        }
                    >
                        {isCourseFavourite ? (
                            <FaHeart className="text-red-500 text-lg" />
                        ) : (
                            <FaRegHeart className="text-gray-400 hover:text-red-500 text-lg" />
                        )}
                    </button>

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
                            <Button
                                variant="secondary"
                                onClick={handleFavoriteClick}
                                className="flex items-center justify-center gap-2"
                            >
                                {isCourseFavourite ? (
                                    <>
                                        <FaHeart className="text-red-500" />
                                        Удалить из избранного
                                    </>
                                ) : (
                                    <>
                                        <FaRegHeart />
                                        Добавить в избранное
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {showFavoritePopup && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeFavoritePopup}
                    />

                    <div
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 
                       w-[calc(100%-2rem)] max-w-lg mx-4
                       md:w-auto md:min-w-[32rem]
                       sm:max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">
                                    Успешно добавлено в избранное!
                                </h3>
                                <button
                                    onClick={closeFavoritePopup}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                                    aria-label="Закрыть"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={coverImageUrl}
                                        alt={course.title}
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <h4 className="font-medium text-sm truncate">
                                            {course.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            {course.instructor?.fullName ||
                                                'Неизвестный инструктор'}
                                        </p>
                                        <p className="text-sm font-bold mt-1">{course.price}$</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={closeFavoritePopup}
                                    className="text-sm px-4 py-2 w-full sm:w-auto"
                                >
                                    Продолжить просмотр
                                </Button>

                                <Button
                                    variant="primary"
                                    onClick={goToFavourites}
                                    className="text-sm px-4 py-2 w-full sm:w-auto"
                                >
                                    Перейти в избранное
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

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
