import { useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { FavouritesContext } from './FavouritesContext';
import { fetchFavorites, addFavorite, removeFavorite } from '../features/favorites/api';
import {
    loadStoredFavourites,
    mergeFavoriteImages,
    normalizeFavoriteCourse,
    normalizeFavoriteItems,
    saveStoredFavourites,
} from '../features/favorites/storage';

export const FavouritesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);

    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const mergeGuestFavoritesIntoBackend = useCallback(
        async (guestFavorites) => {
            if (!user || !guestFavorites?.length) return [];

            try {
                const serverData = await fetchFavorites();
                const serverNormalized = normalizeFavoriteItems(serverData);

                const serverIds = new Set(serverNormalized.map((item) => item.id));

                const toAdd = guestFavorites.filter((item) => !serverIds.has(item.id));

                await Promise.allSettled(toAdd.map((item) => addFavorite(item.id)));

                const refreshed = await fetchFavorites();
                const normalized = normalizeFavoriteItems(refreshed);

                return mergeFavoriteImages(normalized, guestFavorites);
            } catch (error) {
                console.error('Failed to merge favorites', error);
                return guestFavorites;
            }
        },
        [user]
    );

    useEffect(() => {
        const loadFavorites = async () => {
            setLoading(true);

            try {
                const guestFavorites = loadStoredFavourites();

                if (user) {
                    if (guestFavorites.length > 0) {
                        const merged = await mergeGuestFavoritesIntoBackend(guestFavorites);
                        setFavourites(merged);
                    } else {
                        const serverData = await fetchFavorites();
                        const normalized = normalizeFavoriteItems(serverData);
                        setFavourites(normalized);
                    }
                } else {
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
    }, [user, mergeGuestFavoritesIntoBackend]);

    useEffect(() => {
        if (!initialized) return;
        saveStoredFavourites(favourites);
    }, [favourites, initialized]);

    const toggleFavourite = useCallback(
        async (course) => {
            const normalizedCourse = normalizeFavoriteCourse(course);

            const isFav = favourites.some((item) => item.id === course.id);

            setFavourites((prev) =>
                isFav ? prev.filter((item) => item.id !== course.id) : [...prev, normalizedCourse]
            );

            if (!user) {
                return {
                    success: true,
                    added: !isFav,
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

                setFavourites((prev) =>
                    isFav
                        ? [...prev, normalizedCourse]
                        : prev.filter((item) => item.id !== course.id)
                );

                return { success: false };
            }
        },
        [user, favourites]
    );

    const isFavourite = useCallback(
        (courseId) => favourites.some((item) => item.id === courseId),
        [favourites]
    );

    const getFavouritesCount = useCallback(() => favourites.length, [favourites]);

    const clearFavourites = useCallback(async () => {
        if (user) {
            await Promise.allSettled(favourites.map((item) => removeFavorite(item.id)));
        }

        setFavourites([]);
        return { success: true };
    }, [user, favourites]);

    const refreshFavourites = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await fetchFavorites();
            const normalized = normalizeFavoriteItems(data);

            setFavourites((prev) => mergeFavoriteImages(normalized, prev));
        } catch (error) {
            console.error('Failed to refresh favourites', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const value = useMemo(
        () => ({
            favourites,
            loading,
            initialized,
            toggleFavourite,
            isFavourite,
            getFavouritesCount,
            clearFavourites,
            refreshFavourites,
            user,
        }),
        [
            favourites,
            loading,
            initialized,
            toggleFavourite,
            isFavourite,
            getFavouritesCount,
            clearFavourites,
            refreshFavourites,
            user,
        ]
    );

    return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
};
