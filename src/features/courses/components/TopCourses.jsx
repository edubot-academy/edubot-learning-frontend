import React from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import Button from '@shared/ui/Button';

const TopCourses = ({ coursesData }) => {
    return (
        <SectionContainer
            title="Топ курстар"
            subtitle="Подборка самых востребованных и эффективных обучающих программ."
            rightContent={<Button variant="secondary">Бардыгын көрүү</Button>}
            data={coursesData}
            CardComponent={CardCourse}
        />
    );
};

export default TopCourses;
