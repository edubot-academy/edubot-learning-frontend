import React from "react";
import SectionContainer from "../components/SectionContainer";
import CardCourse from "../components/CardCourse";

const TopCourses = ({ coursesData }) => {
  return (
    <SectionContainer
      title="Топ курстар"
      subtitle="Подборка самых востребованных и эффективных обучающих программ."
      buttonText="Бардыгын көрүү"
      data={coursesData}
      CardComponent={CardCourse}
    />
  );
};

export default TopCourses;
