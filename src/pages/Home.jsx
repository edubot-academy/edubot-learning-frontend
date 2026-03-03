import React, { useState, useEffect } from 'react';
import StickyButton from '@shared/ui/StickyButton';
import { fetchTopCourses } from '@services/api';
import Benefits from '@features/marketing/components/Benefits';
import Feedback from '@features/marketing/components/Feedback';
import HeroStart from '@features/marketing/components/HeroStart';
import Apply from '@features/marketing/components/Apply';
import Instructor from '@features/ratings/components/TopInstructors';
import FAQ from '@features/marketing/components/FAQ';
import TopCourses from '@features/courses/components/TopCourses';
import LeaderBoard from '@features/student/LeaderBoard';

const HomePage = () => {
    const [coursesData, setCoursesData] = useState([]);

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
        <div className="bg-white text-[#141619] dark:bg-[#222222] dark:text-[#E8ECF3]">
            <HeroStart />
            <StickyButton />
            <Benefits />
            <TopCourses coursesData={coursesData} />
            <LeaderBoard/>
            <Instructor />
            <Apply />
            <Feedback />
            <FAQ />
        </div>
    );
};

export default HomePage;
