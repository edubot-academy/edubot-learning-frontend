import React, { useEffect, useState } from 'react';
import RegisterStudentModal from '../components/RegisterStudentModal';
import AddPaymentModal from '../components/AddPaymentModal';
import { fetchMyStudents } from '../services/api';

const SalesDashboard = () => {
    const [students, setStudents] = useState([]);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const res = await fetchMyStudents();
        setStudents(res);
    };

    const openPaymentModal = (student) => {
        setSelectedStudent(student);
        setShowPaymentModal(true);
    };

    return (
        <div className="pt-20 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Sales Manager Dashboard</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => setShowRegisterModal(true)}
                >
                    Register Student
                </button>
            </div>

            <table className="w-full table-auto border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Phone</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td className="p-2 border">{student.fullName}</td>
                            <td className="p-2 border">{student.email}</td>
                            <td className="p-2 border">{student.phoneNumber}</td>
                            <td className="p-2 border">
                                <button
                                    className="bg-green-600 text-white px-3 py-1 rounded"
                                    onClick={() => openPaymentModal(student)}
                                >
                                    Add Payment
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modals */}
            {showRegisterModal && (
                <RegisterStudentModal
                    onClose={() => {
                        setShowRegisterModal(false);
                        fetchStudents();
                    }}
                />
            )}
            {showPaymentModal && (
                <AddPaymentModal
                    student={selectedStudent}
                    onClose={() => {
                        setShowPaymentModal(false);
                        fetchStudents();
                    }}
                />
            )}
        </div>
    );
};

export default SalesDashboard;
