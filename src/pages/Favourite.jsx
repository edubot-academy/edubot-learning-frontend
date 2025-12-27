import { useFavourites } from '../context/FavouritesContext';
import CardCourse from '../features/courses/components/CardCourse.jsx';

function Favourite() {
    const { favourites } = useFavourites();

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-3">Избранное</h2>

            <p className="text-gray-600">Сиз сактаган курстар</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {favourites.length === 0 ? (
                    <p>Азырынча эч нерсе сакталбады...</p>
                ) : (
                    favourites.map((course) => <CardCourse key={course.id} {...course} />)
                )}
            </div>
        </div>
    );
}

export default Favourite;
