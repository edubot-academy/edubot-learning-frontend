import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import {
    fetchCart as fetchCartApi,
    addCourseToCart,
    removeCourseFromCart,
} from '@services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user } = useContext(AuthContext);

  const normalizeCartItems = useCallback((data = []) => {
    const itemsArray = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
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
      return saved ? JSON.parse(saved) : [];
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
          let serverData = await fetchCartApi();
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
          // Для гостей используем только localStorage
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

  const addToCart = useCallback(async (course) => {
    setCartItems(prev => {
      const alreadyInCart = prev.some(item => item.id === course.id);
      
      if (alreadyInCart) {
        return prev;
      }

      const cartItem = {
        ...course,
        cartItemId: `${course.id}_${Date.now()}`,
        addedAt: new Date().toISOString(),
        quantity: 1
      };

      const newCart = [...prev, cartItem];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });

    // Для авторизованных - дополнительно API запрос
    if (user) {
      try {
        await addCourseToCart({ courseId: course.id });
        // После успешного API запроса перезагружаем корзину
        const data = await fetchCartApi();
        const normalized = normalizeCartItems(data);
        setCartItems(normalized);
        localStorage.setItem('cart', JSON.stringify(normalized));
      } catch (error) {
        console.error('Failed to add to cart via API', error);
        // Оставляем в localStorage даже если API ошибка
      }
    }
    
    return { 
      success: true, 
      message: 'Курс добавлен в корзину'
    };
  }, [user, normalizeCartItems]);

  const removeFromCart = useCallback(async (courseId) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== courseId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });

    // Для авторизованных - удаляем через API
    if (user) {
      try {
        await removeCourseFromCart({ courseId });
      } catch (error) {
        console.error('Failed to remove from cart via API', error);
      }
    }
    
    return { success: true };
  }, [user]);

  const removeCartItem = useCallback(async (cartItemId) => {
    setCartItems(prev => {
      const item = prev.find(c => c.cartItemId === cartItemId);
      if (!item) return prev;
      
      // Для авторизованных - удаляем через API
      if (user) {
        removeCourseFromCart({ courseId: item.id }).catch(err => {
          console.error('Failed to remove from API', err);
        });
      }
      
      const updated = prev.filter(i => i.cartItemId !== cartItemId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    
    return { success: true };
  }, [user]);

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
      return total + (price * quantity);
    }, 0);
  }, [cartItems]);

  const isInCart = useCallback((courseId) => {
    return cartItems.some(item => item.id === courseId);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    loading,
    initialized,
    addToCart,
    removeFromCart,
    removeCartItem, // Добавлена обратно для совместимости
    clearCart,
    getCartItemsCount,
    getUniqueItemsCount,
    getTotalPrice,
    isInCart,
    user,
  }), [
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
    user
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;