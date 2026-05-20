import { useState, useContext, useCallback, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './AuthContext';
import { CartContext } from './CartContext';
import { fetchCart as fetchCartApi, addCourseToCart, removeCourseFromCart } from '@services/api';

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const { user } = useContext(AuthContext);
    const previousUserRef = useRef(user);

    const normalizeCartItems = useCallback((data = []) => {
        const itemsArray = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
        return itemsArray.map((item) => {
            const course = item.course || item;
            return {
                ...course,
                cartItemId: item.id || item.cartItemId || course.id,
                addedAt: item.addedAt || new Date().toISOString(),
                quantity: item.quantity || 1,
            };
        });
    }, []);

    const parseSavedCart = useCallback(() => {
        try {
            const saved = localStorage.getItem('cart');
            const parsed = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(parsed)) return [];

            return parsed
                .filter((item) => item && typeof item === 'object')
                .map((item) => ({
                    ...item,
                    cartItemId: item.cartItemId || item.id,
                }));
        } catch (error) {
            console.error('Failed to parse saved cart', error);
            return [];
        }
    }, []);

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
                localStorage.setItem('cart', JSON.stringify(normalized));
            } catch (error) {
                console.error('Failed to merge cart', error);
            }
        },
        [normalizeCartItems, user]
    );

    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            try {
                const savedCart = parseSavedCart();

                if (user) {
                    const serverData = await fetchCartApi();
                    const serverNormalized = normalizeCartItems(serverData);

                    if (savedCart.length > 0) {
                        await mergeGuestCartIntoBackend(savedCart);
                    } else {
                        setCartItems(serverNormalized);
                        localStorage.setItem('cart', JSON.stringify(serverNormalized));
                    }
                } else {
                    setCartItems(savedCart);
                }
            } catch (error) {
                console.error('Failed to load cart:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    const savedCart = parseSavedCart();
                    setCartItems(savedCart);
                }
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        loadCart();
    }, [user, normalizeCartItems, parseSavedCart, mergeGuestCartIntoBackend]);

    useEffect(() => {
        if (!initialized) return;
        if (cartItems.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } else {
            localStorage.removeItem('cart');
        }
    }, [cartItems, initialized]);

    useEffect(() => {
        if (previousUserRef.current && !user) {
            setCartItems([]);
            localStorage.removeItem('cart');
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

            const cartItem = {
                ...course,
                cartItemId: `${course.id}_${Date.now()}`,
                addedAt: new Date().toISOString(),
                quantity: 1,
            };

            setCartItems((prev) => {
                const newCart = [...prev, cartItem];
                localStorage.setItem('cart', JSON.stringify(newCart));
                return newCart;
            });

            if (user) {
                try {
                    await addCourseToCart({ courseId: course.id });
                    const data = await fetchCartApi();
                    const normalized = normalizeCartItems(data);
                    setCartItems(normalized);
                    localStorage.setItem('cart', JSON.stringify(normalized));
                } catch (error) {
                    console.error('Failed to add to cart via API', error);
                    setCartItems((prev) => {
                        const updated = prev.filter((item) => item.id !== course.id);
                        localStorage.setItem('cart', JSON.stringify(updated));
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
        [user, normalizeCartItems, cartItems, t]
    );

    const removeFromCart = useCallback(
        async (courseId) => {
            setCartItems((prev) => {
                const updated = prev.filter((item) => item.id !== courseId);
                localStorage.setItem('cart', JSON.stringify(updated));
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
                localStorage.setItem('cart', JSON.stringify(updated));
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
        localStorage.removeItem('cart');
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
