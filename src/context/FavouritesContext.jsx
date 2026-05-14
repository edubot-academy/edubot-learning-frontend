import { createContext, useContext } from 'react';

export const FavouritesContext = createContext();

export const useFavourites = () => {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error('useFavourites must be used within FavouritesProvider');
    }
    return context;
};

export default FavouritesContext;
