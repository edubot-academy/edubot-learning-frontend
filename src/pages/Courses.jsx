import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const coursesData = [
    { id: 1, title: "Web Development", instructor: "John Doe", level: "Beginner", price: 19.99, rating: 4.8, image: "https://source.unsplash.com/400x250/?coding" },
    { id: 2, title: "Data Science", instructor: "Jane Smith", level: "Intermediate", price: 29.99, rating: 4.7, image: "https://source.unsplash.com/400x250/?data" },
    { id: 3, title: "Artificial Intelligence", instructor: "Alice Johnson", level: "Advanced", price: 39.99, rating: 4.9, image: "https://source.unsplash.com/400x250/?ai" },
];

const CoursesPage = () => {
    const [filter, setFilter] = useState("All");

    const filteredCourses = coursesData.filter((course) =>
        filter === "All" || course.level === filter
    );

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
                    <div key={course.id} className="block bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                        <Link to={`/courses/${course.id}`}>
                            <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                        </Link>
                        <div className="p-6">
                            <h3 className="text-xl font-semibold">{course.title}</h3>
                            <p className="text-gray-600">Instructor: {course.instructor}</p>
                            <div className="flex items-center text-yellow-500 my-2">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < Math.floor(course.rating) ? "text-lg" : "text-lg text-gray-300"} />
                                ))}
                                <span className="text-gray-600 text-sm ml-2">({course.rating})</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600">${course.price}</p>
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
