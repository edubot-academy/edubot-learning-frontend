import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import BasicModal from '@shared/ui/BasicModal';
import CardType from '../../assets/icons/card_type.svg';
import { checkoutManual } from '../cart/api';
import { useCart } from '../../context/CartContext';
import { parseApiError } from '@shared/api/error';

const SuccessPaymentModal = ({ open, onClose, receipt }) => {
    const { t } = useTranslation();

    return (
        <BasicModal
            isOpen={open}
            onClose={onClose}
            showCloseButton
            title={t('public.cart.payment.successTitle')}
            size="sm"
        >
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto">
                    ✓
                </div>
                <div className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                    {t('public.cart.payment.companyName')}
                    {'\n'}
                    {t('public.cart.payment.taxId')}
                    {'\n'}
                    {t('public.cart.payment.reference', { reference: receipt.reference })}
                    {'\n'}
                    {t('public.cart.payment.amount', {
                        amount: receipt.amount,
                        currency: receipt.currency,
                    })}
                    {'\n'}
                    {t('public.cart.payment.note', { note: receipt.referenceNote })}
                    {'\n'}
                    {t('public.cart.payment.thanks')}
                </div>
                <button className="bg-[#F25A3C] text-white rounded-xl px-10 py-3" onClick={onClose}>
                    {t('public.cart.payment.done')}
                </button>
            </div>
        </BasicModal>
    );
};

const PaymentCourse = () => {
    const { t, i18n } = useTranslation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [payerPhone, setPayerPhone] = useState('');
    const [receipt, setReceipt] = useState({
        reference: '',
        referenceNote: '',
        amount: 0,
        currency: 'KGS',
    });

    const { getTotalPrice } = useCart();
    const totalPrice = useMemo(() => Math.round(getTotalPrice()), [getTotalPrice]);

    const handlePay = async (e) => {
        e.preventDefault();
        if (!totalPrice) {
            toast.error(t('public.cart.payment.emptyCartError'));
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
            toast.error(parseApiError(error, t('public.cart.payment.fallbackError')).message);
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = isLoading || !totalPrice;

    return (
        <>
            <div className="w-full bg-white rounded-xl p-6 md:p-8 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">{t('public.cart.payment.title')}</h2>
                    <img src={CardType} alt={t('public.cart.payment.cardAlt')} className="w-20" />
                </div>

                <div className="flex items-center gap-3 mb-4 text-sm text-gray-700">
                    <label className="flex items-center gap-2 font-medium">
                        <input type="radio" defaultChecked readOnly />
                        {t('public.cart.payment.cardType')}
                    </label>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                        {t('public.cart.payment.amountDue')}{' '}
                        <strong>
                            {t('public.cart.priceWithCurrency', {
                                amount: totalPrice.toLocaleString(i18n.language),
                            })}
                        </strong>
                    </span>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handlePay}>
                    <input
                        type="text"
                        name="payerPhone"
                        placeholder={t('public.cart.payment.payerPhonePlaceholder')}
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
                        {isLoading
                            ? t('public.cart.payment.processing')
                            : t('public.cart.payment.submit')}
                    </button>

                    <p className="text-xs text-gray-500 mt-3 leading-snug">
                        {t('public.cart.payment.consent')}
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
