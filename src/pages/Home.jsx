import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { fetchCourses } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Benefits from "../components/Benefits";
import Feedback from "../components/Feedback";
import Evaluate from '../components/Evaluate';
import HeroStart from "../components/HeroStart";
import Apply from "../components/Apply";
import Contact from "../components/Contacts";

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState([]);
    const [coursesData, setCoursesData] = useState([]);

    const addToCart = (course) => {
        setCart([...cart, course]);
    };

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await fetchCourses();
                const filteredCourses = data.courses.filter((course) => course.isPublished);
                setCoursesData(filteredCourses);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            }
        };
        loadCourses();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Каармандардын Секциясы */}

            <HeroStart />

            <Benefits />

            {/* Курстар Секциясы */}
            <section className="py-16 bg-white text-center">
                <div className="flex justify-between items-center px-4 sm:px-6 py-2 mb-4">
                    <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
                        Биздин курстарды изилдеңиз
                    </h2>
                    <Link
                        to="/courses"
                        className="text-blue-600 text-sm font-medium hover:underline whitespace-nowrap"
                    >
                        Баарын көрүү
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                    {coursesData.slice(0, 3).map((course) => (
                        <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                            <Link to={`/courses/${course.id}`} className="block">
                                <img src={course.coverImageUrl || "https://source.unsplash.com/400x250/?education"} alt={course.title} className="w-full h-40 object-cover" />
                                <div className="p-6 text-left">
                                    <h3 className="text-xl font-semibold mb-1">{course.title}</h3>
                                    <p className="text-sm text-gray-600">Окутуучу: {course.instructor?.fullName}</p>
                                    <div className="flex items-center text-yellow-500 my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < Math.floor(course.rating) ? "text-lg" : "text-lg text-gray-300"} />
                                        ))}
                                        <span className="text-gray-600 text-sm ml-2">({course.rating})</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-600">{course.price} с</p>
                                </div>
                            </Link>

                        </div>
                    ))}
                </div>
            </section>
            <Feedback />
            <div className="m-auto h-0.5 w-[1240px] bg-gray-400"></div>
            <Apply />
            <Evaluate />
            <Contact />
        </div>
    );
};

export default HomePage;
