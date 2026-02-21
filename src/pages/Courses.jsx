import React, { useState, useEffect } from 'react';
import { fetchCatalogCourses } from '@services/api';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from '@features/courses/components/CardCourse';
import Loader from '@shared/ui/Loader';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await fetchCatalogCourses();
                setCourses(data.items);
            } catch (err) {
                console.error('Курстар жүктөлбөй калды', err);
            } finally {
                setLoading(false);
            }
        };

        loadCourses();
    }, []);

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="min-h-screen p-6 pt-0">
            <div className="ml-10 mt-5">
                <h1 className="text-4xl font-bold text-start mb-0">Биздин курстар</h1>
                <p className="font-inter text-sm md:text-base lg:text-lg">
                    Сиз үчүн сунушталган курстар
                </p>
            </div>

            <div className="px-4 sm:px-6 lg:px-12">
                <SectionContainer
                    title={''}
                    CardComponent={CardCourse}
                    buttonText={null}
                    subtitle={''}
                    hideTitleAndLink={false}
                    items={courses}
                    rightContent={null}
                />
            </div>
        </div>
    );
};

export default CoursesPage;
