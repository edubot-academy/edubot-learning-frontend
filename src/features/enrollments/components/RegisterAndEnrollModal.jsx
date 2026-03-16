import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchUsers, registerStudent } from '@features/users/api';
import { fetchCourses } from '@features/courses/api';
import { enrollUserInCourse } from '@features/enrollments/api';
import { addPayment } from '@features/payments/api';
import {
    activateIntegrationEnrollment,
    createIntegrationEnrollmentRequest,
    fetchIntegrationCourses,
    fetchIntegrationGroups,
} from '@features/integration/api';
import { toast } from 'react-hot-toast';
import { ENROLLMENT_STATUS, PAYMENT_STATUS, SOURCE_SYSTEM } from '@shared/contracts';
import { FaEye, FaEyeSlash, FaRegCopy } from 'react-icons/fa';
import PhoneInput from '@shared/ui/forms/PhoneInput';

const extractErrorMessage = (error, fallback) => {
    const msg = error?.response?.data?.message || error?.message || fallback;
    return Array.isArray(msg) ? msg.join(', ') : msg;
};

const resolveCourseType = (course = {}) =>
    String(course?.courseType || course?.type || 'video').toLowerCase();

const RegisterAndEnrollModal = ({ onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [amount, setAmount] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isDeposit, setIsDeposit] = useState(true);
    const [coursePrice, setCoursePrice] = useState(0);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUserData, setNewUserData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const coursesLoaded = useRef(false);

    const actor = (() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const resolveCompanyId = () =>
        selectedUser?.companyId ||
        selectedUser?.company?.id ||
        actor?.companyId ||
        actor?.company?.id ||
        'default_company';

    const selectedCourse = courses.find((course) => String(course.id) === String(selectedCourseId));
    const selectedCourseType = resolveCourseType(selectedCourse);
    const requiresGroup = selectedCourseType !== 'video';
    const selectedGroup = groups.find((group) => String(group.id) === String(selectedGroupId));

    const handleSearch = async () => {
        if (!searchTerm) return;
        try {
            const { data: allUsers = [] } = await fetchUsers({
                search: searchTerm,
                role: 'student',
            });
            setUsers(allUsers);
        } catch {
            toast.error('Колдонуучулар жүктөлгөн жок');
        }
        setSearchTriggered(true);
    };

    const handleRegister = async () => {
        const phone = newUserData.phoneNumber;

        if (phone) {
            const digitsOnly = phone.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                toast.error('Телефон номери кеминде 10 цифра болушу керек.');
                return;
            }

            if (!/^\+\d{10,15}$/.test(phone)) {
                toast.error(
                    'Телефон номери эл аралык форматта болсун. Мисалы: +996700123456 же +14155552671'
                );
                return;
            }
        }

        try {
            const registeredUser = await registerStudent(newUserData);
            setSelectedUser(registeredUser);
            setShowRegisterForm(false);
        } catch (err) {
            toast.error(extractErrorMessage(err, 'Каттоо ишке ашкан жок'));
        }
    };

    const handleEnrollAndPay = async () => {
        if (!selectedCourseId || !amount) return;
        if (requiresGroup && !selectedGroupId) {
            toast.error('Оффлайн/онлайн live курс үчүн группа тандоо милдеттүү.');
            return;
        }
        const companyId = resolveCompanyId();
        let integrationEnrollmentId = null;

        setIsSubmitting(true);
        try {
            if (selectedGroupId) {
                const enrollmentResponse = await createIntegrationEnrollmentRequest({
                    crmCompanyId: String(companyId),
                    crmContactId: String(selectedUser.id),
                    student: {
                        fullName: selectedUser.fullName,
                        phone: selectedUser.phoneNumber || '',
                        email: selectedUser.email || null,
                    },
                    courseId: String(selectedCourseId),
                    groupId: String(selectedGroupId),
                    paymentStatus: PAYMENT_STATUS.SUBMITTED,
                    enrollmentStatus: ENROLLMENT_STATUS.PENDING_ACTIVATION,
                    sourceSystem: SOURCE_SYSTEM.CRM,
                    meta: {
                        submittedByUserId: actor?.id ? String(actor.id) : null,
                        submittedByName: actor?.fullName || null,
                    },
                });
                integrationEnrollmentId = enrollmentResponse?.enrollment?.id || null;
            } else {
                await enrollUserInCourse(selectedUser.id, selectedCourseId, {
                    discountPercentage: discount,
                });
            }

            const paymentResponse = await addPayment({
                userId: selectedUser.id,
                courseId: selectedCourseId,
                amount,
                isDeposit,
                status: PAYMENT_STATUS.CONFIRMED,
            });

            if (integrationEnrollmentId) {
                await activateIntegrationEnrollment(integrationEnrollmentId, {
                    crmCompanyId: String(companyId),
                    crmContactId: String(selectedUser.id),
                    crmPaymentId: paymentResponse?.id ? String(paymentResponse.id) : null,
                    paymentStatus: PAYMENT_STATUS.CONFIRMED,
                    activatedByUserId: actor?.id ? String(actor.id) : null,
                    activatedByName: actor?.fullName || null,
                    notes: selectedCourse?.title || selectedCourse?.name || null,
                });
            }

            onClose();
            onSuccess();
        } catch (err) {
            const integrationFailed = selectedGroupId && !integrationEnrollmentId;
            if (integrationFailed) {
                try {
                    await enrollUserInCourse(selectedUser.id, selectedCourseId, {
                        discountPercentage: discount,
                    });
                    await addPayment({
                        userId: selectedUser.id,
                        courseId: selectedCourseId,
                        amount,
                        isDeposit,
                    });
                    onClose();
                    onSuccess();
                    toast.success('Эски агым менен сакталды');
                } catch {
                    toast.error('Жазуу же төлөм ишке ашкан жок');
                }
            } else {
                toast.error(extractErrorMessage(err, 'Жазуу же төлөм ишке ашкан жок'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (coursesLoaded.current) return;
        coursesLoaded.current = true;

        const loadCourses = async () => {
            try {
                const integrationCourses = await fetchIntegrationCourses({
                    limit: 100,
                    isActive: true,
                });
                const items = integrationCourses?.items || [];
                if (items.length > 0) {
                    setCourses(items);
                    return;
                }
            } catch {
                // fallback to legacy list
            }

            try {
                const legacy = await fetchCourses();
                setCourses(legacy?.courses || []);
            } catch {
                toast.error('Курстар жүктөлгөн жок');
            }
        };

        loadCourses();
    }, []);

    useEffect(() => {
        const course = courses.find((c) => String(c.id) === String(selectedCourseId));
        if (course) {
            const rawPrice = Number(course.price || 0);
            const discounted = rawPrice - (rawPrice * discount) / 100;
            setCoursePrice(rawPrice);
            setAmount(discounted);
        }
    }, [selectedCourseId, discount, courses]);

    useEffect(() => {
        if (!selectedCourseId || selectedCourseType === 'video') {
            setGroups([]);
            setSelectedGroupId('');
            return;
        }

        let isCancelled = false;
        const loadGroups = async () => {
            setLoadingGroups(true);
            try {
                const response = await fetchIntegrationGroups({
                    courseId: selectedCourseId,
                    status: 'active',
                    limit: 100,
                });
                if (!isCancelled) {
                    setGroups(response?.items || []);
                    setSelectedGroupId('');
                }
            } catch {
                if (!isCancelled) {
                    setGroups([]);
                    setSelectedGroupId('');
                }
            } finally {
                if (!isCancelled) {
                    setLoadingGroups(false);
                }
            }
        };

        loadGroups();
        return () => {
            isCancelled = true;
        };
    }, [selectedCourseId, selectedCourseType]);

    useEffect(() => {
        const { fullName, passwordManuallyChanged } = newUserData;
        if (fullName.trim() && !passwordManuallyChanged) {
            const year = new Date().getFullYear();
            const safeName = fullName.trim().replace(/\s+/g, '').toLowerCase();
            const generated = `${safeName}${year}`;
            setNewUserData((prev) => ({
                ...prev,
                password: generated,
                passwordManuallyChanged: false,
            }));
        }
    }, [newUserData]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
                >
                    ×
                </button>

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
                                {users.map((user) => (
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
                            <button
                                className="text-sm text-blue-600 underline"
                                onClick={() => setShowRegisterForm(false)}
                            >
                                Мурунку студентти тандоо
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Толук аты"
                            value={newUserData.fullName}
                            onChange={(e) =>
                                setNewUserData({ ...newUserData, fullName: e.target.value })
                            }
                            className="w-full border p-2 rounded mb-2"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUserData.email}
                            onChange={(e) =>
                                setNewUserData({ ...newUserData, email: e.target.value })
                            }
                            className="w-full border p-2 rounded mb-2"
                        />
                        <PhoneInput
                            value={newUserData.phoneNumber}
                            onChange={(val) =>
                                setNewUserData((prev) => ({ ...prev, phoneNumber: val }))
                            }
                            className="mb-2"
                        />
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newUserData.password}
                                onChange={(e) =>
                                    setNewUserData({
                                        ...newUserData,
                                        password: e.target.value,
                                        passwordManuallyChanged: true,
                                    })
                                }
                                placeholder="Сырсөз"
                                className="w-full border p-2 rounded pr-20"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    navigator.clipboard.writeText(newUserData.password) &&
                                    toast.success('Сырсөз көчүрүлдү!')
                                }
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
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={onClose}
                            >
                                Жокко чыгаруу
                            </button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded"
                                onClick={handleRegister}
                                disabled={
                                    !newUserData.fullName ||
                                    !newUserData.email ||
                                    !newUserData.password
                                }
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
                            <p>
                                <strong>Аты:</strong> {selectedUser.fullName}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedUser.email}
                            </p>
                            <p>
                                <strong>Телефон:</strong> {selectedUser.phoneNumber || '—'}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Курсту тандаңыз</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">-- Курсту тандоо --</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title || course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {requiresGroup && (
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">
                                Группаны тандаңыз (милдеттүү)
                            </label>
                            <select
                                className="w-full border p-2 rounded"
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                disabled={!selectedCourseId || loadingGroups}
                            >
                                <option value="">
                                    {loadingGroups ? 'Жүктөлүүдө...' : '-- Группаны тандоо --'}
                                </option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} · {group.startDate || '—'} → {group.endDate || '—'} · {group.availableSeats ?? '—'}/{group.maxCapacity ?? group.seatLimit ?? '—'}
                                    </option>
                                ))}
                            </select>
                            {!loadingGroups && selectedCourseId && groups.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Бул курс үчүн интеграциялык группа табылган жок.
                                </p>
                            )}
                            {selectedGroup && (
                                <div className="mt-3 rounded-lg border border-gray-200 p-3 text-xs text-gray-700">
                                    <p><strong>Аты:</strong> {selectedGroup.name || '—'}</p>
                                    <p><strong>Статус:</strong> {selectedGroup.status || '—'}</p>
                                    <p><strong>Даталар:</strong> {selectedGroup.startDate || '—'} → {selectedGroup.endDate || '—'}</p>
                                    <p><strong>Орундар:</strong> {selectedGroup.availableSeats ?? '—'} / {selectedGroup.maxCapacity ?? selectedGroup.seatLimit ?? '—'}</p>
                                    <p><strong>Мугалим:</strong> {selectedGroup.teacherName || selectedGroup.instructor?.fullName || '—'}</p>
                                </div>
                            )}
                        </div>
                        )}

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
                                Курстун баасы: {coursePrice} сом. Жеңилдик менен:{' '}
                                {coursePrice - (coursePrice * discount) / 100} сом
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
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={onClose}
                            >
                                Жокко чыгаруу
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
                                onClick={handleEnrollAndPay}
                                disabled={!selectedCourseId || !amount || isSubmitting || (requiresGroup && !selectedGroupId)}
                            >
                                {isSubmitting ? 'Сакталууда...' : 'Жазуу жана Төлөө'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterAndEnrollModal;

RegisterAndEnrollModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};
