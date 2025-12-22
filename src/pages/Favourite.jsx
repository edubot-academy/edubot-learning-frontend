import { useFavourites } from '../context/FavouritesContext';
import CardCourse from '../features/courses/components/CardCourse';

const Favourite = () => {
    const { favourites } = useFavourites();

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-3">Избранное</h2>
            <p className="text-gray-600">Сиз сактаган курстар</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {favourites.length === 0 ? (
                    <p className="col-span-full text-center py-10 text-gray-500">
                        Азырынча эч нерсе сакталбады...
                    </p>
                ) : (
                    favourites.map((course) => (
                        <CardCourse
                            key={course.id}
                            {...course}
                            title={course.title || `Курс ${course.id}`}
                            instructor={
                                course.instructor || {
                                    fullName: 'Неизвестный инструктор',
                                    id: null,
                                }
                            }
                            price={course.price ?? 0}
                            ratingCount={course.ratingCount ?? 0}
                            ratingAverage={course.ratingAverage ?? 0}
                            durationInHours={course.durationInHours ?? 0}
                            lessonCount={course.lessonCount ?? 0}
                            isPublished
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Favourite;
