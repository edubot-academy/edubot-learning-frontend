import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchFavorites, addFavorite, removeFavorite } from '../features/favorites/api';
import { AuthContext } from './AuthContext';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingRequests, setPendingRequests] = useState(new Map());

    const loadFavorites = useCallback(async () => {
        if (!user) {
            setFavourites([]);
            setLoading(false);
            setError(null);
            localStorage.removeItem('favourites');
            return;
        }
        try {
            setLoading(true);
            const data = await fetchFavorites();
            setFavourites(data);
            setError(null);
            localStorage.setItem('favourites', JSON.stringify(data));
        } catch (err) {
            console.error('Ошибка загрузки избранного:', err);
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
    }, [user]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    const toggleFavourite = useCallback(
        async (course) => {
            const courseId = course.id;

            if (!user) {
                return { success: false, error: 'Требуется авторизация', added: false };
            }
            const requestId = `${courseId}-${Date.now()}`;

            if (pendingRequests.has(courseId)) {
                return { success: false, error: 'Запрос уже выполняется' };
            }

            const isCurrentlyFav = favourites.some((item) => item.id === courseId);
            const previousFavourites = [...favourites];

            if (isCurrentlyFav) {
                const optimisticFavourites = favourites.filter((item) => item.id !== courseId);
                setFavourites(optimisticFavourites);
                localStorage.setItem('favourites', JSON.stringify(optimisticFavourites));
            } else {
                const optimisticFavourites = [...favourites, course];
                setFavourites(optimisticFavourites);
                localStorage.setItem('favourites', JSON.stringify(optimisticFavourites));
            }

            setPendingRequests((prev) => new Map(prev).set(courseId, requestId));

            try {
                if (isCurrentlyFav) {
                    await removeFavorite(courseId);
                } else {
                    await addFavorite(courseId);
                }

                setPendingRequests((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(courseId);
                    return newMap;
                });

                return { success: true, added: !isCurrentlyFav };
            } catch (err) {
                console.error('Ошибка при изменении избранного:', err);

                setFavourites(previousFavourites);
                localStorage.setItem('favourites', JSON.stringify(previousFavourites));

                setPendingRequests((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(courseId);
                    return newMap;
                });

                return {
                    success: false,
                    error: err?.message || 'Не удалось изменить избранное',
                    added: !isCurrentlyFav,
                };
            }
        },
        [favourites, pendingRequests]
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

export const useFavourites = () => {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error('useFavourites must be used within FavouritesProvider');
    }
    return context;
};
