import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import RegisterAndPayModal from '../../components/RegisterAndPayModal';
import PayMoreModal from '../../components/PayMoreModal';
import { salesGetMyStudents } from '../../services/api';

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
            const res = await salesGetMyStudents();
            setStudents(res.data);
        } catch (err) {
            toast.error('Студенттерди жүктөөдө ката кетти');
        }
        setLoading(false);
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
                        {students.map((student) => {
                            const courseMap = new Map();
                            student.payments?.forEach(payment => {
                                const courseId = payment.course?.id;
                                const courseTitle = payment.course?.title;
                                const coursePrice = payment.course?.price || 0;
                                if (!courseId || !courseTitle) return;
                                const current = courseMap.get(courseId) || { title: courseTitle, paid: 0, fee: coursePrice };
                                current.paid += Number(payment.amount);
                                courseMap.set(courseId, current);
                            });

                            const totalPaid = Array.from(courseMap.values()).reduce((sum, c) => sum + c.paid, 0);
                            const totalFee = Array.from(courseMap.values()).reduce((sum, c) => sum + c.fee, 0);
                            const remaining = totalFee - totalPaid;

                            return (
                                <tr key={student.id}>
                                    <td className="p-2 border">{student.fullName}</td>
                                    <td className="p-2 border">{student.phoneNumber || '—'}</td>
                                    <td className="p-2 border">
                                        {Array.from(courseMap.values()).map(c => c.title).join(', ') || '—'}
                                    </td>
                                    <td className="p-2 border">{formatCurrency(totalPaid)}</td>
                                    <td className="p-2 border">
                                        {remaining > 0 ? formatCurrency(remaining) : 'Толугу менен төлөндү'}
                                    </td>
                                    <td className="p-2 border">
                                        {remaining > 0 && (
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
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showUnifiedModal && (
                <RegisterAndPayModal
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
