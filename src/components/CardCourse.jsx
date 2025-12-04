import { useFavorites } from "../context/FavoritesContext";
import { Link } from "react-router-dom";
import CardIcon from "../assets/icons/cardVektor.svg";
import Button from "./UI/Button";

const CardCourse = ({ coverImageUrl, title, instructor, price, ratingCount, ratingAverage, id }) => {
  const { favorites, toggleFavorite } = useFavorites();

  const isFavorite = favorites.some((f) => f.id === id);

  const handleFavorite = (e) => {
    e.preventDefault();
    toggleFavorite({ coverImageUrl, title, instructor, price, ratingCount, ratingAverage, id });
  };

  return (
    <Link to={`/courses/${id}`}>
      <div className="max-w-md bg-white border rounded relative">

        {/* звезда */}
        <button
          className="absolute top-3 right-3 text-2xl"
          onClick={handleFavorite}
        >
          {isFavorite ? "★" : "☆"}
        </button>

        <div className='p-3'>
          <img src={coverImageUrl} alt={title} className="object-cover rounded max-h-64 w-full" />
          <div className="flex flex-col flex-grow py-4">
            <h3 className="font-suisse font-medium text-lg">{title}</h3>
            <p className="text-gray-500 text-sm my-1"> {instructor.fullName} </p>
            <div className="flex items-center gap-2 mb-3 mt-3">
              <div className="flex text-yellow-400"> {Array.from({ length: 5 }).map((_, i) => (<span className='text-2xl' key={i}>★</span>))} </div>
              <span className="text-gray-600 text-sm">({ratingCount} рейтингов)</span>
            </div>
            <div className="flex gap-2 mb-4">
              <div className='flex'>
                <span className="px-3 py-2 text-xs rounded-full border flex gap-1">
                  <img className='w-4' src={CardIcon} alt="" />новичок</span>
              </div>
              <span className="px-3 py-2 text-xs rounded-full border">22 всего часа</span>
              <span className="px-3 py-2 text-xs rounded-full border">155 лекций</span>
            </div>
            <div>
              <div className='flex justify-between items-end gap-6 mt-6'>
                <div>
                  <p className="text-sm text-[#333333]">Цена</p>
                  <p className="text-base color-[#333333] font-bold">{price} сом</p>
                </div>
                <Button variant='primary'> Себетке кошуу </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardCourse; 