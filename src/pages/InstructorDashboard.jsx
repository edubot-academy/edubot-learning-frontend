import React, { useState } from "react";

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([
        { id: 1, title: "React for Beginners", students: 120, earnings: 1500 },
        { id: 2, title: "Advanced Python", students: 80, earnings: 1200 },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">Instructor Dashboard</h1>

            {/* Course Management */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">My Courses</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Course Title</th>
                            <th className="border p-2">Students Enrolled</th>
                            <th className="border p-2">Earnings ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="text-center">
                                <td className="border p-2">{course.title}</td>
                                <td className="border p-2">{course.students}</td>
                                <td className="border p-2">{course.earnings}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Earnings & Payouts */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Earnings & Payouts</h2>
                <p className="text-gray-600">Total Earnings: <span className="text-blue-600 font-bold">$2,700</span></p>
                <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                    Request Payout
                </button>
            </div>
        </div>
    );
};

export default InstructorDashboard;
