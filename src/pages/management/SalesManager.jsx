import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import RegisterAndEnrollModal from '../../components/RegisterAndEnrollModal';
import PayMoreModal from '../../components/PayMoreModal';
import { fetchMyStudents } from '../../services/api';

const SalesDashboard = () => {
    const [students, setStudents] = useState([]);
    const [showUnifiedModal, setShowUnifiedModal] = useState(false);
    const [showPayMoreModal, setShowPayMoreModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetchMyStudents();
            setStudents(res);
        } catch (err) {
            toast.error('Студенттерди жүктөөдө ката кетти');
        }
        setLoading(false);
    };

    const getTotalPaid = (student) => {
        return student.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    };

    const getRemainingBalance = (student) => {
        const totalFee = student.enrollments?.reduce((sum, e) => {
            const price = e.course?.price || 0;
            const discount = e.discountPercentage || 0;
            return sum + (price - (price * discount / 100));
        }, 0) || 0;
        return totalFee - getTotalPaid(student);
    };

    const formatCurrency = (value) => `${Number(value).toFixed(2)} сом`;

    if (loading) return <div className="p-6">Loading students...</div>;

    return (
        <div className="pt-20 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Менин студенттерим</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => setShowUnifiedModal(true)}
                >
                    Студент каттоо
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto border text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border">Аты</th>
                            <th className="p-2 border">Телефон</th>
                            <th className="p-2 border">Курстар</th>
                            <th className="p-2 border">Жалпы төлөндү</th>
                            <th className="p-2 border">Калган акча</th>
                            <th className="p-2 border">Аракет</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td className="p-2 border">{student.fullName}</td>
                                <td className="p-2 border">{student.phoneNumber || '—'}</td>
                                <td className="p-2 border">
                                    {student.enrollments?.map(e => e.course?.title).join(', ') || '—'}
                                </td>
                                <td className="p-2 border">{formatCurrency(getTotalPaid(student))}</td>
                                <td className="p-2 border">
                                    {getRemainingBalance(student) > 0
                                        ? formatCurrency(getRemainingBalance(student))
                                        : 'Толугу менен төлөндү'}
                                </td>
                                <td className="p-2 border">
                                    {getRemainingBalance(student) > 0 && (
                                        <button
                                            className="bg-green-600 text-white px-2 py-1 rounded"
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setShowPayMoreModal(true);
                                            }}
                                        >
                                            Төлөм алуу
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showUnifiedModal && (
                <RegisterAndEnrollModal
                    onClose={() => setShowUnifiedModal(false)}
                    onSuccess={() => {
                        setShowUnifiedModal(false);
                        fetchStudents();
                        toast.success('Студент ийгиликтүү катталды');
                    }}
                />
            )}

            {showPayMoreModal && selectedStudent && (
                <PayMoreModal
                    student={selectedStudent}
                    onClose={() => setShowPayMoreModal(false)}
                    onSuccess={() => {
                        setShowPayMoreModal(false);
                        fetchStudents();
                        toast.success('Төлөм жаңыртылды');
                    }}
                />
            )}
        </div>
    );
};

export default SalesDashboard;
