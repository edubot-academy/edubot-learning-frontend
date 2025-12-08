import { useState, useEffect, useContext } from 'react';
import StickyButton from '@shared/ui/StickyButton';
import { fetchCourses } from '@services/api';
import Benefits from '@features/marketing/components/Benefits';
import Feedback from '@features/marketing/components/Feedback';
import HeroStart from '@features/marketing/components/HeroStart';
import Apply from '@features/marketing/components/Apply';
import Instructor from '@features/ratings/components/TopInstructors';
import FAQ from '@features/marketing/components/FAQ';
import TopCourses from '@features/courses/components/TopCourses';
import { AuthContext } from '@app/providers';

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
                console.error('Failed to fetch courses', err);
            }
        };
        loadCourses();
    }, []);

    return (
        <div>
            <HeroStart />
            <StickyButton />
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
