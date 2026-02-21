import React, {
    createContext,
    useState,
    useContext,
    useCallback,
    useMemo,
    useEffect
} from 'react';
import { AuthContext } from './AuthContext';
import {
    fetchFavorites,
    addFavorite,
    removeFavorite
} from '../features/favorites/api';

const FavouritesContext = createContext();

export const useFavourites = () => {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error('useFavourites must be used within FavouritesProvider');
    }
    return context;
};

export const FavouritesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const normalizeFavorites = useCallback((data = []) => {
        const itemsArray = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
                ? data
                : [];

        return itemsArray.map(item => {
            const course = item.course || item;

            const coverImageUrl =
                course.coverImageUrl ||
                course.coverImage ||
                course.image ||
                course.thumbnail ||
                course.thumbnailUrl ||
                null;

            return {
                ...course,
                coverImageUrl,
                favoriteId: item.id || course.id,
                addedAt: item.addedAt || new Date().toISOString()
            };
        });
    }, []);
    const mergeWithExistingImages = useCallback((serverItems, existingItems) => {
        const existingMap = new Map(existingItems.map(i => [i.id, i]));

        return serverItems.map(item => {
            const existing = existingMap.get(item.id);

            return {
                ...item,
                coverImageUrl:
                    item.coverImageUrl ||
                    existing?.coverImageUrl ||
                    null
            };
        });
    }, []);

    const mergeGuestFavoritesIntoBackend = useCallback(async (guestFavorites) => {
        if (!user || !guestFavorites?.length) return [];

        try {
            const serverData = await fetchFavorites();
            const serverNormalized = normalizeFavorites(serverData);

            const serverIds = new Set(serverNormalized.map(i => i.id));

            const toAdd = guestFavorites.filter(
                item => !serverIds.has(item.id)
            );

            // добавляем недостающие
            await Promise.allSettled(
                toAdd.map(item => addFavorite(item.id))
            );

            const refreshed = await fetchFavorites();
            const normalized = normalizeFavorites(refreshed);

            return mergeWithExistingImages(normalized, guestFavorites);
        } catch (error) {
            console.error('Failed to merge favorites', error);
            return guestFavorites;
        }
    }, [user, normalizeFavorites, mergeWithExistingImages]);

    useEffect(() => {
        const loadFavorites = async () => {
            setLoading(true);

            try {
                const saved = localStorage.getItem('favourites');
                const guestFavorites = saved ? JSON.parse(saved) : [];

                if (user) {
                    if (guestFavorites.length > 0) {
                        const merged =
                            await mergeGuestFavoritesIntoBackend(guestFavorites);

                        setFavourites(merged);
                    } else {
                        const serverData = await fetchFavorites();
                        const normalized = normalizeFavorites(serverData);
                        setFavourites(normalized);
                    }
                }
                else {
                    setFavourites(guestFavorites);
                }

            } catch (error) {
                console.error('Failed to load favorites:', error);
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        loadFavorites();
    }, [user, normalizeFavorites, mergeGuestFavoritesIntoBackend]);

    useEffect(() => {
        if (!initialized) return;

        if (favourites.length > 0) {
            localStorage.setItem('favourites', JSON.stringify(favourites));
        } else {
            localStorage.removeItem('favourites');
        }
    }, [favourites, initialized]);

    const toggleFavourite = useCallback(async (course) => {
        const normalizedCourse = {
            ...course,
            coverImageUrl:
                course.coverImageUrl ||
                course.coverImage ||
                course.image ||
                course.thumbnail ||
                course.thumbnailUrl ||
                null,
            addedAt: new Date().toISOString()
        };

        const isFav = favourites.some(i => i.id === course.id);

        // optimistic update
        setFavourites(prev =>
            isFav
                ? prev.filter(i => i.id !== course.id)
                : [...prev, normalizedCourse]
        );

        if (!user) {
            return {
                success: true,
                added: !isFav
            };
        }

        try {
            if (isFav) {
                await removeFavorite(course.id);
            } else {
                await addFavorite(course.id);
            }

            return { success: true, added: !isFav };
        } catch (error) {
            console.error('Toggle favorite failed', error);

            // rollback
            setFavourites(prev =>
                isFav
                    ? [...prev, normalizedCourse]
                    : prev.filter(i => i.id !== course.id)
            );

            return { success: false };
        }
    }, [user, favourites]);

    const isFavourite = useCallback(
        (courseId) => favourites.some(i => i.id === courseId),
        [favourites]
    );

    const getFavouritesCount = useCallback(
        () => favourites.length,
        [favourites]
    );

    const clearFavourites = useCallback(async () => {
        if (user) {
            await Promise.allSettled(
                favourites.map(item => removeFavorite(item.id))
            );
        }

        setFavourites([]);
        return { success: true };
    }, [user, favourites]);

    const refreshFavourites = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await fetchFavorites();
            const normalized = normalizeFavorites(data);

            setFavourites(prev =>
                mergeWithExistingImages(normalized, prev)
            );
        } catch (error) {
            console.error('Failed to refresh favourites', error);
        } finally {
            setLoading(false);
        }
    }, [user, normalizeFavorites, mergeWithExistingImages]);
    const value = useMemo(() => ({
        favourites,
        loading,
        initialized,
        toggleFavourite,
        isFavourite,
        getFavouritesCount,
        clearFavourites,
        refreshFavourites,
        user
    }), [
        favourites,
        loading,
        initialized,
        toggleFavourite,
        isFavourite,
        getFavouritesCount,
        clearFavourites,
        refreshFavourites,
        user
    ]);

    return (
        <FavouritesContext.Provider value={value}>
            {children}
        </FavouritesContext.Provider>
    );
};

export default FavouritesContext;