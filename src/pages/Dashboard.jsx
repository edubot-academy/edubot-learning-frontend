import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaDownload } from "react-icons/fa";

const enrolledCourses = [
    {
        id: 1,
        title: "Web Development Masterclass",
        progress: 75,
        lastLesson: "JavaScript Fundamentals",
        certificateAvailable: true,
    },
    {
        id: 2,
        title: "Data Science Bootcamp",
        progress: 50,
        lastLesson: "Machine Learning Basics",
        certificateAvailable: false,
    },
];

const recommendedCourses = [
    {
        id: 3,
        title: "Machine Learning Fundamentals",
    },
    {
        id: 4,
        title: "UI/UX Design Essentials",
    },
];

const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">My Dashboard</h1>

            {/* Enrolled Courses */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Enrolled Courses</h2>
                {enrolledCourses.map((course) => (
                    <div key={course.id} className="border-b py-4">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <p className="text-gray-600">Progress: {course.progress}%</p>
                        <p className="text-gray-600">Last Lesson: {course.lastLesson}</p>
                        {course.certificateAvailable && (
                            <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center">
                                <FaDownload className="mr-2" /> Download Certificate
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Progress Tracking */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Progress Tracking</h2>
                {enrolledCourses.map((course) => (
                    <div key={course.id} className="mb-4">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-600 h-4 rounded-full"
                                style={{ width: `${course.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">{course.progress}% completed</p>
                    </div>
                ))}
            </div>

            {/* Recommended Courses */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4">Recommended Courses</h2>
                <ul>
                    {recommendedCourses.map((course) => (
                        <li key={course.id} className="mb-2">
                            <Link to={`/courses/${course.id}`} className="text-blue-600 hover:underline">
                                {course.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardPage;