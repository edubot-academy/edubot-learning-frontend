import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import Button from '@shared/ui/Button';
import ContactCourseModal from './ContactCourseModal';
import { useFavourites } from '../../../context/FavouritesContext';
import ModalPreviewVideo from './ModalPreviewVideo';

const formatPrice = (price, currency = 'KGS') => {
    if (!price && price !== 0) return 'Цена не указана';

    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price);

    switch (currency) {
        case 'USD':
            return `${formattedPrice}$`;
        case 'KGS':
            return `${formattedPrice} сом`;
        default:
            return `${formattedPrice} ${currency}`;
    }
};

const CardVideo = ({ coverImageUrl, course, lessonCount, activeLesson }) => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

        if (result.success && result.added) {
            setShowFavoritePopup(true);
        }
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
            <div className="w-full">
                <div className="bg-white dark:bg-[#141619] rounded overflow-hidden border border-gray-200 dark:border-[#2A2E35]">
                    <div className="relative">
                        <div className="w-full h-56 md:h-64 lg:h-72 relative">
                            <img
                                src={coverImageUrl}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4 hover:bg-opacity-30 transition-all duration-300"
                                    aria-label="Посмотреть превью видео"
                                >
                                    <FaPlay className="w-8 h-8 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {course.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {course.instructor?.fullName || 'Неизвестный инструктор'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatPrice(course.price, 'KGS')}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {lessonCount} уроков • {course.durationInHours} часов
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => setIsContactOpen(true)}
                                >
                                    Купить курс
                                </Button>
                            </div>
                            <div className="flex-1">
                                <Button
                                    variant="secondary"
                                    onClick={handleFavoriteClick}
                                    className="w-full flex items-center justify-center gap-2"
                                    aria-pressed={isCourseFavourite}
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
            </div>

            {showFavoritePopup && (
                <FavoritePopupModal
                    isOpen={showFavoritePopup}
                    onClose={closeFavoritePopup}
                    onGoToFavourites={goToFavourites}
                    course={{
                        title: course.title,
                        instructor: course.instructor?.fullName,
                        price: course.price,
                        coverImageUrl,
                    }}
                />
            )}

            <ContactCourseModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                courseTitle={course.title}
                coursePrice={course.price}
            />

            <ModalPreviewVideo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                videoUrl={activeLesson?.videoUrl}
                title={course.title}
            />
        </>
    );
};

const FavoritePopupModal = ({ isOpen, onClose, onGoToFavourites, course }) => {
    const modalRef = React.useRef(null);
    const previousFocusRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;

            const handleEscape = (e) => {
                if (e.key === 'Escape') onClose();
            };

            const handleTabKey = (e) => {
                if (!modalRef.current) return;

                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            document.addEventListener('keydown', handleEscape);
            document.addEventListener('keydown', handleTabKey);

            setTimeout(() => {
                if (modalRef.current) {
                    const focusable = modalRef.current.querySelector('button, [tabindex]');
                    if (focusable) focusable.focus();
                }
            }, 100);

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('keydown', handleTabKey);

                if (previousFocusRef.current) {
                    previousFocusRef.current.focus();
                }
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={modalRef}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 
                   w-[calc(100%-2rem)] max-w-lg mx-4
                   md:w-auto md:min-w-[32rem]
                   sm:max-w-md"
                role="dialog"
                aria-modal="true"
                aria-labelledby="favorite-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 id="favorite-modal-title" className="text-lg font-bold text-gray-800">
                            Успешно добавлено в избранное!
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                            aria-label="Закрыть"
                            tabIndex={0}
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <img
                                src={course.coverImageUrl}
                                alt={course.title}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <h4 className="font-medium text-sm truncate">{course.title}</h4>
                                <p className="text-xs text-gray-500 truncate">
                                    {course.instructor || 'Неизвестный инструктор'}
                                </p>
                                <p className="text-sm font-bold mt-1">
                                    {formatPrice(course.price, 'KGS')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="text-sm px-4 py-2 w-full sm:w-auto"
                            tabIndex={0}
                        >
                            Продолжить просмотр
                        </Button>

                        <Button
                            variant="primary"
                            onClick={onGoToFavourites}
                            className="text-sm px-4 py-2 w-full sm:w-auto"
                            tabIndex={0}
                        >
                            Перейти в избранное
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardVideo;
