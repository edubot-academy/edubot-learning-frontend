import { createContext, useContext, useEffect, useState } from 'react';

const FavouritesContext = createContext();

export const FavouritesProvider = ({ children }) => {
    const [favourites, setFavourites] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('favourites')) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('favourites', JSON.stringify(favourites));
    }, [favourites]);

    const toggleFavourite = (course) => {
        setFavourites((prev) =>
            prev.some((item) => item.id === course.id)
                ? prev.filter((item) => item.id !== course.id)
                : [...prev, course]
        );
    };

    const isFavourite = (courseId) => favourites.some((item) => item.id === courseId);

    return (
        <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
            {children}
        </FavouritesContext.Provider>
    );
};

export const useFavourites = () => useContext(FavouritesContext);
