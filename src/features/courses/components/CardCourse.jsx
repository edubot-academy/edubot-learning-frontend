import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CardIcon from '@assets/icons/cardvektor.svg';
import Button from '../../../shared/ui/Button';
import { useCart } from '../../../context/CartContext';
import { useFavourites } from '../../../context/FavouritesContext';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { IoMdTime } from 'react-icons/io';
import { FiBook } from 'react-icons/fi';
import NoImage from '@assets/icons/noImage.svg';
import { AuthContext } from '../../../context/AuthContext';
import UnauthModal from '../../../shared/ui/UnauthModal';
import { formatMinutesToTime } from '../../../utils/timeUtils';

const courseTypeLabel = (type) => {
    const normalized = String(type || 'video').toLowerCase();
    if (normalized === 'offline') return 'Оффлайн';
    if (normalized === 'online_live') return 'Онлайн түз эфир';
    return 'Видео';
};

const formatPrice = (price, currency = 'KGS') => {
    if (!price && price !== 0) return 'Баасы көрсөтүлгөн эмес';
    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price);
    switch (currency) {
        case 'USD': return `${formattedPrice}$`;
        case 'KGS': return `${formattedPrice} сом`;
        default: return `${formattedPrice} ${currency}`;
    }
};

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
    isPublished = true,
    courseType = 'video',
    location,
    meetingUrl,
}) => {
    const [showPopup, setShowPopup] = useState(false);
    const [showFavoritePopup, setShowFavoritePopup] = useState(false);
    const [showUnauthModal, setShowUnauthModal] = useState(false);
    const navigate = useNavigate();
    const { addToCart, isInCart } = useCart();
    const { toggleFavourite, isFavourite } = useFavourites();
    const { user } = useContext(AuthContext);

    const courseAlreadyInCart = isInCart(id);
    const isCourseFavourite = isFavourite(id);
    const isSelfServeVideoCourse = String(courseType || 'video').toLowerCase() === 'video';

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!user) {
            setShowUnauthModal(true);
            return;
        }

        // ВАЖНО: Передаем ВСЕ данные, включая фотографию ВО ВСЕХ ВАРИАНТАХ
        const courseData = {
            id,
            title,
            // ФОТОГРАФИЯ - передаем во всех возможных полях
            image: coverImageUrl,           // Основное поле в контексте
            coverImageUrl: coverImageUrl,   // Как в пропсах
            cover: coverImageUrl,           // Альтернативное
            thumbnail: coverImageUrl,       // Еще один вариант

            instructor,
            price,
            ratingCount,
            ratingAverage,
            level,
            durationInHours,
            duration: durationInHours,      // Дублируем для надежности
            lessonCount,
            isPublished,
        };


        const result = await toggleFavourite(courseData);

        if (result?.success && result.added) {
            setShowFavoritePopup(true);
        }
    };

    const closeFavoritePopup = () => {
        setShowFavoritePopup(false);
    };

    const goToFavourites = () => {
        closeFavoritePopup();
        navigate('/favourites');
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

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
            isPublished,
            courseType,
        };

        const result = addToCart(courseData);
        if (result?.alreadyInCart) {
            setShowPopup(true);
        }
    };

    const closePopup = () => setShowPopup(false);
    const goToCart = () => {
        closePopup();
        navigate('/cart');
    };

    const handlePopupClick = (e) => e.stopPropagation();

    // Для отладки
    useEffect(() => {
    }, [id, coverImageUrl]);

    return (
        <>
            <Link to={`/courses/${id}`} className="block relative">
                <div className="max-w-md bg-white text-[#141619] border border-gray-200 dark:bg-[#141619] dark:text-[#E8ECF3] dark:border-[#2A2E35] rounded flex flex-col hover:shadow-lg transition-shadow duration-300 relative">
                    <button
                        type="button"
                        onClick={handleFavoriteClick}
                        className="absolute top-3 right-3 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                        aria-label={isCourseFavourite ? 'Тандалгандар өчүрүү' : 'Тандалгандарга кошуу'}
                        aria-pressed={isCourseFavourite}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 ${isCourseFavourite ? 'text-red-500 fill-current' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            role="img"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    <div className="p-3">
                        <img
                            src={coverImageUrl || NoImage}
                            onError={(e) => {
                                e.currentTarget.src = NoImage;
                            }}
                            alt={title}
                            className="w-full h-48 object-cover rounded"
                        />
                        <div className="flex flex-col flex-grow py-4">
                            <h3 className="font-suisse font-medium text-lg">{title}</h3>
                            <div className="flex flex-wrap gap-1 my-1">
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                    {courseTypeLabel(courseType)}
                                </span>
                                {String(courseType || '').toLowerCase() === 'offline' && location ? (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                        {location}
                                    </span>
                                ) : null}
                                {String(courseType || '').toLowerCase() === 'online_live' && meetingUrl ? (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                        Түз эфир
                                    </span>
                                ) : null}
                            </div>
                            <p className="text-gray-500 dark:text-[#a6adba] text-sm my-1">
                                {instructor?.fullName || 'Белгисиз инструктор'}
                            </p>
                            <div className="flex items-center gap-2 mb-3 mt-3">
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star}>
                                            {star <= (ratingAverage || 0) ? (
                                                <AiFillStar className="text-yellow-500" />
                                            ) : (
                                                <AiOutlineStar className="text-gray-300 dark:text-gray-600" />
                                            )}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-gray-600 dark:text-[#a6adba] text-sm">
                                    ({ratingCount || 0} рейтинг)
                                </span>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <span className="text-xs bg-[#DFF5FF] text-[#006F9D] rounded px-2 py-1">
                                    {level || 'Көрсөтүлгөн эмес'}
                                </span>
                                <span className="text-xs bg-[#F0F0F0] text-[#141619] dark:bg-[#2A2E35] dark:text-[#E8ECF3] rounded px-2 py-1 flex items-center gap-1">
                                    <IoMdTime className="w-3 h-3" />
                                    {formatMinutesToTime(durationInHours * 60)}
                                </span>
                                <span className="text-xs bg-[#F0F0F0] text-[#141619] dark:bg-[#2A2E35] dark:text-[#E8ECF3] rounded px-2 py-1 flex items-center gap-1">
                                    <FiBook className="w-3 h-3" />
                                    {lessonCount || 0} сабак
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-auto pt-4 border-t">
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-500 dark:text-[#a6adba] text-xs">Баасы</p>
                                    <p className="text-base text-[#141619] dark:text-white font-bold">
                                        {formatPrice(price, 'KGS')}
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={handleButtonClick}
                                    disabled={courseAlreadyInCart || !isSelfServeVideoCourse}
                                >
                                    {!isSelfServeVideoCourse ? (
                                        'LMSте сатып алынбайт'
                                    ) : courseAlreadyInCart ? (
                                        <>
                                            <img src={CardIcon} alt="cart" className="w-5 h-5 mr-2" />
                                            Себетте
                                        </>
                                    ) : (
                                        'Себетке кошуу'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            <UnauthModal
                isOpen={showUnauthModal}
                onClose={() => setShowUnauthModal(false)}
                actionType="favourite"
                courseId={id}
                courseTitle={title}
            />

            <FavoritePopupModal
                isOpen={showFavoritePopup}
                onClose={closeFavoritePopup}
                onGoToFavourites={goToFavourites}
                course={{
                    title,
                    instructor: instructor?.fullName,
                    price,
                    coverImageUrl,
                }}
            />

            {showPopup && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closePopup} />
                    <div
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 w-[calc(100%-2rem)] max-w-lg"
                        onClick={handlePopupClick}
                    >
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ийгиликтүү кошулду!</h3>
                                <button onClick={closePopup} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">×</button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Курс "<span className="font-semibold">{title}</span>" себетке кошулду
                            </p>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3">
                                <Button variant="secondary" onClick={closePopup}>Сатып алууну улантыңыз</Button>
                                <Button variant="primary" onClick={goToCart}>Себетке өтүү</Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

const FavoritePopupModal = ({ isOpen, onClose, onGoToFavourites, course }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const imageUrl =
        course?.coverImageUrl ??
        course?.image ??
        NoImage;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:bg-gray-800 bg-white rounded-lg shadow-2xl w-[calc(100%-2rem)] max-w-lg">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Тандалгандарга ийгиликтүү кошулду!</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">×</button>
                    </div>
                    <div className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center gap-3">
                            <img
                                src={imageUrl}
                                alt={course?.title}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                    e.currentTarget.src = NoImage;
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">{course?.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {course?.instructor || 'Белгисиз инструктор'}
                                </p>
                                <p className="text-sm font-bold mt-1 text-gray-900 dark:text-white">
                                    {formatPrice(course?.price, 'KGS')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="secondary" onClick={onClose} className="flex-1">
                            Көрүүну улантуу
                        </Button>
                        <Button variant="primary" onClick={onGoToFavourites} className="flex-1">
                            Тандалгандарга өтүү
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCourse;
