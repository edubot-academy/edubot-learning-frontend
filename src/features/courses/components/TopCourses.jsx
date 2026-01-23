import React from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';

const TopCourses = ({ coursesData }) => {
    return (
        <SectionContainer
            title="Топ курстар"
            subtitle="Эң таанымал жана эффективдүү окуу программаларынын тандоосу."
            rightContent={
                <Link
                    to="/courses"
                    className=""
                >
                    <Button variant='secondary' disabled>
                        Бардыгын көрүү
                    </Button>
                </Link>
            }
            items={coursesData}
            CardComponent={CardCourse}
        />
    );
};

export default TopCourses;
