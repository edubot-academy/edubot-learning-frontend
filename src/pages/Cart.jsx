import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { BsTrash, BsCartX } from 'react-icons/bs';
import Button from '@shared-ui/Button';
import ContactCourseModal from '@features/courses/components/ContactCourseModal';
import UnauthModal from '../shared/ui/UnauthModal';
import Loader from '@shared/ui/Loader';
import EmptyState from '@components/ui/dashboard/EmptyState';

const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return 'Баасы көрсөтүлгөн эмес';
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) return 'Баасы көрсөтүлгөн эмес';

    return `${new Intl.NumberFormat('ru-RU').format(numericPrice)} сом`;
};

const Cart = () => {
    const { cartItems, loading, removeCartItem, getTotalPrice, clearCart, user } = useCart();

    const navigate = useNavigate();
    const [showContactModal, setShowContactModal] = useState(false);
    const [showUnauthModal, setShowUnauthModal] = useState(false);

    const handleCheckout = () => {
        if (!user) {
            setShowUnauthModal(true);
            return;
        }

        setShowContactModal(true);
    };

    if (loading) {
        return (
            <Loader fullScreen />
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
                <EmptyState
                    title="Себетиңиз бош"
                    subtitle="Өз алдынча окуй турган видео курстарды каталогдон тандап, себетке кошуңуз."
                    variant="discovery"
                    icon={<BsCartX className="h-14 w-14 text-edubot-orange" aria-hidden="true" />}
                    action={{ label: 'Курстарды карап чыгуу', onClick: () => navigate('/courses') }}
                    className="w-full max-w-xl rounded-[24px] border border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950"
                />
            </div>
        );
    }

    const totalPrice = getTotalPrice();

    return (
        <div className="min-h-screen py-8">
            <UnauthModal
                isOpen={showUnauthModal}
                onClose={() => setShowUnauthModal(false)}
                actionType="cart"
                courseId={cartItems.length > 0 ? cartItems[0].id : null}
                courseTitle={cartItems.length > 0 ? cartItems[0].title : ''}
                course={cartItems.length > 0 ? cartItems[0] : null}
            />
            <ContactCourseModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                cartItems={cartItems}
                totalPrice={totalPrice}
            />
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Менин себетим</h1>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={clearCart}
                            className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <BsTrash className="w-4 h-4 mr-2" aria-hidden="true" />
                            Бардыгын өчүрүү
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.cartItemId || item.id}
                                className="rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    <Link to={`/courses/${item.id}`} className="block sm:w-40">
                                        <div className="h-48 sm:h-full">
                                            {item.coverImageUrl ? (
                                                <img
                                                    src={item.coverImageUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <span className="text-gray-400 dark:text-gray-600">Сүрөт жок</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="flex-1 p-4 sm:p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                                            <Link to={`/courses/${item.id}`} className="flex-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2 hover:text-orange-500 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-[#a6adba] text-sm mb-2">
                                                        Инструктор:{' '}
                                                        {item.instructor?.fullName || 'Инструктор'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {item.level && (
                                                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-[#a6adba] text-xs rounded">
                                                                {item.level}
                                                            </span>
                                                        )}
                                                        {item.durationInHours && (
                                                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-[#a6adba] text-xs rounded">
                                                                {item.durationInHours} саат
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="flex flex-col items-start justify-between sm:items-end">
                                                <p className="text-xl font-bold mb-3 sm:mb-0">
                                                    {formatPrice(item.price)}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCartItem(item.cartItemId || item.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    <BsTrash className="w-3 h-3 mr-1" aria-hidden="true" />
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
                        <div className="rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h3 className="text-xl font-bold mb-6">Заказды жыйынтыктоо</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-[#a6adba]">
                                        Бардык курстар:
                                    </span>
                                    <span className="font-semibold">{cartItems.length}</span>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Жалпы сумма:</span>
                                        <span className="text-2xl font-bold text-orange-500">
                                            {formatPrice(totalPrice)}
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
