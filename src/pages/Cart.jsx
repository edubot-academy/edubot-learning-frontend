import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { BsTrash, BsCartX } from 'react-icons/bs';
import { FaShoppingCart } from 'react-icons/fa';
import Button from '@shared-ui/Button';
import Modal from '@shared-ui/Modal'; // Используем существующую модалку

const Cart = () => {
    const { cartItems, loading, removeFromCart, getTotalPrice, clearCart, user } = useCart();

    const navigate = useNavigate();
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const handleCheckout = () => {
        if (!user) {
            setShowRegisterModal(true);
            return;
        }
        // Здесь будет логика оформления заказа для авторизованных
        console.log('Переход к оформлению заказа');
    };

    const handleRegister = () => {
        setShowRegisterModal(false);
        navigate('/register', { state: { from: '/cart' } });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-gray-600">Себет жүктөлүүдө...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <BsCartX className="w-24 h-24 text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Себетиңиз бош</h2>
                <p className="text-gray-600 mb-8 text-center max-w-md">
                    Сиздин себетиңизде эч кандай курс жок. Биздин курстарды изилдеп, биринчисин
                    кошуңуз!
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Используем существующую Modal компоненту */}
            <Modal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                title="Себет"
                size="md"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <FaShoppingCart className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Катталуу керек</h3>
                        </div>
                    </div>

                    <p className="text-gray-600">
                        Сатып алууну аяктоо үчүн аккаунт түзүшүңүз керек. Ал учурда сиздин
                        себетиңиздеги курстар сакталып калат.
                    </p>

                    <div className="space-y-3 pt-2">
                        <Button variant="primary" onClick={handleRegister} className="w-full py-3">
                            Аккаунт түзүү
                        </Button>

                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm text-center"
                        >
                            Кийинчерээк
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Менин себетим</h1>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={clearCart}
                            className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <BsTrash className="w-4 h-4 mr-2" />
                            Бардыгын өчүрүү
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Список курсов */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.cartItemId || item.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                            >
                                <Link to={`/courses/${item.id}`} className="block">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-40 h-48 sm:h-auto">
                                            {item.coverImageUrl ? (
                                                <img
                                                    src={item.coverImageUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-400">
                                                        Сүрөт жок
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row justify-between">
                                                <div className="flex-1 mb-4 sm:mb-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-500 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        Инструктор:{' '}
                                                        {item.instructor?.fullName || 'Инструктор'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {item.level && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                                {item.level}
                                                            </span>
                                                        )}
                                                        {item.durationInHours && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                                {item.durationInHours} саат
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-start sm:items-end justify-between">
                                                    <p className="text-xl font-bold text-gray-900 mb-3 sm:mb-0">
                                                        {item.price} сом
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            removeFromCart(item.id);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                                    >
                                                        <BsTrash className="w-3 h-3 mr-1" />
                                                        Өчүрүү
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Сумма заказа */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                Буйрутманы жыйынтыктоо
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Бардык курстар:</span>
                                    <span className="font-semibold">{cartItems.length}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">
                                            Жалпы сумма:
                                        </span>
                                        <span className="text-2xl font-bold text-orange-500">
                                            {totalPrice} сом
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    variant="primary"
                                    onClick={handleCheckout}
                                    className="w-full py-3"
                                >
                                    Сатып алуу
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
