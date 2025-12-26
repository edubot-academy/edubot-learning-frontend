import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchFavorites, addFavorite, removeFavorite } from '../features/favorites/api';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchFavorites();
            setFavourites(data);
            setError(null);
            localStorage.setItem('favourites', JSON.stringify(data));
        } catch {
            setError('Не удалось загрузить избранное');
            try {
                const localFavs = JSON.parse(localStorage.getItem('favourites')) || [];
                setFavourites(localFavs);
            } catch {
                setFavourites([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggleFavourite = useCallback(
        async (course) => {
            const isCurrentlyFav = favourites.some((item) => item.id === course.id);

            try {
                if (isCurrentlyFav) {
                    await removeFavorite(course.id);
                    const newFavourites = favourites.filter((item) => item.id !== course.id);
                    setFavourites(newFavourites);
                    localStorage.setItem('favourites', JSON.stringify(newFavourites));
                } else {
                    await addFavorite(course.id);
                    const newFavourites = [...favourites, course];
                    setFavourites(newFavourites);
                    localStorage.setItem('favourites', JSON.stringify(newFavourites));
                }

                return { success: true };
            } catch (err) {
                const newFavourites = isCurrentlyFav
                    ? favourites.filter((item) => item.id !== course.id)
                    : [...favourites, course];

                setFavourites(newFavourites);
                localStorage.setItem('favourites', JSON.stringify(newFavourites));

                return {
                    success: false,
                    error: err?.message,
                    fallback: true,
                };
            }
        },
        [favourites]
    );

    const isFavourite = useCallback(
        (courseId) => favourites.some((item) => item.id === courseId),
        [favourites]
    );

    const refreshFavourites = useCallback(() => {
        loadFavorites();
    }, [loadFavorites]);

    return (
        <FavouritesContext.Provider
            value={{
                favourites,
                toggleFavourite,
                isFavourite,
                loading,
                error,
                refreshFavourites,
            }}
        >
            {children}
        </FavouritesContext.Provider>
    );
};

export const useFavourites = () => useContext(FavouritesContext);
