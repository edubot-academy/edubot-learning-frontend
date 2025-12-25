import { useEffect, useState, useCallback } from 'react';
import { useFavourites } from '../context/FavouritesContext';
import CardCourse from '../features/courses/components/CardCourse';

const Favourite = () => {
    const { favourites, loading, error, refreshFavourites } = useFavourites();

    const memoizedRefresh = useCallback(() => {
        refreshFavourites();
    }, [refreshFavourites]);

    useEffect(() => {
        memoizedRefresh();
    }, [memoizedRefresh]);

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-3">Избранное</h2>
                <p className="text-gray-600">Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h2 className="text-3xl font-bold mb-3">Избранное</h2>
                <p className="text-red-500">{error}</p>
                <button
                    onClick={refreshFavourites}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-3">Избранное</h2>
            <p className="text-gray-600">
                {favourites.length > 0
                    ? `${favourites.length} курсов в избранном`
                    : 'Сиз сактаган курстар'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {favourites.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mx-auto text-gray-300 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <p className="text-lg">Азырынча эч нерсе сакталбады...</p>
                        <p className="text-sm mt-2">
                            Добавляйте курсы в избранное, нажимая на сердечко на карточке курса
                        </p>
                    </div>
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
                            isPublished={course.isPublished ?? true}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Favourite;
s;
