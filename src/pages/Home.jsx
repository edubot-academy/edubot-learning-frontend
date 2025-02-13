import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/edubot-logo.jpeg";
import { FaShoppingCart, FaUserCircle, FaStar, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaBars, FaTimes, FaQuoteLeft } from "react-icons/fa";

const HomePage = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);

    const addToCart = (course) => {
        setCart([...cart, course]);
    };

    const coursesData = [
        { id: 1, title: "Web Development", instructor: "John Doe", level: "Beginner", price: 19.99, originalPrice: 99.99, rating: 4.8, students: "10,000+", image: "https://source.unsplash.com/400x250/?coding" },
        { id: 2, title: "Data Science", instructor: "Jane Smith", level: "Intermediate", price: 29.99, originalPrice: 109.99, rating: 4.7, students: "12,000+", image: "https://source.unsplash.com/400x250/?data" },
        { id: 3, title: "Artificial Intelligence", instructor: "Alice Johnson", level: "Advanced", price: 39.99, originalPrice: 119.99, rating: 4.9, students: "8,500+", image: "https://source.unsplash.com/400x250/?ai" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-32 text-center">
                <div className="w-full px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
                        Learn, Grow, and Succeed with Edubot Learning
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        Interactive learning designed to help you master new skills, anytime, anywhere.
                    </p>
                    <Link to="/courses" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                        Browse Courses
                    </Link>
                </div>
            </section>
            {/* Key Features & Benefits */}
            <section className="py-16 bg-gray-100 text-center">
                <h2 className="text-4xl font-bold mb-8">Why Choose Edubot Learning?</h2>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-xl font-semibold">AI-Powered Learning</h3>
                        <p className="text-gray-600 mt-2">Personalized courses tailored to your learning pace and style.</p>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-xl font-semibold">Expert Instructors</h3>
                        <p className="text-gray-600 mt-2">Learn from industry professionals with real-world experience.</p>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <h3 className="text-xl font-semibold">Flexible Learning</h3>
                        <p className="text-gray-600 mt-2">Access courses anytime, anywhere, on any device.</p>
                    </div>
                </div>
            </section>
            {/* Course Categories & Popular Courses */}
            <section className="py-16 bg-white text-center">
                <h2 className="text-4xl font-bold mb-8">Explore Our Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                    {coursesData.map((course) => (
                        <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                            <Link to={`/courses/${course.id}`} className="block">
                                <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                                <div className="p-6 text-left">
                                    <h3 className="text-xl font-semibold mb-1">{course.title}</h3>
                                    <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                                    <div className="flex items-center text-yellow-500 my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < Math.floor(course.rating) ? "text-lg" : "text-lg text-gray-300"} />
                                        ))}
                                        <span className="text-gray-600 text-sm ml-2">({course.rating})</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-600">${course.price}</p>
                                </div>
                            </Link>
                            <div className="p-6 text-center">
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <main className="flex-grow">
                <section className="py-16 bg-white text-center">
                    <h2 className="text-4xl font-bold mb-8">Featured Courses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                        {coursesData.map((course) => (
                            <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                                <Link to={`/courses/${course.id}`} className="block">
                                    <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                                    <div className="p-6 text-left">
                                        <h3 className="text-xl font-semibold mb-1">{course.title}</h3>
                                        <p className="text-sm text-gray-600">By {course.instructor}</p>
                                        <p className="text-sm text-gray-600 mb-4">{course.students} students enrolled</p>
                                        <div className="flex items-center text-yellow-500 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={i < Math.floor(course.rating) ? "text-sm" : "text-sm text-gray-300"} />
                                            ))}
                                            <span className="text-gray-600 text-sm ml-2">({course.rating})</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-blue-600">${course.price} <span className="line-through text-gray-500">${course.originalPrice}</span></span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-6 text-center">
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Testimonials */}
            <section className="py-16 bg-gray-100 text-center">
                <h2 className="text-4xl font-bold mb-8">What Our Learners Say</h2>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <FaQuoteLeft className="text-blue-500 text-3xl mb-4" />
                        <p className="text-gray-600">"Edubot Learning has completely transformed my career. The interactive courses and AI-powered recommendations helped me land my dream job!"</p>
                        <h3 className="text-xl font-semibold mt-4">- Jane Doe</h3>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <FaQuoteLeft className="text-blue-500 text-3xl mb-4" />
                        <p className="text-gray-600">"The instructors are top-notch, and the flexibility of learning at my own pace made a huge difference. Highly recommended!"</p>
                        <h3 className="text-xl font-semibold mt-4">- Mark Johnson</h3>
                    </div>
                </div>
            </section>

            {/* Sign-Up Section */}
            <section className="py-20 bg-blue-600 text-white text-center">
                <h2 className="text-4xl font-bold mb-6">Join Thousands of Learners Today!</h2>
                <p className="text-lg max-w-2xl mx-auto mb-6">Access premium courses, get AI-powered recommendations, and earn certificates.</p>
                <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                    Sign Up Now
                </Link>
            </section>


            {/* Contact & Support */}
            <section className="py-16 bg-white text-center">
                <h2 className="text-4xl font-bold mb-8">Need Help? Get in Touch</h2>
                <p className="text-lg max-w-2xl mx-auto mb-6">Our support team is available 24/7 to answer your questions.</p>
                <Link to="/contact" className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition">Contact Us</Link>
            </section>
        </div>
    );
};

export default HomePage;