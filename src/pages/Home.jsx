import { useState, useEffect } from 'react';
import StickyButton from '@shared/ui/StickyButton';
import { fetchTopCourses } from '@services/api';
import Benefits from '@features/marketing/components/Benefits';
import Feedback from '@features/marketing/components/Feedback';
import HeroStart from '@features/marketing/components/HeroStart';
import Apply from '@features/marketing/components/Apply';
import Instructor from '@features/ratings/components/TopInstructors';
import FAQ from '@features/marketing/components/FAQ';
import TopCourses from '@features/courses/components/TopCourses';
import TopLearnersHome from '@features/leaderboard/components/TopLearnersHome';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation();
    const [coursesData, setCoursesData] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [coursesError, setCoursesError] = useState('');

    useEffect(() => {
        const loadTopCourses = async () => {
            setCoursesLoading(true);
            setCoursesError('');
            try {
                const data = await fetchTopCourses();
                setCoursesData(Array.isArray(data?.items) ? data.items : []);
            } catch (err) {
                console.error('Failed to fetch courses', err);
                setCoursesError(t('public.home.topCoursesLoadError'));
            } finally {
                setCoursesLoading(false);
            }
        };
        loadTopCourses();
    }, [t]);

    return (
        <div className="bg-white text-[#141619] dark:bg-[#222222] dark:text-[#E8ECF3]">
            <HeroStart />
            <StickyButton />
            <Benefits />
            <TopCourses coursesData={coursesData} loading={coursesLoading} error={coursesError} />
            <TopLearnersHome />
            <Instructor />
            <Apply />
            <Feedback />
            <FAQ />
        </div>
    );
};

export default HomePage;
