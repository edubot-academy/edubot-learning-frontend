// pages/Cart.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from '@shared-ui/Button';
import toast from 'react-hot-toast';

// Импортируем иконки из react-icons
import { 
  FaTrash, 
  FaClock, 
  FaBook, 
  FaUser,
  FaChevronLeft,
  FaShoppingBag,
  FaShieldAlt 
} from 'react-icons/fa';
// Или из другого набора:
// import { MdDelete, MdAccessTime, MdMenuBook, MdPerson } from 'react-icons/md';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    clearCart, 
    getTotalPrice,
    getCartItemsCount 
  } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalPrice = getTotalPrice();
  const cartItemsCount = getCartItemsCount();

  // Обработчики (остаются те же)
  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/checkout');
    }, 1000);
  };

  const handleClearCart = () => {
    const toastId = toast.custom((t) => (
      <div className={`bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <p className="text-sm text-gray-800 font-medium">Очистить корзину?</p>
        <p className="text-xs text-gray-500 mt-1">Все товары будут удалены.</p>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              clearCart();
              toast.dismiss(toastId);
              toast.success('Корзина очищена');
            }}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Очистить
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const handleContinueShopping = () => {
    navigate('/courses');
  };

  if (cartItemsCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Хлебные крошки */}
          <nav className="flex items-center text-sm text-gray-600 mb-8">
            <button
              onClick={() => navigate('/')}
              className="hover:text-orange-500 transition-colors"
            >
              Башкы бет
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Корзина</span>
          </nav>

          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FaShoppingBag size={48} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Корзина бош</h2>
              <p className="text-gray-600 mb-6">
                Сиздин корзинаңызда эч кандай курс жок. Курстарды кошуу үчүн каталогго өтүңүз.
              </p>
              <Button 
                variant="primary" 
                onClick={handleContinueShopping}
                className="px-6"
              >
                Курстарды карап чыгуу
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Хлебные крошки */}
        <nav className="flex items-center text-sm text-gray-600 mb-8">
          <button
            onClick={() => navigate('/')}
            className="hover:text-orange-500 transition-colors"
          >
            Башкы бет
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Корзина</span>
        </nav>

        {/* Заголовок и кнопка очистки */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Корзина
          </h1>
          <button
            onClick={handleClearCart}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <FaTrash size={14} />
            Очистить корзину
          </button>
        </div>
        
        <p className="text-gray-600 mb-8">
          {cartItemsCount} {cartItemsCount === 1 ? 'курс' : cartItemsCount < 5 ? 'курса' : 'курсов'} в корзине
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Левая часть - список курсов */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Список курсов */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row items-start gap-6 p-4 border-b border-gray-200 hover:bg-gray-50">
                    {/* Изображение курса */}
                    <div className="w-full md:w-48 h-40 md:h-32 flex-shrink-0">
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Информация о курсе */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col h-full">
                        {/* Заголовок и кнопка удаления */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 flex-1 mr-4">
                            {item.title}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            aria-label="Удалить из корзины"
                          >
                            <FaTrash size={20} />
                          </button>
                        </div>
                        
                        {/* Инструктор */}
                        <div className="flex items-center text-gray-600 mb-3">
                          <FaUser size={16} className="mr-2" />
                          <span className="text-sm">{item.instructor?.fullName}</span>
                        </div>
                        
                        {/* Метаданные курса */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="px-3 py-1.5 text-xs rounded-full border border-gray-300 flex items-center gap-1">
                            новичок
                          </span>
                          <span className="px-3 py-1.5 text-xs rounded-full border border-gray-300 flex items-center gap-1">
                            <FaClock size={12} />
                            22 всего часа
                          </span>
                          <span className="px-3 py-1.5 text-xs rounded-full border border-gray-300 flex items-center gap-1">
                            <FaBook size={12} />
                            155 лекций
                          </span>
                        </div>
                        
                        {/* Цена */}
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <div className="flex text-yellow-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span className="text-lg" key={i}>★</span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {parseFloat(item.price).toLocaleString()} сом
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Продолжить покупки */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleContinueShopping}
                  className="flex items-center text-orange-500 hover:text-orange-600 font-medium"
                >
                  <FaChevronLeft size={20} />
                  <span className="ml-2">Дагы курс кошуу</span>
                </button>
              </div>
            </div>
          </div>

          {/* Правая часть - итоги */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Заказдын жыйынтыгы
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Курстардын саны:</span>
                    <span className="font-medium">{cartItemsCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Жалпы сумма:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {totalPrice.toLocaleString()} сом
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Төлөөчү сумма:</span>
                    <span className="text-2xl font-bold text-orange-500">
                      {totalPrice.toLocaleString()} сом
                    </span>
                  </div>
                </div>
                
                {/* Кнопка оформления заказа */}
                <div className="mt-8">
                  <Button
                    variant="primary"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-4 text-lg"
                  >
                    {isProcessing ? 'Өңдөлүүдө...' : 'Төлөөгө өтүү'}
                  </Button>
                </div>
              </div>
              
              {/* Информация о гарантиях */}
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start">
                  <FaShieldAlt size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">30 күндүк акысыз кайтаруу</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Курс сизге жакпаса, 30 күн ичинде акысыз кайтара аласыз
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
