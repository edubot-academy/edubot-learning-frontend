import React from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import { Link } from 'react-router-dom';

const TopCourses = ({ coursesData }) => {
    return (
        <SectionContainer
            title="Топ курстар"
            subtitle="Эң таанымал жана эффективдүү окуу программаларынын тандоосу."
            rightContent={
                <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 rounded-lg font-medium text-base px-5 py-3 transition-all duration-300 border border-[#2A2E35] text-[#E8ECF3] hover:bg-[#EA580C] hover:border-[#EA580C] hover:text-white active:scale-95 lg:text-xs md:text-base disabled:bg-transparent disabled:border-[#C5C9D1] disabled:text-[#C5C9D1] disabled:cursor-not-allowed"
                >
                    Бардыгын көрүү
                </Link>
            }
            items={coursesData}
            CardComponent={CardCourse}
        />
    );
};

export default TopCourses;
