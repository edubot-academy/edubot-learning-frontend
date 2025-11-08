import React from "react";
import SectionContainer from "../components/SectionContainer";
import CardCourse from "../components/CardCourse";

const TopCourses = ({ courses }) => {
  return (
    <SectionContainer
      title="Топ курстар"
      subtitle="Подборка самых востребованных и эффективных обучающих программ."
      buttonText="Бардыгын көрүү"
      data={courses}
      CardComponent={CardCourse}
    />
  );
};

export default TopCourses;
