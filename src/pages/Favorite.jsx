import { useFavorites } from "../context/FavoritesContext";
import CardCourse from "../components/CardCourse";

function Favorite() {
    const { favorites } = useFavorites();

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-3">Избранное</h2>
            <p className="text-gray-600">Сиз сактаган курстар</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {favorites.length === 0 ? (
                    <p>Азырынча эч нерсе сакталбады</p>
                ) : (
                    favorites.map((course) => (
                        <CardCourse key={course.id} {...course} />
                    ))
                )}
            </div>
        </div>
    );
}

export default Favorite;
