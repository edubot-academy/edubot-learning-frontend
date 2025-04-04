import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { fetchCourses } from "../services/api"; // renamed for clarity

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await fetchCourses();
                setCourses(data.courses);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, []);

    const filteredCourses = courses.filter((course) => filter === "All" || course.level === filter);

    if (loading) return <div className="pt-24 p-6">Loading courses...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24">
            <h1 className="text-4xl font-bold text-center mb-6">Explore Our Courses</h1>
            <div className="flex justify-end mb-6">
                <select
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        className="block bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                    >
                        <Link to={`/courses/${course.id}`}>
                            <img
                                src={course.coverImageUrl || "https://source.unsplash.com/400x250/?education"}
                                alt={course.title}
                                className="w-full h-40 object-cover"
                            />
                        </Link>
                        <div className="p-6">
                            <Link to={`/courses/${course.id}`} className="block">
                                <h3 className="text-xl font-semibold">{course.title}</h3>
                                <p className="text-gray-600">Instructor: {course.instructor?.fullName || 'N/A'}</p>
                                <div className="flex items-center text-yellow-500 my-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < Math.floor(course.rating || 0) ? "text-lg" : "text-lg text-gray-300"}
                                        />
                                    ))}
                                    <span className="text-gray-600 text-sm ml-2">({course.rating || 0})</span>
                                </div>
                                <p className="text-lg font-bold text-blue-600">{course.price} с</p>
                            </Link>
                            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-center hover:bg-blue-700 transition">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursesPage;
