import React, { useState, useEffect } from 'react';
import { addPayment } from '../services/api';

const PayMoreModal = ({ student, onClose, onSuccess }) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [amount, setAmount] = useState('');
    const [unpaidCourses, setUnpaidCourses] = useState([]);

    useEffect(() => {
        const unpaid = student.enrollments?.map((enrollment) => {
            const course = enrollment.course;
            const discount = enrollment.discountPercentage || 0;
            const totalFee = course.price - (course.price * discount) / 100;
            const paid = student.payments?.filter(p => p.courseId === course.id)
                .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            const remaining = totalFee - paid;
            return remaining > 0 ? {
                id: course.id,
                title: course.title,
                remaining,
                totalFee,
                paid
            } : null;
        }).filter(Boolean);

        setUnpaidCourses(unpaid);
        if (unpaid.length === 1) {
            setSelectedCourseId(unpaid[0].id);
            setAmount(unpaid[0].remaining);
        }
    }, [student]);

    const handlePay = async () => {
        if (!selectedCourseId || !amount) return;
        try {
            await addPayment({
                userId: student.id,
                courseId: selectedCourseId,
                amount,
            });
            onSuccess();
        } catch (err) {
            console.error('Payment failed:', err);
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
                <h2 className="text-xl font-semibold mb-4">Add Payment</h2>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Select Course</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={selectedCourseId}
                        onChange={(e) => {
                            const selectedId = Number(e.target.value);
                            setSelectedCourseId(selectedId);
                            const selected = unpaidCourses.find(c => c.id === selectedId);
                            if (selected) setAmount(selected.remaining);
                        }}
                    >
                        <option value="">-- Choose a course --</option>
                        {unpaidCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title} (Remaining: {course.remaining.toFixed(2)} сом)
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCourseId && (
                    <div className="text-sm text-gray-600 mb-2">
                        Total fee: {unpaidCourses.find(c => c.id === Number(selectedCourseId))?.totalFee.toFixed(2)} сом,
                        Paid: {unpaidCourses.find(c => c.id === Number(selectedCourseId))?.paid.toFixed(2)} сом
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Payment Amount (сом)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Enter amount"
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handlePay}
                        disabled={!selectedCourseId || !amount}
                    >
                        Add Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayMoreModal;
