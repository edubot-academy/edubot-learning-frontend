import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchCourses, addPayment } from '../services/api';

const AddPaymentModal = ({ student, onClose }) => {
    const [amount, setAmount] = useState('');
    const [courseId, setCourseId] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllCourses();
    }, []);

    const fetchAllCourses = async () => {
        try {
            const res = await fetchCourses();
            setCourses(res.courses);
        } catch (err) {
            console.error('Failed to load courses');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !courseId) return;

        setLoading(true);
        try {
            await addPayment({
                userId: student.id,
                courseId,
                amount: parseFloat(amount),
            });
            onClose();
        } catch (err) {
            alert('Error adding payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Add Payment for {student.fullName}</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        required
                        className="w-full border px-3 py-2 rounded"
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
                            className="bg-green-600 text-white px-4 py-2 rounded"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Add Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;
