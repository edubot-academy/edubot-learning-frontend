import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { fetchCourses } from "../services/api";
import SectionContainer from "../components/SectionContainer";
import CoursesSection from "../components/CoursesSection";

// import { FiSearch } from "react-icons/fi";
// import CourseDescription from "../components/CourseDescription";

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

  console.log(courses.length);

  const filteredCourses = courses.filter(
    (course) =>
      course.isPublished && (filter === "All" || course.level === filter)
  );

  if (loading) return <div className="pt-[50px]">Курстар жүктөлүүдө...</div>;

  return (
    <div className="min-h-screen  bg-gray-50 p-6 pt-0">
      <div className="ml-10 mt-5">
        <h1 className="text-4xl font-bold text-start mb-0">Биздин курстар</h1>
        <p className="font-inter text-sm md:text-base lg:text-lg">
          Сиз үчүн сунушталган курстар
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-12">
        {courses.length < 4 ? (
          <SectionContainer
            title={""}
            CardComponent={null}
            buttonText={null}
            subtitle={""}
            hideTitleAndLink={false}
            data={courses}
            rightContent={null}
          />
        ) : (
          <CoursesSection>
            <SectionContainer
              title={""}
              CardComponent={null}
              buttonText={null}
              subtitle={""}
              hideTitleAndLink={false}
              rightContent={null}
              data={courses}
            />
          </CoursesSection>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
