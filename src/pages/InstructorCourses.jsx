import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchCourses } from "../services/api";

const InstructorCourses = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchCourses();
                const instructorCourses = response.courses.filter((course) => course.instructor.id === user?.id);
                setCourses(instructorCourses);
            } catch (err) {
                console.error("Курстарды алуу ишке ашкан жок", err);
            }
        };

        if (user?.role === "instructor") loadCourses();
    }, [user]);

    return (
        <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Менин курстарым</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded shadow p-4 relative">
                        <img src={course.coverImageUrl} alt={course.title} className="w-full h-48 object-cover mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                        <p className="text-gray-700 mb-2">{course.instructor.fullName}</p>
                        <p className="text-sm text-gray-500 mb-2">Баасы: ${course.price}</p>
                        <span
                            className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {course.isPublished ? "Жарыяланды" : "Каралууда"}
                        </span>
                        <Link
                            to={`/instructor/courses/edit/${course.id}`}
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded transition duration-300 hover:bg-blue-500 hover:shadow-lg"
                        >
                            {course.isPublished ? "Tастыктоо" : "Өзгөртүү"}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstructorCourses;
