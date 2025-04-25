import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { addPayment } from '../services/api';

const PayMoreModal = ({ student, onClose, onSuccess }) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [amount, setAmount] = useState('');
    const [unpaidCourses, setUnpaidCourses] = useState([]);
    const [paymentType, setPaymentType] = useState('cash');

    const formatCurrency = (value) => `${Number(value).toFixed(2)} сом`;

    useEffect(() => {
        const unpaid = student.enrollments?.map((enrollment) => {
            const course = enrollment.course;
            const discount = enrollment.discountPercentage || 0;
            const totalFee = course.price - (course.price * discount) / 100;
            const paid = student.payments
                ?.filter(p => p.courseId === course.id)
                .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            const remaining = totalFee - paid;
            return {
                id: course.id,
                title: course.title,
                totalFee,
                paid,
                remaining,
            };
        }) || [];

        const filtered = unpaid.filter(c => c.remaining > 0);
        setUnpaidCourses(filtered);

        if (filtered.length === 1) {
            setSelectedCourseId(filtered[0].id);
            setAmount(filtered[0].remaining);
        }
    }, [student]);

    const handlePay = async () => {
        if (!selectedCourseId || !amount) return;

        const selected = unpaidCourses.find(c => c.id === Number(selectedCourseId));
        const maxAmount = selected?.remaining || 0;
        if (Number(amount) > maxAmount) {
            toast.error(`Кошумча сумма чектен ашып кетти. Калган сумма: ${formatCurrency(maxAmount)}`);
            return;
        }

        try {
            await addPayment({
                userId: student.id,
                courseId: selectedCourseId,
                amount,
                type: paymentType,
            });
            toast.success('Төлөм ийгиликтүү кошулду!');
            onSuccess();
        } catch (err) {
            toast.error('Төлөм кошууда ката кетти');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4">Төлөм кошуу</h2>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Курсту тандаңыз</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedCourseId}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            setSelectedCourseId(id);
                            const sel = unpaidCourses.find(c => c.id === id);
                            setAmount(sel?.remaining || '');
                        }}
                    >
                        <option value="">-- Курсту тандаңыз --</option>
                        {unpaidCourses.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCourseId && (
                    <div className="text-sm text-gray-600 mb-4">
                        Жалпы баа: {formatCurrency(unpaidCourses.find(c => c.id === Number(selectedCourseId))?.totalFee)}<br />
                        Төлөнгөнү: {formatCurrency(unpaidCourses.find(c => c.id === Number(selectedCourseId))?.paid)}<br />
                        Калган сумма: {formatCurrency(unpaidCourses.find(c => c.id === Number(selectedCourseId))?.remaining)}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Төлөм суммасы (сом)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Сумманы жазыңыз"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Төлөм ыкмасы</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={paymentType}
                        onChange={e => setPaymentType(e.target.value)}
                    >
                        <option value="cash">Накталай</option>
                        <option value="card">Карта</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-2">
                    <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
                        Жокко чыгаруу
                    </button>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handlePay}
                        disabled={!selectedCourseId || !amount}
                    >
                        Төлөм кошуу
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayMoreModal;
