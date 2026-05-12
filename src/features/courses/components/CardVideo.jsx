import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import Button from '@shared/ui/Button';
import { FaPlay } from 'react-icons/fa';
import ContactCourseModal from './ContactCourseModal';
import ModalPreviewVideo from './ModalPreviewVideo';
import UnauthModal from '@shared/ui/UnauthModal';
import { formatMinutesToTime } from '../../../utils/timeUtils';
import { AuthContext } from '../../../context/AuthContext';
import { useFavourites } from '../../../context/FavouritesContext';
import { useCart } from '../../../context/CartContext';
import NoImage from '@assets/icons/noImage.svg';

const formatPrice = (price, currency = 'KGS') => {
    if (!price && price !== 0) return 'Баасы көрсөтүлгөн эмес';
    const formattedPrice = new Intl.NumberFormat('ru-RU').format(Number(price) || 0);
    return currency === 'KGS' ? `${formattedPrice} сом` : `${formattedPrice} ${currency}`;
};

const CardVideo = ({ coverImageUrl, course, lessonCount,
    resumeVideoTime, onEnded, handleVideoProgress, handleTimeUpdate, handlePause, videoRef }) => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showUnauthModal, setShowUnauthModal] = useState(false);
    const { user } = useContext(AuthContext);
    const { toggleFavourite, isFavourite } = useFavourites();
    const { addToCart, isInCart } = useCart();
    const normalizedCourseType = String(course?.courseType || course?.type || 'video').toLowerCase();
    const isSelfServeVideoCourse = normalizedCourseType === 'video';
    const courseAlreadyInCart = isInCart(course.id);

    const courseData = {
        ...course,
        coverImageUrl,
        image: coverImageUrl,
        cover: coverImageUrl,
        thumbnail: coverImageUrl,
        lessonCount,
    };
    const isCourseFavourite = isFavourite(course.id);

    const handleFavouriteClick = async (e) => {
        e.stopPropagation();

        if (!user) {
            setShowUnauthModal(true);
            return;
        }

        await toggleFavourite(courseData);
    };

    const handlePrimaryAction = (e) => {
        e.stopPropagation();

        if (isSelfServeVideoCourse) {
            addToCart(courseData);
            return;
        }

        setIsContactOpen(true);
    };

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm dark:border-[#2A2E35] dark:bg-[#222222]"
            >
                <div className="relative w-full ">
                    <img
                        src={coverImageUrl || NoImage}
                        className="max-h-52 w-full object-cover rounded"
                        alt={course?.title || 'Курс'}
                        onError={(e) => {
                            e.currentTarget.src = NoImage;
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition rounded-md">
                        <button type="button" className="bg-white/35 rounded-full p-4" aria-label="Курстун алдын ала видеосун көрүү">
                            <FaPlay className="text-[#EA580C] text-2xl pl-1" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-3 py-4">
                    <div className="flex items-center justify-between text-[#141619] dark:text-[#E8ECF3]">
                        <p className="text-lg text-[#3E424A] dark:text-[#a6adba] font-normal">
                            Баасы
                        </p>
                        <span className="text-2xl font-bold text-[#141619] dark:text-white">
                            {formatPrice(course.price)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 text-[#3E424A] dark:text-[#a6adba]">
                        <p className="flex items-center gap-2 text-base font-semibold">
                            <FiBook /> {lessonCount} сабак
                        </p>

                        <p className="flex items-center gap-2 text-base font-semibold">
                            <IoMdTime /> {formatMinutesToTime(course.durationInHours * 60)}
                        </p>

                        <p className="flex items-center gap-2 text-base font-semibold">
                            <TbLock /> Мүмкүнчүлүк: {course.isPaid ? 'Төлөм керектелет' : 'Бекер'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-100">
                        {isSelfServeVideoCourse
                            ? 'Бул видео курсту себетке кошуп, өзүңүзгө ыңгайлуу убакта баштай аласыз.'
                            : 'Бул курс коомдук сатып алууга ачылган эмес. Жеткиликтүүлүк үчүн команда менен байланышыңыз.'}
                    </div>

                    <div className="flex flex-col gap-3 mt-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                            <Button
                                onClick={handlePrimaryAction}
                                disabled={isSelfServeVideoCourse && courseAlreadyInCart}
                                className="w-full"
                            >
                                {isSelfServeVideoCourse
                                    ? courseAlreadyInCart ? 'Себетте' : 'Себетке кошуу'
                                    : 'Байланышуу'}
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={handleFavouriteClick}
                                variant="secondary"
                                aria-pressed={isCourseFavourite}
                            >
                                {isCourseFavourite ? 'Тандалгандардан өчүрүү' : 'Тандалгандарга кошуу'}
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
                resumeVideoTime={resumeVideoTime}
                onEnded={onEnded}
                handleVideoProgress={handleVideoProgress}
                handleTimeUpdate={handleTimeUpdate}
                handlePause={handlePause}
                videoRef={videoRef}
            />
            <UnauthModal
                isOpen={showUnauthModal}
                onClose={() => {
                    setShowUnauthModal(false);
                }}
                actionType="favourite"
                courseId={course.id}
                courseTitle={course.title}
                course={courseData}
            />
        </>
    );
};

CardVideo.propTypes = {
    coverImageUrl: PropTypes.string,
    course: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        courseType: PropTypes.string,
        type: PropTypes.string,
        durationInHours: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        isPaid: PropTypes.bool,
    }).isRequired,
    lessonCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    resumeVideoTime: PropTypes.number,
    onEnded: PropTypes.func,
    handleVideoProgress: PropTypes.func,
    handleTimeUpdate: PropTypes.func,
    handlePause: PropTypes.func,
    videoRef: PropTypes.shape({
        current: PropTypes.any,
    }),
};

export default CardVideo;
