import React, { useState, useEffect, useRef } from 'react';
import { fetchUsers, fetchCourses, registerStudent, enrollUserInCourse, addPayment } from '../services/api';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaRegCopy } from 'react-icons/fa';

const RegisterAndEnrollModal = ({ onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [amount, setAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isDeposit, setIsDeposit] = useState(true);
    const [coursePrice, setCoursePrice] = useState(0);
    const [newUserData, setNewUserData] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(true);
    const [showSearchBlock, setShowSearchBlock] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const coursesLoaded = useRef(false);

    const handleSearch = async () => {
        if (!searchTerm) return;
        try {
            const { data: allUsers = [] } = await fetchUsers({ search: searchTerm, role: 'student' });
            setUsers(allUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Колдонуучулар жүктөлгөн жок');
        }
        setSearchTriggered(true);
        setSearchTriggered(true);
    };

    const filteredUsers = users;

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
            await addPayment({ userId: selectedUser.id, courseId: selectedCourseId, amount, isDeposit });
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

    useEffect(() => {
        if (newUserData.fullName.trim() && !newUserData.passwordManuallyChanged) {
            const year = new Date().getFullYear();
            const safeName = newUserData.fullName.trim().replace(/\s+/g, '').toLowerCase();
            const generated = `${safeName}${year}`;
            setNewUserData(prev => ({ ...prev, password: generated, passwordManuallyChanged: false }));
        }
    }, [newUserData.fullName]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl">×</button>
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

                        {searchTriggered && filteredUsers.length > 0 && (
                            <ul className="absolute z-50 left-0 right-0 bg-white border rounded shadow max-h-40 overflow-y-auto mt-1">
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
                            <span className="text-gray-600">Колдонуучу табылган жокпу?</span>
                            <button
                                className="ml-2 text-blue-600 underline"
                                onClick={() => setShowRegisterForm(true)}
                            >
                                Жаңы каттоо
                            </button>
                        </div>
                    </>
                )}

                {showRegisterForm && !selectedUser && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium">Жаңы студентти каттоо</h3>
                            <button className="text-sm text-blue-600 underline" onClick={() => setShowRegisterForm(false)}>
                                Мурунку студентти тандоо
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Толук аты"
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
                            placeholder="Телефон номери"
                            value={newUserData.phoneNumber}
                            onChange={(e) => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newUserData.password}
                                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value, passwordManuallyChanged: true })}
                                placeholder="Сырсөз"
                                className="w-full border p-2 rounded pr-20"
                            />
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(newUserData.password) && toast.success('Сырсөз көчүрүлдү!')}
                                className="absolute right-10 top-2 text-gray-600 hover:text-blue-600"
                                title="Көчүрүү"
                            >
                                <FaRegCopy size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
                                Жокко чыгаруу
                            </button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded"
                                onClick={handleRegister}
                                disabled={!newUserData.fullName || !newUserData.email || !newUserData.password}
                            >
                                Каттоо
                            </button>
                        </div>
                    </div>
                )}

                {selectedUser && (
                    <div>
                        <h3 className="text-lg font-medium mb-2">Тандалган студент</h3>
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
                                onClick={handleEnrollAndPay}
                                disabled={!selectedCourseId || !amount}
                            >
                                Жазуу жана Төлөө
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterAndEnrollModal;
