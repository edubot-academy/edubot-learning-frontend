import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@shared/ui/Modal';
import CardType from '../../assets/icons/card_type.svg';
import { checkoutManual } from '../cart/api';
import { useCart } from '../../context/CartContext';

const SuccessPaymentModal = ({ open, onClose, receipt }) => (
    <Modal isOpen={open} onClose={onClose} showCloseButton title="Успешная оплата" size="sm">
        <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto">
                ✓
            </div>
            <div className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                ОсОО "EduBot"
                {'\n'}ИНН 030123456789
                {'\n'}Төлөм шилтемеси: {receipt.reference}
                {'\n'}Сумма: {receipt.amount} {receipt.currency}
                {'\n'}Эскертме: {receipt.referenceNote}
                {'\n'}Рахмат!
            </div>
            <button className="bg-[#F25A3C] text-white rounded-xl px-10 py-3" onClick={onClose}>
                Даяр болду
            </button>
        </div>
    </Modal>
);

const PaymentCourse = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [payerPhone, setPayerPhone] = useState('');
    const [receipt, setReceipt] = useState({
        reference: '',
        referenceNote: '',
        amount: 0,
        currency: 'KGS',
    });

    const { cartItems, getTotalPrice } = useCart();
    const totalPrice = useMemo(() => Math.round(getTotalPrice()), [getTotalPrice]);
    const courseName = useMemo(
        () => (cartItems?.length ? cartItems[0].title : 'Курс'),
        [cartItems]
    );

    const handlePay = async (e) => {
        e.preventDefault();
        if (!totalPrice) {
            toast.error('Корзина бош');
            return;
        }

        setIsLoading(true);
        try {
            const resp = await checkoutManual({
                method: 'manual_transfer',
                payerPhone: payerPhone || undefined,
            });

            setReceipt({
                reference: resp.reference,
                referenceNote: resp.instructions?.referenceNote || resp.reference,
                amount: resp.amount,
                currency: resp.currency || 'KGS',
            });
            setIsSuccess(true);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Ошибка оплаты. Попробуйте снова';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = isLoading || !totalPrice;

    return (
        <>
            <div className="w-full bg-white rounded-xl p-6 md:p-8 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Оплата картой</h2>
                    <img src={CardType} alt="cards" className="w-20" />
                </div>

                <div className="flex items-center gap-3 mb-4 text-sm text-gray-700">
                    <label className="flex items-center gap-2 font-medium">
                        <input type="radio" defaultChecked readOnly />
                        Кредиттик / Дебеттик карталар
                    </label>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                        Төлөө суммасы: <strong>{totalPrice.toLocaleString()} сом</strong>
                    </span>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handlePay}>
                    <input
                        type="text"
                        name="payerPhone"
                        placeholder="Телефон төлөөчү (опциялык)"
                        className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        disabled={isDisabled}
                    />

                    <button
                        type="submit"
                        className="mt-2 w-full py-3 bg-[#F25A3C] text-white rounded-xl font-medium disabled:opacity-60"
                        disabled={isDisabled}
                    >
                        {isLoading ? 'Иштелүүдө...' : 'Сатып алуу →'}
                    </button>

                    <p className="text-xs text-gray-500 mt-3 leading-snug">
                        Төлөө баскычын басуу менен, сиз Жарлыкка жана жеке маалыматтарды иштетүүгө
                        макулдугуңузду бересиз.
                    </p>
                </form>
            </div>

            <SuccessPaymentModal
                open={isSuccess}
                onClose={() => setIsSuccess(false)}
                receipt={receipt}
            />
        </>
    );
};

export default PaymentCourse;
