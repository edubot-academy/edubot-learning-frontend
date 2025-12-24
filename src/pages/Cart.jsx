// pages/CartPage.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@app/providers';
import { useCart } from '../context/CartContext';
import { BsCartX, BsTrash } from 'react-icons/bs';
import { FaArrowRight } from 'react-icons/fa';
import AuthRequiredModal from '../features/courses/components/AuthRequiredModal';
import Button from '@shared-ui/Button';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { 
    cartItems, 
    loading, 
    removeFromCart, 
    getTotalPrice, 
    clearCart,
    getUniqueItemsCount 
  } = useCart();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  const handleCloseModal = () => {
    setShowAuthModal(false);
    navigate('/courses');
  };

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // Здесь будет логика оформления заказа
    console.log('Переход к оформлению заказа');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={handleCloseModal}
          title="Корзина"
          description="Корзинаңызды көрүү үчүн системага кириңиз же жаңы аккаунт түзүңүз"
        />
        
        <div className="text-center max-w-md">
          <BsCartX className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Корзинага кирүү керек</h2>
          <p className="text-gray-600 mb-8">
            Корзинаңызды көрүү жана курстарды сатып алуу үчүн системага кириңиз же катталыңыз
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Катталуу
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full border border-orange-500 text-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Кируу
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Корзина жүктөлүүдө...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <BsCartX className="w-24 h-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Корзинаңыз бош</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Сиздин корзинаңызда эч кандай курс жок. Биздин курстарды изилдеп, биринчисин кошуңуз!
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/courses')}
          className="px-8 py-3"
        >
          Курстарды карап чыгуу
        </Button>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const itemsCount = getUniqueItemsCount();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Менин корзинам</h1>
          <button
            onClick={clearCart}
            className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium"
          >
            <BsTrash className="w-4 h-4 mr-2" />
            Бардыгын өчүрүү
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список курсов */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.cartItemId || item.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-48 sm:h-auto">
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-1">
                          Инструктор: {item.instructor?.fullName || 'Инструктор'}
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-500">Рейтинг: {item.ratingAverage || '5.0'}</span>
                          <span className="text-sm text-gray-500">({item.ratingCount || 0})</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.level && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {item.level}
                            </span>
                          )}
                          {item.durationInHours && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {item.durationInHours} саат
                            </span>
                          )}
                          {item.lessonCount && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {item.lessonCount} лекция
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className="text-2xl font-bold text-gray-900 mb-4">{item.price} сом</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <BsTrash className="w-4 h-4 mr-1" />
                          Өчүрүү
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Сумма заказа */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Заказды жыйынтыктоо</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Бардык курстар:</span>
                  <span className="font-semibold">{itemsCount}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Жалпы сумма:</span>
                  <span className="text-2xl font-bold text-orange-500">{totalPrice} сом</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleCheckout}
                  className="w-full py-4 text-lg font-semibold flex items-center justify-center"
                >
                  Сатып алууну улантуу
                  <FaArrowRight className="ml-2" />
                </Button>
                
                <Link to="/courses">
                  <Button
                    variant="secondary"
                    className="w-full py-3"
                  >
                    Курстарды улантуу
                  </Button>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Сатып алууну аяктагандан кийин, сиз курстарга түздөн-түз кире аласыз
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;