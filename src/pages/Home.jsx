import React, { useState, useEffect, useContext } from 'react';
// import StickyButton from '@shared-ui/UI/StickyButton';
import { fetchTopCourses } from '@services/api';
import { AuthContext } from '../context/AuthContext';
import Benefits from '@features/marketing/components/Benefits';
import Feedback from '@features/marketing/components/Feedback';
import HeroStart from '@features/marketing/components/HeroStart';
import Apply from '@features/marketing/components/Apply';
import Instructor from '@features/ratings/components/TopInstructors';
import FAQ from '@features/marketing/components/FAQ';
import TopCourses from '@features/courses/components/TopCourses';

const HomePage = () => {
    const { user } = useContext(AuthContext);
    // const [cart, setCart] = useState([]);
    const [coursesData, setCoursesData] = useState([]);

    // const addToCart = (course) => {
    //     setCart([...cart, course]);
    // };

    useEffect(() => {
        const loadTopCourses = async () => {
            try {
                const data = await fetchTopCourses();
                setCoursesData(data.items);
            } catch (err) {
                console.error('Failed to fetch courses', err);
            }
        };
        loadTopCourses();
    }, []);

    return (
        <div>
            <HeroStart />
            {/* <StickyButton /> */}
            <Benefits />
            <TopCourses coursesData={coursesData} />
            <Instructor />
            <Apply />
            <Feedback />
            {/* <Evaluate /> */}
            <FAQ />
        </div>
    );
};

export default HomePage;
