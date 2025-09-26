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
  <div className="">
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

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 ">
  {instructors.slice(0,3).map((instructor, index) => (
    <div
      key={index}
      className="bg-white shadow-md rounded-xl flex flex-col overflow-hidden  px-[24px] py-[29px] border-[1px] border-[#C5C9D1] "
    >
      <img
        src={instructor.img}
        alt={instructor.name}
        className="w-[450px] h-[400px] object-cover rounded-[4px]"
      />

      <div className="">
        <h3 className="text-lg font-semibold text-black mt-[24px] mb-[18px]">{instructor.name}</h3>
        <p className="text-sm pt-2 text-gray-500">{instructor.position}</p>
      </div>

      <div className="flex mt-[30px] mb-[20px] gap-2">
        <div className="flex items-center gap-1 ">
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
 