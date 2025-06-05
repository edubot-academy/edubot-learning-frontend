import { FaStar } from "react-icons/fa";
import BasketLogo from "../assets/images/basket.png"


const Basket = () => {
  const courses = [
    {
      id: 1,
      title: "Колдонуучу тажрыйбасын толуктоо аркылуу киришүү",
      author: "John Doe",
      rating: 4.6,
      totalRatings: 250,
      totalHours: 22,
      totalLectures: 155,
      level: "All levels",
      price: 11000,

    },
    {
      id: 2,
      title: "Колдонуучу тажрыйбасын толуктоо аркылуу киришүү",
      author: "John Doe",
      rating: 4.6,
      totalRatings: 250,
      totalHours: 22,
      totalLectures: 155,
      level: "All levels",
      price: 11000,

    },

    {
      id: 3,
      title: "Колдонуучу тажрыйбасын толуктоо аркылуу киришүү",
      author: "John Doe",
      rating: 4.6,
      totalRatings: 250,
      totalHours: 22,
      totalLectures: 155,
      level: "All levels",
      price: 11000,

    },

  ];



  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-7 pl-4 sm:pl-[70px] pt-4">
        <h1 className="text-[32px] font-bold relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[4px] pb-2">
          Себет
        </h1>
        <div className="flex items-center gap-3 space-x- text-sm text-gray-500 cursor-pointer">
          <span>Башкы бет</span>
          <span>›</span>
          <span className="text-teal-500">себет</span>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[80px] px-4 lg:pl-[70px] py-8">
      

        <div className="w-full ">
          <h2 className="font-normal text-sm font-inter mb-2 border-b border-gray-200 pb-2">
            Себетте {courses.length} курс бар
          </h2>

          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-md p-4 mb-4 shadow-sm"
            >
              <img
                src={BasketLogo}
                alt=""
                className="w-full sm:w-[150px] h-auto object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="text-base font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600">By {course.author}</p>

                <div className="flex flex-wrap items-center text-sm mt-1">
                  <span className="text-yellow-500">{course.rating}</span>
                  <div className="flex ml-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar
                        key={i}
                        className={i <= Math.round(course.rating) ? "text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 ml-2">({course.totalRatings} rating)</span>
                </div>

                <div className="text-gray-500 text-xs mt-1">
                  {course.totalHours} Total Hours • {course.totalLectures} Lectures • {course.level}
                </div>

                <div className="flex gap-4 mt-2 text-sm text-blue-500">
                  <button className="hover:underline">Save for later</button>
                  <button className="hover:underline text-red-500">Remove</button>
                </div>
              </div>
              <div className="w-full sm:w-[310px] h-[52px] rounded-[10px] bg-[#F17E22] sm:bg-transparent flex items-center justify-center text-white sm:text-black text-lg font-semibold sm:ml-auto">{course.price} сом</div>
            </div>
          ))}
        </div>



      <div className="mt-5 mr-4">
        <h3 className="font-normal text-[14px] leading-[21px] tracking-[0%] font-inter mb-2">Заказ тууралуу толук маалымат</h3>
        <div className="flex flex-col font-normal text-[14px] leading-[21px] tracking-[0%] font-inter mb-2 ">
          <span >Жыйынтык:</span>
          <span className="font-medium text-[32px] leading-[160%] tracking-[0%] font-inter">135.00 $</span>
        </div>
        <button className="bg-orange-500 text-white w-[334px] h-[56px] rounded-[20px] px-[54px] py-[22px] hover:bg-orange-600 transition flex items-center justify-center">
          Сатып алууга өтүү
        </button>
      </div>
    </div>
    </div>
  )
}

export default Basket

