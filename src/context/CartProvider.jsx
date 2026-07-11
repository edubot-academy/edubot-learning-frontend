import { useState, useContext, useCallback, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './AuthContext';
import { CartContext } from './CartContext';
import { fetchCart as fetchCartApi, addCourseToCart, removeCourseFromCart } from '../features/cart/api';
import {
    clearStoredCart,
    createOptimisticCartItem,
    loadStoredCart,
    normalizeCartItems,
    saveStoredCart,
} from '../features/cart/storage';

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const { user } = useContext(AuthContext);
    const previousUserRef = useRef(user);

    const mergeGuestCartIntoBackend = useCallback(
        async (guestCart) => {
            if (!user || !guestCart?.length) return;

            try {
                const serverData = await fetchCartApi();
                const serverNormalized = normalizeCartItems(serverData);
                const serverCourseIds = new Set(serverNormalized.map((item) => item.id));
                const toAdd = guestCart.filter((item) => !serverCourseIds.has(item.id));

                for (const item of toAdd) {
                    try {
                        await addCourseToCart({ courseId: item.id });
                    } catch (error) {
                        console.error('Failed to merge guest cart item', item.id, error);
                    }
                }

                const refreshed = await fetchCartApi();
                const normalized = normalizeCartItems(refreshed);
                setCartItems(normalized);
                saveStoredCart(normalized);
            } catch (error) {
                console.error('Failed to merge cart', error);
            }
        },
        [user]
    );

    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            try {
                const savedCart = loadStoredCart();

                if (user) {
                    const serverData = await fetchCartApi();
                    const serverNormalized = normalizeCartItems(serverData);

                    if (savedCart.length > 0) {
                        await mergeGuestCartIntoBackend(savedCart);
                    } else {
                        setCartItems(serverNormalized);
                        saveStoredCart(serverNormalized);
                    }
                } else {
                    setCartItems(savedCart);
                }
            } catch (error) {
                console.error('Failed to load cart:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    const savedCart = loadStoredCart();
                    setCartItems(savedCart);
                }
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        loadCart();
    }, [user, mergeGuestCartIntoBackend]);

    useEffect(() => {
        if (!initialized) return;
        saveStoredCart(cartItems);
    }, [cartItems, initialized]);

    useEffect(() => {
        if (previousUserRef.current && !user) {
            setCartItems([]);
            clearStoredCart();
        }
        previousUserRef.current = user;
    }, [user]);

    const addToCart = useCallback(
        async (course) => {
            if (String(course?.courseType || 'video').toLowerCase() !== 'video') {
                return {
                    success: false,
                    message: t('cartProvider.messages.videoOnly'),
                };
            }

            const alreadyInCart = cartItems.some((item) => item.id === course.id);
            if (alreadyInCart) {
                return { success: false, message: t('cartProvider.messages.alreadyInCart') };
            }

            const cartItem = createOptimisticCartItem(course);

            setCartItems((prev) => {
                const newCart = [...prev, cartItem];
                saveStoredCart(newCart);
                return newCart;
            });

            if (user) {
                try {
                    await addCourseToCart({ courseId: course.id });
                    const data = await fetchCartApi();
                    const normalized = normalizeCartItems(data);
                    setCartItems(normalized);
                    saveStoredCart(normalized);
                } catch (error) {
                    console.error('Failed to add to cart via API', error);
                    setCartItems((prev) => {
                        const updated = prev.filter((item) => item.id !== course.id);
                        saveStoredCart(updated);
                        return updated;
                    });
                    return { success: false, message: t('cartProvider.messages.addFailed') };
                }
            }

            return {
                success: true,
                message: t('cartProvider.messages.added'),
            };
        },
        [user, cartItems, t]
    );

    const removeFromCart = useCallback(
        async (courseId) => {
            setCartItems((prev) => {
                const updated = prev.filter((item) => item.id !== courseId);
                saveStoredCart(updated);
                return updated;
            });

            if (user) {
                try {
                    await removeCourseFromCart({ courseId });
                } catch (error) {
                    console.error('Failed to remove from cart via API', error);
                }
            }

            return { success: true };
        },
        [user]
    );

    const removeCartItem = useCallback(
        async (cartItemId) => {
            setCartItems((prev) => {
                const item = prev.find((c) => c.cartItemId === cartItemId);
                if (!item) return prev;

                if (user) {
                    removeCourseFromCart({ courseId: item.id }).catch((err) => {
                        console.error('Failed to remove from API', err);
                    });
                }

                const updated = prev.filter((i) => i.cartItemId !== cartItemId);
                saveStoredCart(updated);
                return updated;
            });

            return { success: true };
        },
        [user]
    );

    const clearCart = useCallback(async () => {
        if (user) {
            try {
                const currentItems = [...cartItems];
                const uniqueCourseIds = [...new Set(currentItems.map((item) => item.id))];
                for (const cid of uniqueCourseIds) {
                    try {
                        await removeCourseFromCart({ courseId: cid });
                    } catch (err) {
                        console.error('Failed to remove course from cart', cid, err);
                    }
                }
            } catch (error) {
                console.error('Failed to clear cart', error);
            }
        }

        setCartItems([]);
        clearStoredCart();
        return { success: true };
    }, [user, cartItems]);

    const getCartItemsCount = useCallback(() => {
        return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [cartItems]);

    const getUniqueItemsCount = useCallback(() => {
        return cartItems.length;
    }, [cartItems]);

    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = item.quantity || 1;
            return total + price * quantity;
        }, 0);
    }, [cartItems]);

    const isInCart = useCallback(
        (courseId) => {
            return cartItems.some((item) => item.id === courseId);
        },
        [cartItems]
    );

    const value = useMemo(
        () => ({
            cartItems,
            loading,
            initialized,
            addToCart,
            removeFromCart,
            removeCartItem,
            clearCart,
            getCartItemsCount,
            getUniqueItemsCount,
            getTotalPrice,
            isInCart,
            user,
        }),
        [
            cartItems,
            loading,
            initialized,
            addToCart,
            removeFromCart,
            removeCartItem,
            clearCart,
            getCartItemsCount,
            getUniqueItemsCount,
            getTotalPrice,
            isInCart,
            user,
        ]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
