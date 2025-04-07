// ✅ Sales Manager Dashboard Extension
// Unified Enroll + Payment Modal, course list, payment summary chart, revenue filtering, pagination, pay more modal

import React, { useEffect, useState } from 'react';
import UnifiedEnrollModal from '../components/UnifiedEnrollModal';
import PayMoreModal from '../components/PayMoreModal';
import { fetchMyStudents } from '../services/api';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

import { Bar } from 'react-chartjs-2';

const ITEMS_PER_PAGE = 10;

const SalesDashboard = () => {
    const [students, setStudents] = useState([]);
    const [showUnifiedModal, setShowUnifiedModal] = useState(false);
    const [showPayMoreModal, setShowPayMoreModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revenueFilter, setRevenueFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        const res = await fetchMyStudents();
        setStudents(res);
        setLoading(false);
    };

    const getTotalPaid = (student) => {
        const now = new Date();
        return student.payments?.reduce((sum, p) => {
            const paidDate = new Date(p.paidAt);
            if (revenueFilter === 'month') {
                return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
                    ? sum + Number(p.amount)
                    : sum;
            }
            if (revenueFilter === 'quarter') {
                const currentQuarter = Math.floor(now.getMonth() / 3);
                const paymentQuarter = Math.floor(paidDate.getMonth() / 3);
                return paymentQuarter === currentQuarter && paidDate.getFullYear() === now.getFullYear()
                    ? sum + Number(p.amount)
                    : sum;
            }
            return sum + Number(p.amount);
        }, 0) || 0;
    };

    const getTotalFee = (student) => {
        return student.enrollments?.reduce((sum, e) => {
            const price = e.course?.price || 0;
            const discountPercent = e.discountPercentage || 0;
            return sum + (price - (price * discountPercent / 100));
        }, 0) || 0;
    };

    const getDiscount = (student) => {
        return student.enrollments?.reduce((sum, e) => {
            const price = e.course?.price || 0;
            const discountPercent = e.discountPercentage || 0;
            return sum + (price * discountPercent / 100);
        }, 0) || 0;
    };

    const getAverageDiscountPercent = (student) => {
        const discounts = student.enrollments?.map(e => e.discountPercentage).filter(Boolean);
        const sum = discounts.reduce((a, b) => a + b, 0);
        return discounts.length ? Math.round(sum / discounts.length) : 0;
    };

    const getDepositPaid = (student) => {
        return student.payments?.reduce((sum, p) => {
            return p.isDeposit ? sum + Number(p.amount) : sum;
        }, 0) || 0;
    };

    const getRemainingBalance = (student) => {
        return getTotalFee(student) - getTotalPaid(student);
    };

    const formatCurrency = (value) => `${Number(value).toFixed(2)} сом`;

    const totalRevenue = students.reduce((sum, s) => sum + getTotalPaid(s), 0);

    const sortedStudents = [...students].sort((a, b) => getTotalPaid(b) - getTotalPaid(a));
    const chartData = {
        labels: sortedStudents.map((s) => s.fullName),
        datasets: [
            {
                label: 'Total Paid (сом)',
                data: sortedStudents.map((s) => getTotalPaid(s)),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    const paginatedStudents = sortedStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);

    if (loading) return <div className="p-6">Loading students...</div>;

    return (
        <div className="pt-20 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Sales Manager Dashboard</h2>
                <div className="space-x-2">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => setShowUnifiedModal(true)}
                    >
                        New / Existing Student
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="mr-2 font-medium">Filter Revenue By:</label>
                <select
                    className="border px-2 py-1 rounded"
                    value={revenueFilter}
                    onChange={(e) => setRevenueFilter(e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                </select>
            </div>

            <div className="mb-6">
                <div className="font-medium mb-2">Total Revenue: {formatCurrency(totalRevenue)}</div>
                <Bar data={chartData} />
            </div>

            <table className="w-full table-auto border text-sm">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Phone</th>
                        <th className="p-2 border">Courses</th>
                        <th className="p-2 border">Price</th>
                        <th className="p-2 border">Discount</th>
                        <th className="p-2 border">Deposit</th>
                        <th className="p-2 border">Remaining</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedStudents.map((student) => (
                        <tr key={student.id}>
                            <td className="p-2 border">{student.fullName}</td>
                            <td className="p-2 border">{student.email || '—'}</td>
                            <td className="p-2 border">{student.phoneNumber || '—'}</td>
                            <td className="p-2 border">
                                {student.enrollments?.length > 0
                                    ? student.enrollments.map((e) => e.course?.title).join(', ')
                                    : '—'}
                            </td>
                            <td className="p-2 border">{formatCurrency(getTotalFee(student))}</td>
                            <td className="p-2 border">
                                <span
                                    className="underline cursor-help"
                                    title={`Total discount: ${formatCurrency(getDiscount(student))} across ${student.enrollments?.length || 0} course(s)`}
                                >
                                    {getAverageDiscountPercent(student)}%
                                </span>
                            </td>
                            <td className="p-2 border">{formatCurrency(getDepositPaid(student))}</td>
                            <td className="p-2 border">
                                {getRemainingBalance(student) > 0
                                    ? formatCurrency(getRemainingBalance(student))
                                    : 'Paid in full'}
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
                                        Pay More
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Unified Modal */}
            {showUnifiedModal && (
                <UnifiedEnrollModal
                    onClose={() => setShowUnifiedModal(false)}
                    onSuccess={() => {
                        setShowUnifiedModal(false);
                        fetchStudents();
                    }}
                />
            )}

            {/* Pay More Modal */}
            {showPayMoreModal && selectedStudent && (
                <PayMoreModal
                    student={selectedStudent}
                    onClose={() => setShowPayMoreModal(false)}
                    onSuccess={() => {
                        setShowPayMoreModal(false);
                        fetchStudents();
                    }}
                />
            )}
        </div>
    );
};

export default SalesDashboard;
