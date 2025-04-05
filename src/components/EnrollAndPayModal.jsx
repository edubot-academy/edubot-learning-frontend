// ✅ EnrollAndPayModal.jsx — Combined modal for enrolling and payment

import React, { useEffect, useState } from 'react';
import { fetchCourses, enrollUserInCourse, addPayment } from '../services/api';

const EnrollAndPayModal = ({ student, onClose }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await fetchCourses();
                setCourses(data.courses);
            } catch (error) {
                console.error('Failed to load courses', error);
            }
        };
        loadCourses();
    }, []);

    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId);
        const selected = courses.find((c) => c.id === parseInt(courseId));
        if (selected?.price) setAmount(selected.price);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourseId || !amount) return;
        setLoading(true);
        try {
            await enrollUserInCourse(student.id, selectedCourseId);
            await addPayment({
                userId: student.id,
                courseId: selectedCourseId,
                amount: parseFloat(amount),
            });
            onClose();
        } catch (err) {
            alert('Enrollment or payment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Enroll & Pay for {student.fullName}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        value={selectedCourseId}
                        onChange={(e) => handleCourseSelect(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title} — ${course.price}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Payment Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            className="bg-gray-300 px-4 py-2 rounded"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Enroll & Pay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollAndPayModal;
