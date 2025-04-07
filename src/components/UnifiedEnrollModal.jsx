import React, { useState, useEffect, useRef } from 'react';
import { fetchUsers, fetchCourses, registerStudent, enrollUserInCourse, addPayment } from '../services/api';

const UnifiedEnrollModal = ({ onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [amount, setAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isDeposit, setIsDeposit] = useState(true);
    const [coursePrice, setCoursePrice] = useState(0);
    const [newUserData, setNewUserData] = useState({ fullName: '', email: '', phoneNumber: '' });
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const coursesLoaded = useRef(false);

    const handleSearch = async () => {
        if (!searchTerm) return;
        const allUsers = await fetchUsers();
        setUsers(allUsers);
        setSearchTriggered(true);
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRegister = async () => {
        try {
            const registeredUser = await registerStudent(newUserData);
            setSelectedUser(registeredUser);
            setShowRegisterForm(false);
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    const handleEnrollAndPay = async () => {
        try {
            await enrollUserInCourse(selectedUser.id, selectedCourseId, discount);

            await addPayment({
                userId: selectedUser.id,
                courseId: selectedCourseId,
                amount,
                isDeposit,
            });

            console.log('Enrollment and payment successful');
            onClose();
            onSuccess();
        } catch (err) {
            console.error('Enrollment or payment failed:', err);
        }
    };

    useEffect(() => {
        if (coursesLoaded.current) return;
        coursesLoaded.current = true;

        const loadCourses = async () => {
            const res = await fetchCourses();
            setCourses(res.courses);
        };
        loadCourses();
    }, []);

    useEffect(() => {
        const course = courses.find(c => c.id === Number(selectedCourseId));
        if (course) {
            const discounted = course.price - (course.price * discount) / 100;
            setCoursePrice(course.price);
            setAmount(discounted);
        }
    }, [selectedCourseId, discount]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4">Enroll Student</h2>

                {!selectedUser && !showRegisterForm && (
                    <>
                        <div className="flex mb-4 space-x-2">
                            <input
                                type="text"
                                placeholder="Search by name or email"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border p-2 rounded"
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>

                        {searchTriggered && filteredUsers.length > 0 && (
                            <ul className="border rounded mb-4 max-h-40 overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <li
                                        key={user.id}
                                        className="p-2 cursor-pointer hover:bg-blue-100"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        {user.fullName} ({user.email})
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="text-center">
                            <span className="text-gray-600">Can’t find the user?</span>
                            <button
                                className="ml-2 text-blue-600 underline"
                                onClick={() => setShowRegisterForm(true)}
                            >
                                Register New
                            </button>
                        </div>
                    </>
                )}

                {showRegisterForm && !selectedUser && (
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Register New Student</h3>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={newUserData.fullName}
                            onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={newUserData.phoneNumber}
                            onChange={(e) => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
                            className="w-full border p-2 rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded"
                                onClick={handleRegister}
                                disabled={!newUserData.fullName || !newUserData.email}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                )}

                {selectedUser && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">Selected Student</h3>
                        <div className="border p-3 rounded mb-4">
                            <p><strong>Name:</strong> {selectedUser.fullName}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Phone:</strong> {selectedUser.phoneNumber || '—'}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Select Course</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">-- Choose a course --</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Discount (%)</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="w-full border p-2 rounded"
                                placeholder="Enter discount percentage"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Payment Amount (сом)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border p-2 rounded"
                                placeholder="Enter amount"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Course price: {coursePrice} сом. Discounted: {coursePrice - (coursePrice * discount / 100)} сом
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isDeposit}
                                    onChange={(e) => setIsDeposit(e.target.checked)}
                                    className="mr-2"
                                />
                                Mark this payment as deposit
                            </label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleEnrollAndPay}
                                disabled={!selectedCourseId || !amount}
                            >
                                Enroll & Pay
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnifiedEnrollModal;