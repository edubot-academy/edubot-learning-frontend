import { useFavourites } from '../context/FavouritesContext';
import CardCourse from '../features/courses/components/CardCourse';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Button from '@shared-ui/Button';

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

const Favourite = () => {
    const { favourites, loading, error, refreshFavourites } = useFavourites();
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-6"
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
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        Тандалгандарга кирүү
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Курстарды тандалгандарга кошуу үчүн аккаунт түзүү же кирүү керек
                    </p>
                    <div className="space-y-3">
                        <Link to="/register" className="block">
                            <Button variant="primary" className="w-full py-3">
                                Катталуу
                            </Button>
                        </Link>
                        <Link to="/login" className="block">
                            <Button variant="secondary" className="w-full py-3">
                                Кирүү
                            </Button>
                        </Link>
                        <Link to="/courses">
                            <button className="text-blue-600 hover:text-blue-800 font-medium py-2">
                                Курстарды карап чыгуу
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        Тандалгандар
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">Жүктөлуү...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        Избранное
                    </h2>
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                    <button
                        onClick={refreshFavourites}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    >
                        Кайра аракет кылуу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                    Тандалгандар
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {favourites.length > 0
                        ? `${favourites.length} ${favourites.length === 1 ? 'курс' : 'курс'} тандалды`
                        : 'Азырынча тандалган курс жок'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favourites.length === 0 ? (
                        <div className="col-span-full text-center py-16 px-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-6"
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
                            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                                Азырынча курс тандалган эмес
                            </p>
                            <p className="text-gray-400 dark:text-gray-500">
                                Курс картасындагы жүрөктү басуу менен курстарды тандалгандарга
                                кошуңуз
                            </p>
                            <Link to="/courses" className="mt-6 inline-block">
                                <Button variant="primary">Курстарды карап чыгуу</Button>
                            </Link>
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
        </div>
    );
};

export default Favourite;
