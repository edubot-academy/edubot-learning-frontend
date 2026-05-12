import { useFavourites } from '../context/FavouritesContext';
import CardCourse from '../features/courses/components/CardCourse';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isPublicVideoSignupEnabled } from '@shared/auth-config';
import EmptyState from '@components/ui/dashboard/EmptyState';

const Favourite = () => {
    const { favourites, loading, error, refreshFavourites } = useFavourites();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

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
                        aria-hidden="true"
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
                        {isPublicVideoSignupEnabled
                            ? 'Курстарды тандалгандарга кошуу үчүн аккаунт түзүү же кирүү керек'
                            : 'Курстарды тандалгандарга кошуу үчүн кирүү керек'}
                    </p>
                    <div className="space-y-3">
                        {isPublicVideoSignupEnabled ? (
                            <Link
                                to="/register"
                                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-4 py-3 font-medium text-white orange__shadow transition hover:from-[#C2410C] hover:to-[#C2410C] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                Катталуу
                            </Link>
                        ) : null}
                        <Link
                            to="/login"
                            className="inline-flex w-full items-center justify-center rounded-lg border border-black px-4 py-3 font-medium text-black transition hover:border-[#EA580C] hover:bg-[#EA580C] hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-white dark:text-white"
                        >
                            Кирүү
                        </Link>
                        <Link to="/courses" className="inline-flex py-2 font-medium text-blue-600 hover:text-blue-800">
                            Курстарды карап чыгуу
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 h-9 w-52 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Тандалгандар жүктөлүүдө">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="min-h-[28rem] animate-pulse rounded-[24px] border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        Тандалгандар
                    </h2>
                    <p className="text-red-500 dark:text-red-400" role="alert">{error}</p>
                    <button
                        type="button"
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
                        <EmptyState
                            title="Азырынча курс тандалган эмес"
                            subtitle="Курс картасындагы жүрөктү басуу менен видео курстарды тандалгандарга кошуңуз."
                            variant="discovery"
                            action={{ label: 'Курстарды карап чыгуу', onClick: () => navigate('/courses') }}
                            className="col-span-full rounded-[24px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                        />
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
