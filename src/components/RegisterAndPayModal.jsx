import React, { useState, useEffect, useRef } from 'react';
import { fetchUsers, fetchCourses, addPayment, salesRegisterStudent } from '../services/api';
import { toast } from 'react-hot-toast';
import RegisterUserForm from './RegisterUserForm';

const RegisterAndPayModal = ({ onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [amount, setAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isDeposit, setIsDeposit] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [coursePrice, setCoursePrice] = useState(0);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const coursesLoaded = useRef(false);

    const handleSearch = async () => {
        if (!searchTerm) return;
        try {
            const { data: allUsers = [] } = await fetchUsers({ search: searchTerm, role: 'student' });
            setUsers(allUsers);
        } catch (err) {
            toast.error('Колдонуучулар жүктөлгөн жок');
        }
        setSearchTriggered(true);
    };

    const handleRegister = async (formData) => {
        try {
            const registeredUser = await salesRegisterStudent(formData);
            setSelectedUser(registeredUser.data);
            setShowRegisterForm(false);
        } catch (err) {
            const message = err?.response?.data?.message || 'Каттоо ишке ашкан жок';
            toast.error(message);
        }
    };

    const handlePaymentOnly = async () => {
        try {
            await addPayment({ userId: selectedUser.id, courseId: selectedCourseId, amount, isDeposit, method: paymentMethod });
            onClose();
            onSuccess();
        } catch {
            toast.error('Төлөм ишке ашкан жок');
        }
    };

    useEffect(() => {
        if (coursesLoaded.current) return;
        coursesLoaded.current = true;
        fetchCourses().then(res => setCourses(res.courses));
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
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl">×</button>

                {!selectedUser && (
                    <div className="mb-4 flex justify-center">
                        <button
                            onClick={() => setShowRegisterForm(!showRegisterForm)}
                            className="text-blue-600 underline"
                        >
                            {showRegisterForm ? 'Бар колдонуучуну издөө' : 'Жаңы каттоо'}
                        </button>
                    </div>
                )}

                {!selectedUser && showRegisterForm && (
                    <RegisterUserForm onRegister={handleRegister} onCancel={() => setShowRegisterForm(false)} />
                )}

                {!selectedUser && !showRegisterForm && (
                    <>
                        <div className="flex mb-4 space-x-2 relative">
                            <input
                                type="text"
                                placeholder="Аты же email менен издөө"
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    if (value.length >= 3) {
                                        handleSearch();
                                    } else {
                                        setUsers([]);
                                        setSearchTriggered(false);
                                    }
                                }}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        {searchTriggered && users.length > 0 && (
                            <ul className="absolute z-50 left-0 right-0 bg-white border rounded shadow max-h-40 overflow-y-auto mt-1">
                                {users.map(user => (
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
                    </>
                )}

                {selectedUser && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium">Тандалган студент</h3>
                            <button
                                className="text-sm text-blue-600 underline"
                                onClick={() => {
                                    setSelectedUser(null);
                                    setShowRegisterForm(false);
                                }}
                            >
                                Башка студентти тандоо
                            </button>
                        </div>

                        <div className="border p-3 rounded mb-4">
                            <p><strong>Аты:</strong> {selectedUser.fullName}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Телефон:</strong> {selectedUser.phoneNumber || '—'}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Курсту тандаңыз</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={selectedCourseId || ''}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">-- Курсту тандоо --</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Жеңилдик (%)</label>
                            <input
                                type="number"
                                value={discount === 0 ? '' : discount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDiscount(val === '' ? 0 : Number(val));
                                }}
                                className="w-full border p-2 rounded"
                                placeholder="Жеңилдик пайызын жазыңыз"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Төлөм суммасы (сом)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border p-2 rounded"
                                placeholder="Сумманы жазыңыз"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Курстун баасы: {coursePrice} сом. Жеңилдик менен: {coursePrice - (coursePrice * discount / 100)} сом
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Төлөм ыкмасы</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="cash">Накталай</option>
                                <option value="card">Карта</option>
                                <option value="bank">Банк</option>
                                <option value="qr">QR</option>
                                <option value="manual">Кол менен</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isDeposit}
                                    onChange={(e) => setIsDeposit(e.target.checked)}
                                    className="mr-2"
                                />
                                Бул төлөмдү депозит деп белгилөө
                            </label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
                                Жокко чыгаруу
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handlePaymentOnly}
                                disabled={!selectedCourseId || !amount}
                            >
                                Төлөм кабыл алуу
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterAndPayModal;
