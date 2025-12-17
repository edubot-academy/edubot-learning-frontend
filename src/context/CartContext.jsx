// context/CartContext.js
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import {
    fetchCart as fetchCartApi,
    addCourseToCart,
    removeCourseFromCart,
} from '@services/api';

// Создаем контекст
const CartContext = createContext();

// Кастомный хук для использования контекста
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Провайдер корзины
export const CartProvider = ({ children }) => {
  // Состояние корзины
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
    async (guestCart, serverData) => {
      if (!user || !guestCart?.length) return serverData;

      const serverNormalized = normalizeCartItems(serverData);
      const serverCourseIds = new Set(serverNormalized.map((item) => item.id));
      const toAdd = guestCart.filter((item) => !serverCourseIds.has(item.id));

        if (toAdd.length === 0) return serverData;

        for (const item of toAdd) {
          try {
            await addCourseToCart({ courseId: item.id });
          } catch (error) {
            console.error('Failed to merge guest cart item', item.id, error);
          }
        }

      // Reload cart after merge
      try {
        const refreshed = await fetchCartApi();
        localStorage.removeItem('cart');
        return refreshed;
      } catch (error) {
        console.error('Failed to reload cart after merge', error);
        return serverData;
      }
    },
    [normalizeCartItems, user]
  );

  // Инициализация при монтировании (можно добавить загрузку из localStorage или API)
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const savedCart = parseSavedCart();

        // if authenticated, sync with backend (merge guest cart if exists)
        if (user) {
          let serverData = await fetchCartApi();
          serverData = await mergeGuestCartIntoBackend(savedCart, serverData);
          const normalized = normalizeCartItems(serverData);
          setCartItems(normalized);
          localStorage.setItem('cart', JSON.stringify(normalized));
        } else {
          // guests: use local storage snapshot
          setCartItems(savedCart);
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadCart();
  }, [user, normalizeCartItems, parseSavedCart, mergeGuestCartIntoBackend]);

  // Сохранение в localStorage при изменении корзины
  useEffect(() => {
    if (initialized && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, initialized]);

  // Добавить курс в корзину
  const addToCart = useCallback(async (course) => {
    // Проверяем, нет ли уже курса в корзине
    const alreadyInCart = cartItems.some(item => item.id === course.id);
    
    if (alreadyInCart) {
      return { 
        success: false, 
        message: 'Курс уже в корзине',
        course 
      };
    }

    // Создаем объект для корзины
    const cartItem = {
      ...course,
      cartItemId: `${course.id}_${Date.now()}`, // Уникальный ID для элемента корзины
      addedAt: new Date().toISOString(),
      quantity: 1
    };

    // Добавляем в корзину (API для авторизованных)
    if (user) {
      try {
        const data = await addCourseToCart({ courseId: course.id });
        const normalized = normalizeCartItems(data);
        if (normalized.length) {
          setCartItems(normalized);
          localStorage.setItem('cart', JSON.stringify(normalized));
        } else {
          setCartItems(prev => [...prev, cartItem]);
        }
      } catch (error) {
        console.error('Failed to add to cart', error);
        return { success: false, message: 'Курс корзинага кошулган жок' };
      }
    } else {
      setCartItems(prev => [...prev, cartItem]);
      localStorage.setItem('cart', JSON.stringify([...cartItems, cartItem]));
    }
    
    return { 
      success: true, 
      message: 'Курс добавлен в корзину',
      course: cartItem
    };
  }, [cartItems, user, normalizeCartItems]);

  // Удалить курс из корзины
  const removeFromCart = useCallback(async (courseId) => {
    try {
      if (user) {
        await removeCourseFromCart({ courseId });
      }
    } catch (error) {
      console.error('Failed to remove from cart', error);
    }
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== courseId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  }, [user]);

  // Удалить по cartItemId (если нужно точное удаление)
  const removeCartItem = useCallback(async (cartItemId) => {
    // remove by courseId since backend expects it
    const item = cartItems.find((c) => c.cartItemId === cartItemId);
    const courseId = item?.id;
    if (!courseId) return { success: false };
    try {
      if (user) {
        await removeCourseFromCart({ courseId });
      }
    } catch (error) {
      console.error('Failed to remove cart item', error);
    }
    setCartItems(prev => {
      const updated = prev.filter(item => item.cartItemId !== cartItemId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  }, [user, cartItems]);

  // Очистить корзину
  const clearCart = useCallback(async () => {
    try {
      if (user) {
        // backend has no clear-all endpoint; remove items one by one
        const uniqueCourseIds = [...new Set(cartItems.map((item) => item.id))];
        for (const cid of uniqueCourseIds) {
          try {
            await removeCourseFromCart({ courseId: cid });
          } catch (err) {
            console.error('Failed to remove course from cart', cid, err);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
    setCartItems([]);
    localStorage.removeItem('cart');
    return { success: true };
  }, [user, cartItems]);

  // Обновить количество (если в будущем понадобится)
  const updateQuantity = useCallback((cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeCartItem(cartItemId);
    }
    
    setCartItems(prev => prev.map(item => 
      item.cartItemId === cartItemId 
        ? { ...item, quantity }
        : item
    ));
    
    return { success: true };
  }, [removeCartItem]);

  // Получить количество товаров в корзине
  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cartItems]);

  // Получить количество уникальных курсов
  const getUniqueItemsCount = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

  // Получить общую сумму
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }, [cartItems]);

  // Проверить, есть ли курс в корзине
  const isInCart = useCallback((courseId) => {
    return cartItems.some(item => item.id === courseId);
  }, [cartItems]);

  // Получить элемент корзины по ID курса
  const getCartItem = useCallback((courseId) => {
    return cartItems.find(item => item.id === courseId);
  }, [cartItems]);

  // Загрузить корзину из localStorage (если нужно)
  const loadCartFromStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        return { success: true, items: parsedCart };
      }
      return { success: false, message: 'Корзина пуста' };
    } catch (error) {
      console.error('Ошибка при загрузке корзины:', error);
      return { success: false, message: 'Ошибка загрузки' };
    }
  }, []);

  // Значение контекста
  const value = useMemo(() => ({
    // Состояние
    cartItems,
    loading,
    initialized,
    
    // Основные действия
    addToCart,
    removeFromCart,
    removeCartItem,
    clearCart,
    updateQuantity,
    
    // Геттеры
    getCartItemsCount,
    getUniqueItemsCount,
    getTotalPrice,
    isInCart,
    getCartItem,
    
    // Утилиты
    loadCartFromStorage,
    
    // Синхронизация (для будущего API)
    syncCartWithAPI: async () => {
      if (!user) return { success: true };
      try {
        const data = await fetchCartApi();
        const normalized = normalizeCartItems(data);
        setCartItems(normalized);
        localStorage.setItem('cart', JSON.stringify(normalized));
        return { success: true, items: normalized };
      } catch (error) {
        console.error('Failed to sync cart', error);
        return { success: false };
      }
    }
  }), [
    cartItems,
    loading,
    initialized,
    user,
    addToCart,
    removeFromCart,
    removeCartItem,
    clearCart,
    updateQuantity,
    getCartItemsCount,
    getUniqueItemsCount,
    getTotalPrice,
    isInCart,
    getCartItem,
    loadCartFromStorage
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Экспорт по умолчанию для удобства
export default CartContext;
