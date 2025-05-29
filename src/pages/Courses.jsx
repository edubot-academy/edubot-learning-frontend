import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { fetchCourses } from "../services/api";
import Tops from "../components/Tops";
import CoursesSection from "../components/CoursesSection";
import { FiSearch } from "react-icons/fi";

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
        console.error("Курстар жүктөлбөй калды", err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.isPublished && (filter === "All" || course.level === filter)
  );

  if (loading) return <div className="pt-24 p-6">Курстар жүктөлүүдө...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <h1 className="text-4xl font-bold text-center mb-6">Биздин курстар</h1>
      <div className="w-full max-w-[431px] h-[51px] mx-auto flex items-center border border-gray-500 rounded-3xl mb-8 px-3">
        <FiSearch className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Курсту издоо"
          className="flex-grow px-3 py-2 outline-none border-none bg-transparent text-sm sm:text-base"
        />
      </div>
      <div className="px-4 sm:px-6 lg:px-12">
        <CoursesSection title="Сиз үчүн сунушталган курстар">
          <Tops noBg hideTitleAndLink />
        </CoursesSection>

        <CoursesSection title="Жаңы жарыяланган курстар">
          <Tops noBg hideTitleAndLink />
        </CoursesSection>

        <CoursesSection title="Эң популярдуу курстар">
          <Tops noBg hideTitleAndLink />
        </CoursesSection>
        <CoursesSection title="Эң мыкты акысыз онлайн курстар">
          <Tops noBg hideTitleAndLink />
        </CoursesSection>
      </div>

      {/* {filteredCourses.length === 0 ? (
                <div className="text-center text-gray-500 text-lg">
                    Тандалган категория боюнча курстар табылган жок.
                </div>
            ) : (
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
                                    <p className="text-gray-600">Окутуучу: {course.instructor?.fullName || 'Белгисиз'}</p>
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
                            </div>
                        </div>
                    ))}
                </div>
            )  } */}
    </div>
  );
};

export default CoursesPage;
