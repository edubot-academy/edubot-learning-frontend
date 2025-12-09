// context/CartContext.js
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';

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

  // Инициализация при монтировании (можно добавить загрузку из localStorage или API)
  useEffect(() => {
    // TODO: Когда появится API, можно добавить загрузку корзины пользователя
    // const loadCart = async () => {
    //   try {
    //     setLoading(true);
    //     const cartData = await fetchCartFromAPI();
    //     setCartItems(cartData);
    //   } catch (error) {
    //     console.error('Failed to load cart:', error);
    //   } finally {
    //     setLoading(false);
    //     setInitialized(true);
    //   }
    // };
    
    // loadCart();
    
    // Временная инициализация
    setInitialized(true);
  }, []);

  // Сохранение в localStorage при изменении корзины
  useEffect(() => {
    if (initialized && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, initialized]);

  // Добавить курс в корзину
  const addToCart = useCallback((course) => {
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

    // Добавляем в корзину
    setCartItems(prev => [...prev, cartItem]);
    
    return { 
      success: true, 
      message: 'Курс добавлен в корзину',
      course: cartItem
    };
  }, [cartItems]);

  // Удалить курс из корзины
  const removeFromCart = useCallback((courseId) => {
    setCartItems(prev => prev.filter(item => item.id !== courseId));
    return { success: true };
  }, []);

  // Удалить по cartItemId (если нужно точное удаление)
  const removeCartItem = useCallback((cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    return { success: true };
  }, []);

  // Очистить корзину
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart');
    return { success: true };
  }, []);

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
      // TODO: Реализовать синхронизацию с API
      console.log('Синхронизация корзины с API...');
      return { success: true };
    }
  }), [
    cartItems,
    loading,
    initialized,
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