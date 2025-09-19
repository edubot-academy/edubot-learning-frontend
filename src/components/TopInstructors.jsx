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
    <div className="bg-white px-4 py-10 sm:px-6 lg:px-12">
      <div className="flex items-center justify-between gap-10 text-black mb-12">
  <div className="w-[640px]">
    <h2 className="font-suisse font-bold text-[44px] leading-[44px] tracking-[0.01em] mb-[26px]">
     Топ Инструктор
    </h2>
    <p className="font-suisse font-normal text-[26px] leading-[120%] tracking-normal">
      Подборка самых востребованных и эффективных обучающих программ.
    </p>
  </div>

  <button className="w-[373px] h-[72px] rounded-lg border border-[#141619] py-6 px-11">
    Бардыгын көрүү
  </button>
</div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
  {instructors.map((instructor, index) => (
    <div
      key={index}
      className="w-[305px] h-[340px] bg-white shadow-md rounded-xl flex flex-col overflow-hidden"
    >
      <img
        src={instructor.img}
        alt={instructor.name}
        className="w-[265px] h-[198px] object-cover mx-auto mt-4 rounded-[10px]"
      />

      <div className="mt-3 px-2 flex-grow">
        <h3 className="text-lg font-semibold text-black">{instructor.name}</h3>
        <p className="text-sm pt-2 text-gray-500">{instructor.position}</p>
      </div>

      <div className="w-[265px] flex justify-between items-center mt-auto px-1 pb-4">
        <div className="flex items-center gap-1">
          <img src={StarImg} alt="звезда" className="w-5 h-5" />
          <span className="text-sm text-black">{instructor.rating}</span>
        </div>
        <span className="text-sm text-gray-500">
          ({instructor.students} студентов)
        </span>
      </div>
    </div>
  ))}
</div>

    </div>
  )
}

export default TopInstructors
 