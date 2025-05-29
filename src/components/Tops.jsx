import TopCards from "./TopCards"
import programmerImg from "../assets/images/photoprogrammer.png"
import StarImg from "../assets/icons/stars.svg"

const Tops = () => {
  const courses = [
    {
      img: programmerImg,
      title: "Руководство для начинающих по UI/UX дизайну",
      description: "Рональд Ричардс",
      imgg: StarImg,
      ratingCount: 1200,
    },
    {
      img: programmerImg,
      title: "Руководство для начинающих по UI/UX дизайну",
      description: "Рональд Ричардс",
      imgg: StarImg,
      ratingCount: 1200,
    },
    {
      img: programmerImg,
      title: "UX/UI Руководство для начинающих по UI/UX дизайну",
      description: "Рональд Ричардс",
      imgg: StarImg,
      ratingCount: 1200,
    },
    {
      img: programmerImg,
      title: "Python курсы",
      description: "Подходит для анализа данных и автоматизации.",
      imgg: StarImg,
      ratingCount: 1200,
    },
  ]

  return (
    <div className="bg-[#002C37] text-white px-4 py-8 sm:px-6 lg:px-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
        Топ Курстар
      </h2>

      <div className="flex justify-end mb-6">
        <p className="text-sm  cursor-pointer text-orange-500"> Увидеть все</p>
      </div>

      {/* Карточки по центру, адаптивные */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {courses.slice(0, 3).map((course, index) => (
          <TopCards
            key={index}
            img={course.img}
            title={course.title}
            description={course.description}
            star={course.imgg}
            ratingCount={course.ratingCount}
          />
        ))}
      </div>
    </div>
  )
}

export default Tops
