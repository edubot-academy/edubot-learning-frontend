import React from "react";
import SectionContainer from "../components/SectionContainer";
import CardInstructor from "../components/CardInstrictor";
import instructorImg from "../assets/images/instructor.png";

const instructors = [
  { img: instructorImg, name: "Рональд Ричардс", position: "UI/UX Designer", rating: "4.9", students: "2400" },
  { img: instructorImg, name: "Джейн Доу", position: "Frontend Developer", rating: "4.8", students: "1800" },
  { img: instructorImg, name: "Майкл Смит", position: "Product Designer", rating: "4.7", students: "2000" },
];

const TopInstructors = () => {
  return (
    <SectionContainer
      title="Топ Инструктор"
      subtitle="Подборка самых востребованных и эффективных обучающих программ."
      buttonText="Бардыгын көрүү"
      data={instructors}
      CardComponent={CardInstructor}
    />
  );
};

export default TopInstructors;
