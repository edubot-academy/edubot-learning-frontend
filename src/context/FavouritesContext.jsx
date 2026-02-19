import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { fetchFavorites, addFavorite, removeFavorite } from '../features/favorites/api';

const FavouritesContext = createContext();

export const useFavourites = () => {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error('useFavourites must be used within FavouritesProvider');
    }
    return context;
};

export const FavouritesProvider = ({ children }) => {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const { user } = useContext(AuthContext);

    // 1. СНАЧАЛА загружаем из localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('favourites');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log(' Initial load from localStorage:', parsed);
                setFavourites(parsed);
            }
        } catch (error) {
            console.error('Failed to load initial favorites:', error);
        }
    }, []); // Пустой массив - один раз при монтировании

    const normalizeFavorites = useCallback((data = []) => {
        const itemsArray = Array.isArray(data?.items) 
            ? data.items 
            : Array.isArray(data) 
                ? data 
                : [];
        
        return itemsArray.map(item => {
            const course = item.course || item;
            return {
                ...course,
                favoriteId: item.id || course.id,
                addedAt: item.addedAt || new Date().toISOString()
            };
        });
    }, []);

    //  2. ПОТОМ загружаем с сервера (если нужно)
    useEffect(() => {
        const loadFavorites = async () => {
            setLoading(true);
            try {
                // Используем текущие favorites из state
                const currentFavorites = favourites;

                if (user) {
                    const serverData = await fetchFavorites();
                    const serverNormalized = normalizeFavorites(serverData);
                    
                    if (currentFavorites.length > 0) {
                        await mergeGuestFavoritesIntoBackend(currentFavorites);
                    } else {
                        setFavourites(serverNormalized);
                    }
                }
                // Для гостя ничего не делаем - данные уже в state из localStorage
            } catch (error) {
                console.error('Failed to load favorites:', error);
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        if (!initialized) {
            loadFavorites();
        }
    }, [user, initialized]); // Убрали favourites из зависимостей!

    const mergeGuestFavoritesIntoBackend = useCallback(async (guestFavorites) => {
        if (!user || !guestFavorites?.length) return;

        try {
            const serverData = await fetchFavorites();
            const serverNormalized = normalizeFavorites(serverData);
            const serverCourseIds = new Set(serverNormalized.map(item => item.id));
            
            const toAdd = guestFavorites.filter(item => !serverCourseIds.has(item.id));

            for (const item of toAdd) {
                try {
                    await addFavorite(item.id);
                } catch (error) {
                    console.error('Failed to merge guest favorite item', item.id, error);
                }
            }

            if (toAdd.length > 0) {
                const refreshed = await fetchFavorites();
                const normalized = normalizeFavorites(refreshed);
                setFavourites(normalized);
            } else {
                setFavourites(serverNormalized);
            }
        } catch (error) {
            console.error('Failed to merge favorites', error);
        }
    }, [normalizeFavorites, user]);

    // 3. Сохраняем в localStorage при изменении
    useEffect(() => {
        if (initialized) {
            console.log('💾 Saving to localStorage:', favourites);
            if (favourites.length > 0) {
                localStorage.setItem('favourites', JSON.stringify(favourites));
            } else {
                localStorage.removeItem('favourites');
            }
        }
    }, [favourites, initialized]);

    // Очистка при разлогине
    useEffect(() => {
        if (!user) {
            setFavourites([]);
            localStorage.removeItem('favourites');
        }
    }, [user]);

    const toggleFavourite = useCallback(async (course) => {
        const isCurrentlyFav = favourites.some(item => item.id === course.id);
        
        setFavourites(prev => {
            const newFavourites = isCurrentlyFav
                ? prev.filter(item => item.id !== course.id)
                : [...prev, { ...course, addedAt: new Date().toISOString() }];
            
            return newFavourites;
        });

        if (user) {
            try {
                if (isCurrentlyFav) {
                    await removeFavorite(course.id);
                } else {
                    await addFavorite(course.id);
                }
            } catch (error) {
                console.error('Failed to toggle favorite via API', error);
                
                setFavourites(prev => {
                    const rolledBack = isCurrentlyFav
                        ? [...prev, course]
                        : prev.filter(item => item.id !== course.id);
                    
                    return rolledBack;
                });
                
                return { 
                    success: false, 
                    message: isCurrentlyFav 
                        ? 'Не удалось удалить из избранного' 
                        : 'Не удалось добавить в избранное' 
                };
            }
        }

        return { 
            success: true, 
            message: isCurrentlyFav 
                ? 'Удалено из избранного' 
                : 'Добавлено в избранное',
            added: !isCurrentlyFav
        };
    }, [user, favourites]);

    const isFavourite = useCallback((courseId) => {
        return favourites.some(item => item.id === courseId);
    }, [favourites]);

    const getFavouritesCount = useCallback(() => {
        return favourites.length;
    }, [favourites]);

    const clearFavourites = useCallback(async () => {
        if (user) {
            try {
                const currentFavourites = [...favourites];
                for (const item of currentFavourites) {
                    try {
                        await removeFavorite(item.id);
                    } catch (err) {
                        console.error('Failed to remove favorite', item.id, err);
                    }
                }
            } catch (error) {
                console.error('Failed to clear favourites', error);
            }
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
            setFavourites(normalized);
        } catch (error) {
            console.error('Failed to refresh favourites', error);
        } finally {
            setLoading(false);
        }
    }, [user, normalizeFavorites]);

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