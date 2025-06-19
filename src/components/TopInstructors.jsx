import instructorImg from "../assets/images/instructor.png"
import StarImg from "../assets/icons/star.svg"

const instructors = [
  {
    img: instructorImg,
    name: "Рональд Ричардс",
    position: "UI/UX Designer",
    rating: "4.9",
    students: "2400",
  },
  {
    img: instructorImg,
    name: "Рональд Ричардс",
    position: "UI/UX Designer",
    rating: "4.9",
    students: "2400",
  },
  {
    img: instructorImg,
    name: "Рональд Ричардс",
    position: "UI/UX Designer",
    rating: "4.9",
    students: "2400",
  },
  {
    img: instructorImg,
    name: "Рональд Ричардс",
    position: "UI/UX Designer",
    rating: "4.9",
    students: "2400",
  },
]

const TopInstructors = () => {
  return (
    <div className="bg-[#002C37] px-4 py-10 sm:px-6 lg:px-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
        Топ Инструкторы
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        {instructors.map((instructor, index) => (
          <div
            key={index}
            className="w-[305px] h-[340px] bg-white shadow-md rounded-xl flex flex-col items-center overflow-hidden"
          >
            <img
              src={instructor.img}
              alt={instructor.name}
              className="w-[265px] h-[198px] object-cover mt-4 rounded-[10px]"
            />

            <div className="text-center mt-3">
              <h3 className="text-lg font-semibold text-black">{instructor.name}</h3>
              <p className="text-sm pt-2 text-gray-500">{instructor.position}</p>
            </div>

            <div className="w-[265px] mt-4 border-t border-gray-300" />

            <div className="w-[265px] flex justify-between items-center mt-2 px-1">
              <div className="flex items-center gap-1">
                <img src={StarImg} alt="звезда" className="w-5 h-5" />
                <span className="text-sm text-black">{instructor.rating}</span>
              </div>
              <span className="text-sm text-gray-500">{instructor.students} студентов</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopInstructors
 