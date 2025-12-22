import { useState } from 'react';
import { FiBook } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { TbLock } from 'react-icons/tb';
import { FaPlay, FaStar, FaRegStar } from 'react-icons/fa';
import Button from '@shared/ui/Button';
import { useFavourites } from '../../../context/FavouritesContext';
import ContactCourseModal from './ContactCourseModal';

const CardVideo = ({ coverImageUrl, course, lessonCount }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const { isFavourite, toggleFavourite } = useFavourites();
  const isInFavourites = isFavourite(course.id);

  const handleFavouriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(course);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-md bg-white max-w-[420px] px-4 py-5 m-5 w-[90vw] sm:w-[70vw] md:w-[40vw] lg:w-[30vw]">
        {/* Image */}
        <div className="relative">
          <img
            src={coverImageUrl}
            alt="course"
            className="w-full max-h-52 object-cover rounded"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/45 transition rounded">
            <button className="bg-white/35 rounded-full p-4">
              <FaPlay className="text-[#EA580C] text-2xl pl-1" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-[#5A5F69]">Price per Lesson</span>
            <span className="text-3xl font-bold">{course.price}$</span>
          </div>

          <div className="flex flex-col gap-2 text-[#3E424A] font-semibold">
            <p className="flex items-center gap-2">
              <FiBook /> {lessonCount} уроков
            </p>
            <p className="flex items-center gap-2">
              <IoMdTime /> {course.durationInHours} часа
            </p>
            <p className="flex items-center gap-2">
              <TbLock /> Доступ {course.isPaid ? 'Платный' : 'Бесплатный'}
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <Button onClick={() => setIsContactOpen(true)}>
              Байланышуу
            </Button>

            <Button
              variant="secondary"
              onClick={handleFavouriteClick}
              className="flex items-center justify-center gap-2"
            >
              {isInFavourites ? (
                <>
                  <FaStar className="text-yellow-500" />
                  Удалить из избранного
                </>
              ) : (
                <>
                  <FaRegStar />
                  Добавить в избранное
                </>
              )}
            </Button>
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
