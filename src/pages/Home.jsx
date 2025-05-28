import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { fetchCourses } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import HeroStart from "../components/HeroStart";

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

           <Benefits/>

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

            {/* Testimonials */}
            <section className="py-16 bg-gray-100 text-center">
                <h2 className="text-4xl font-bold mb-8">Биздин үйрөнүүчүлөр эмне дешет?</h2>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <p className="text-gray-600">"Edubot Learning менин карьерамды толугу менен өзгөрттү. Интерактивдүү курстар жана AI сунуштары мага кыялымдагы жумушту табууга жардам берди!"</p>
                        <h3 className="text-xl font-semibold mt-4">- Жейн Доэ</h3>
                    </div>
                    <div className="p-6 bg-white shadow-lg rounded-lg">
                        <p className="text-gray-600">"Окутуучулар мыкты, жана өз ыргагым менен үйрөнүү мүмкүнчүлүгү чоң айырма жаратты. Сунуштайм!"</p>
                        <h3 className="text-xl font-semibold mt-4">- Марк Жонсон</h3>
                    </div>
                </div>
            </section>

            {/* Sign-Up Section - Only for Unauthenticated Users */}
            {!user && (
                <section className="py-20 bg-blue-600 text-white text-center">
                    <h2 className="text-4xl font-bold mb-6">Бүгүн миңдеген үйрөнүүчүлөргө кошулуңуз!</h2>
                    <p className="text-lg max-w-2xl mx-auto mb-6">Премиум курстарга мүмкүнчүлүк алыңыз, AI сунуштарын алыңыз жана сертификаттарга ээ болуңуз.</p>
                    <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                        Катталуу
                    </Link>
                </section>
            )}

            {/* Contact & Support */}
            <section className="py-16 bg-white text-center">
                <h2 className="text-4xl font-bold mb-8">Жардам керекпи? Биз менен байланышыңыз</h2>
                <p className="text-lg max-w-2xl mx-auto mb-6">Биздин колдоо командасы 24/7 сиздин суроолоруңузга жооп берет.</p>
                <Link to="/contact" className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition">Байланышуу</Link>
            </section>
        </div>
    );
};

export default HomePage;
