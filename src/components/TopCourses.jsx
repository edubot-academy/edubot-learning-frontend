import React from "react";
import SectionContainer from "../components/SectionContainer";
import CardCourse from "../components/CardCourse";
import Button from "./UI/Button";

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
