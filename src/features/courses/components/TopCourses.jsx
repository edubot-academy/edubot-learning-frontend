import React from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';

const TopCourses = ({ coursesData }) => {
    const showButton = coursesData.length >= 3;

    return (
        <SectionContainer
            title={
                <span className="text-lg md:text-4xl">
                    Топ курстар
                </span>
            }
            subtitle={
                <span className="text-sm sm:text-base md:text-lg">
                    Эң таанымал жана эффективдүү окуу программаларынын тандоосу.
                </span>
            }
            rightContent={
                showButton && (
                    <Link to="/courses">
                        <Button variant='secondary'>
                            Бардыгын көрүү
                        </Button>
                    </Link>
                )
            }
            items={coursesData}
            CardComponent={CardCourse}
        />
    );
};

export default TopCourses;