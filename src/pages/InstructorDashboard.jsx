import React, { useContext, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user || user.role !== "instructor") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">Instructor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Manage Courses */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Manage Courses</h2>
                    <p className="text-gray-600 mb-4">View, edit, or delete your existing courses.</p>
                    <Link to="/instructor/courses" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        View Courses
                    </Link>
                </div>

                {/* Create Course */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Create New Course</h2>
                    <p className="text-gray-600 mb-4">Add a new course with sections and lessons.</p>
                    <Link to="/instructor/courses/create" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        Create Course
                    </Link>
                </div>

                {/* Enrollments */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Student Enrollments</h2>
                    <p className="text-gray-600 mb-4">Track students enrolled in your courses.</p>
                    <Link to="/instructor/enrollments" className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition">
                        View Enrollments
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
