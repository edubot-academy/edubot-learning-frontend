import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CardIcon from '@assets/icons/cardvektor.svg';
import Button from '@shared-ui/Button';
import { useCart } from '../../../context/CartContext';

const CardCourse = ({
    coverImageUrl,
    title,
    instructor,
    price,
    ratingCount,
    ratingAverage,
    id,
    level,
    durationInHours,
    lessonCount,
}) => {
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const { addToCart, isInCart } = useCart();
    const courseAlreadyInCart = isInCart(id);

    const handleButtonClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (courseAlreadyInCart) {
            navigate('/cart');
            return;
        }

        const courseData = {
            id,
            title,
            instructor,
            price,
            coverImageUrl,
            ratingCount,
            ratingAverage,
            level,
            durationInHours,
            lessonCount,
        };

        const result = addToCart(courseData);

        if (result.success) {
            setShowPopup(true);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handlePopupClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    const goToCart = () => {
        closePopup();
        navigate('/cart');
    };

    return (
        <>
            <Link to={`/courses/${id}`} className="block relative">
                <div className="max-w-md bg-white text-[#141619] border border-gray-200 dark:bg-[#141619] dark:text-[#E8ECF3] dark:border-[#2A2E35] rounded flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <div className="p-3">
                        <img
                            src={coverImageUrl}
                            alt={title}
                            className="object-cover rounded max-h-64 w-full"
                        />
                        <div className="flex flex-col flex-grow py-4">
                            <h3 className="font-suisse font-medium text-lg">{title}</h3>
                            <p className="text-gray-500 dark:text-[#a6adba] text-sm my-1">
                                {instructor.fullName}
                            </p>
                            <div className="flex items-center gap-2 mb-3 mt-3">
                                <div className="flex text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span className="text-2xl" key={i}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-gray-600 dark:text-[#a6adba] text-sm">
                                    ({ratingCount} рейтингов)
                                </span>
                            </div>
                            <div className="flex gap-2 mb-4">
                                {level && (
                                    <div className="flex">
                                        <span className="px-3 py-2 text-xs rounded-full border border-gray-300 dark:border-[#2A2E35] flex gap-1">
                                            <img className="w-4" src={CardIcon} alt="" />
                                            {level}
                                        </span>
                                    </div>
                                )}
                                {durationInHours && (
                                    <span className="px-3 py-2 text-xs rounded-full border border-gray-300 dark:border-[#2A2E35]">
                                        {durationInHours} всего часа
                                    </span>
                                )}
                                {lessonCount && (
                                    <span className="px-3 py-2 text-xs rounded-full border border-gray-300 dark:border-[#2A2E35]">
                                        {lessonCount} лекций
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="flex justify-between items-end gap-6 mt-6">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-[#a6adba]">
                                            Цена
                                        </p>
                                        <p className="text-base text-[#141619] dark:text-white font-bold">
                                            {price} сом
                                        </p>
                                    </div>
                                    <Button
                                        variant={courseAlreadyInCart ? 'secondary' : 'primary'}
                                        onClick={handleButtonClick}
                                        className="whitespace-nowrap"
                                        disabled={courseAlreadyInCart}
                                    >
                                        {courseAlreadyInCart ? 'Корзинада ✓' : 'Себетке кошуу'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {showPopup && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closePopup}
                    />

                    <div
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 
                       w-[calc(100%-2rem)] max-w-lg mx-4
                       md:w-auto md:min-w-[32rem]
                       sm:max-w-md"
                        onClick={handlePopupClick}
                    >
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">
                                    Успешно добавлено!
                                </h3>
                                <button
                                    onClick={closePopup}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                                    aria-label="Закрыть"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="text-gray-600 mb-4 text-sm sm:text-base">
                                Курс "<span className="font-semibold">{title}</span>" добавлен в
                                вашу корзину.
                            </p>

                            <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={coverImageUrl}
                                        alt={title}
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <h4 className="font-medium text-sm truncate">{title}</h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            {instructor.fullName}
                                        </p>
                                        <p className="text-sm font-bold mt-1">{price} сом</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={closePopup}
                                    className="text-sm px-4 py-2 w-full sm:w-auto"
                                >
                                    Продолжить покупки
                                </Button>

                                <Button
                                    variant="primary"
                                    onClick={goToCart}
                                    className="text-sm px-4 py-2 w-full sm:w-auto"
                                >
                                    Перейти в корзину
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default CardCourse;
