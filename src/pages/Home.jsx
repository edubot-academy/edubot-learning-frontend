import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { fetchCourses } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Benefits from "../components/Benefits";
import SectionContainer from "../components/SectionContainer";
import Feedback from "../components/Feedback";
import Evaluate from '../components/Evaluate';
import HeroStart from "../components/HeroStart";
import Apply from "../components/Apply";
import Contact from "../components/Contacts";
import Instructor from "../components/TopInstructors"
import FAQ from "../components/FAQ";
import TopCourses from "../components/TopCourses";

const HomePage = () => {
    const { user } = useContext(AuthContext);
    // const [cart, setCart] = useState([]);
    const [coursesData, setCoursesData] = useState([]);

    // const addToCart = (course) => {
    //     setCart([...cart, course]);
    // };

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
        <div>
            <HeroStart />
            <Benefits />
            <TopCourses coursesData={coursesData} />
            <Instructor />
            <Feedback />
            <Apply />
            {/* <Evaluate /> */}
            <Contact />
            <FAQ />
        </div>
    );
};

export default HomePage;
